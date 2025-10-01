// Global variables
let model;
let trainingData = {};
let isTraining = false;

// Add these new functions for file handling
async function loadFiles() {
    const moviesFile = document.getElementById('movies-file').files[0];
    const ratingsFile = document.getElementById('ratings-file').files[0];
    
    if (!moviesFile || !ratingsFile) {
        updateStatus('Please select both files.', 0);
        return;
    }
    
    try {
        updateStatus('Reading files...', 10);
        
        // Read files
        const moviesText = await readFile(moviesFile);
        const ratingsText = await readFile(ratingsFile);
        
        updateStatus('Parsing data...', 30);
        
        // Parse data
        parseItemData(moviesText);
        parseRatingData(ratingsText);
        
        updateStatus('Data loaded! Populating dropdowns...', 50);
        
        // Populate dropdowns
        populateUserDropdown();
        populateMovieDropdown();
        
        // Show controls and hide file upload
        document.querySelector('.file-upload').style.display = 'none';
        document.querySelector('.controls').style.display = 'block';
        document.getElementById('training-status').style.display = 'block';
        
        updateStatus('Starting model training...', 60);
        
        // Train model
        await trainModel();
        
        updateStatus('Model trained and ready for predictions!', 100);
        document.getElementById('predict-btn').disabled = false;
        
    } catch (error) {
        console.error('Error loading files:', error);
        updateStatus('Error: ' + error.message, 0);
    }
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsText(file);
    });
}

// Keep all your existing functions (updateStatus, populateUserDropdown, etc.)
// ... [all the existing functions remain the same] ...

// Initialize when window loads
window.onload = function() {
    updateStatus('Please load your MovieLens data files to begin.', 0);
};
