// Global variables
let model;
let trainingData = {};
let isTraining = false;

// Initialize when window loads
window.onload = async function() {
    try {
        updateStatus('Loading MovieLens data...', 10);
        
        // Load data
        await loadData();
        updateStatus('Data loaded! Populating dropdowns...', 30);
        
        // Populate dropdowns
        populateUserDropdown();
        populateMovieDropdown();
        updateStatus('Dropdowns populated. Starting model training...', 50);
        
        // Train model
        await trainModel();
        
        updateStatus('Model trained and ready for predictions!', 100);
        document.getElementById('predict-btn').disabled = false;
        
    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus('Error during initialization: ' + error.message, 0);
    }
};

function updateStatus(message, progress) {
    const statusElement = document.querySelector('.status-message');
    const progressElement = document.querySelector('.progress-fill');
    const resultElement = document.getElementById('result');
    
    if (statusElement) statusElement.textContent = message;
    if (progressElement) progressElement.style.width = progress + '%';
    if (resultElement) resultElement.innerHTML = `<p>${message}</p>`;
}

function populateUserDropdown() {
    const userSelect = document.getElementById('user-select');
    userSelect.innerHTML = '';
    
    // Create array of user IDs and sort numerically
    const userIds = Array.from(new Set(ratings.map(r => r.userId)))
        .sort((a, b) => a - b);
    
    userIds.forEach(userId => {
        const option = document.createElement('option');
        option.value = userId;
        option.textContent = `User ${userId}`;
        userSelect.appendChild(option);
    });
}

function populateMovieDropdown() {
    const movieSelect = document.getElementById('movie-select');
    movieSelect.innerHTML = '';
    
    // Movies are already sorted alphabetically from data.js
    movies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.id;
        option.textContent = `${movie.title}${movie.year ? ` (${movie.year})` : ''}`;
        movieSelect.appendChild(option);
    });
}

function createModel(numUsers, numMovies, latentDim = 10) {
    console.log(`Creating model with ${numUsers} users, ${numMovies} movies, latent dimension: ${latentDim}`);
    
    // Input layers
    const userInput = tf.input({shape: [1], name: 'userInput'});
    const movieInput = tf.input({shape: [1], name: 'movieInput'});
    
    // Embedding layers
    const userEmbedding = tf.layers.embedding({
        inputDim: numUsers + 1, // +1 because user IDs start from 1
        outputDim: latentDim,
        name: 'userEmbedding'
    }).apply(userInput);
    
    const movieEmbedding = tf.layers.embedding({
        inputDim: numMovies + 1, // +1 because movie IDs start from 1
        outputDim: latentDim,
        name: 'movieEmbedding'
    }).apply(movieInput);
    
    // Reshape embeddings to remove the extra dimension
    const userVector = tf.layers.flatten().apply(userEmbedding);
    const movieVector = tf.layers.flatten().apply(movieEmbedding);
    
    // Dot product of user and movie vectors
    const dotProduct = tf.layers.dot({axes: 1}).apply([userVector, movieVector]);
    
    // Add bias terms
    const userBias = tf.layers.embedding({
        inputDim: numUsers + 1,
        outputDim: 1,
        name: 'userBias'
    }).apply(userInput);
    
    const movieBias = tf.layers.embedding({
        inputDim: numMovies + 1,
        outputDim: 1,
        name: 'movieBias'
    }).apply(movieInput);
    
    const flattenedUserBias = tf.layers.flatten().apply(userBias);
    const flattenedMovieBias = tf.layers.flatten().apply(movieBias);
    
    // Combine dot product with biases
    const prediction = tf.layers.add().apply([
        dotProduct,
        flattenedUserBias,
        flattenedMovieBias
    ]);
    
    // Create model
    const model = tf.model({
        inputs: [userInput, movieInput],
        outputs: prediction
    });
    
    return model;
}

async function trainModel() {
    if (isTraining) {
        console.log('Model is already training...');
        return;
    }
    
    isTraining = true;
    
    try {
        updateStatus('Creating model architecture...', 60);
        
        // Create model
        model = createModel(numUsers, numMovies, 10);
        
        updateStatus('Compiling model...', 65);
        
        // Compile model
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mse']
        });
        
        // Prepare training data
        updateStatus('Preparing training data...', 70);
        
        const userIds = ratings.map(r => r.userId);
        const movieIds = ratings.map(r => r.movieId);
        const ratingValues = ratings.map(r => r.rating);
        
        const userTensor = tf.tensor2d(userIds, [userIds.length, 1]);
        const movieTensor = tf.tensor2d(movieIds, [movieIds.length, 1]);
        const ratingTensor = tf.tensor2d(ratingValues, [ratingValues.length, 1]);
        
        updateStatus('Training model (this may take a minute)...', 75);
        
        // Train model
        const history = await model.fit(
            [userTensor, movieTensor],
            ratingTensor,
            {
                epochs: 8,
                batchSize: 64,
                validationSplit: 0.1,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        const progress = 75 + Math.floor((epoch + 1) / 8 * 20);
                        // FIXED: Added null check for logs before accessing loss
                        const lossValue = logs && logs.loss ? logs.loss.toFixed(4) : 'N/A';
                        updateStatus(`Training epoch ${epoch + 1}/8 - Loss: ${lossValue}`, progress);
                        console.log(`Epoch ${epoch + 1}, Loss: ${lossValue}`);
                    }
                }
            }
        );
        
        // Clean up tensors
        userTensor.dispose();
        movieTensor.dispose();
        ratingTensor.dispose();
        
        console.log('Training completed');
        return history;
        
    } catch (error) {
        console.error('Training error:', error);
        updateStatus('Error during training: ' + error.message, 0);
        throw error;
    } finally {
        isTraining = false;
    }
}

async function predictRating() {
    if (!model) {
        alert('Model is not ready yet. Please wait for training to complete.');
        return;
    }
    
    const userSelect = document.getElementById('user-select');
    const movieSelect = document.getElementById('movie-select');
    const resultElement = document.getElementById('result');
    
    const userId = parseInt(userSelect.value);
    const movieId = parseInt(movieSelect.value);
    
    if (!userId || !movieId) {
        resultElement.innerHTML = '<p style="color: #e74c3c;">Please select both a user and a movie.</p>';
        return;
    }
    
    try {
        resultElement.innerHTML = '<p>Calculating prediction...</p>';
        
        // Create input tensors
        const userTensor = tf.tensor2d([[userId]]);
        const movieTensor = tf.tensor2d([[movieId]]);
        
        // Make prediction
        const prediction = model.predict([userTensor, movieTensor]);
        const predictedRating = await prediction.data();
        const ratingValue = predictedRating[0];
        
        // Clean up tensors
        userTensor.dispose();
        movieTensor.dispose();
        prediction.dispose();
        
        // Display result
        const movie = movies.find(m => m.id === movieId);
        const clampedRating = Math.max(0.5, Math.min(5, ratingValue));
        
        // Create star rating display
        const fullStars = Math.floor(clampedRating);
        const halfStar = clampedRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let starsHtml = '<div class="stars">';
        for (let i = 0; i < fullStars; i++) starsHtml += '★';
        if (halfStar) starsHtml += '½';
        for (let i = 0; i < emptyStars; i++) starsHtml += '☆';
        starsHtml += '</div>';
        
        resultElement.innerHTML = `
            <p><strong>Predicted Rating for "${movie.fullTitle}"</strong></p>
            <div class="rating-display">${clampedRating.toFixed(2)} / 5.0</div>
            ${starsHtml}
            <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                User ${userId} would likely rate this movie ${clampedRating.toFixed(2)} stars
            </p>
        `;
        
    } catch (error) {
        console.error('Prediction error:', error);
        resultElement.innerHTML = `<p style="color: #e74c3c;">Error making prediction: ${error.message}</p>`;
    }
}
