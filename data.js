// Global variables to store parsed data
let movies = [];
let ratings = [];
let numUsers = 0;
let numMovies = 0;

// MovieLens dataset URLs
const MOVIES_URL = 'https://raw.githubusercontent.com/tensorflow/tfjs-examples/master/recommendation/data/movielens100k/u.item';
const RATINGS_URL = 'https://raw.githubusercontent.com/tensorflow/tfjs-examples/master/recommendation/data/movielens100k/u.data';

async function loadData() {
    try {
        console.log('Loading movie data...');
        const moviesResponse = await fetch(MOVIES_URL);
        const moviesText = await moviesResponse.text();
        parseItemData(moviesText);

        console.log('Loading rating data...');
        const ratingsResponse = await fetch(RATINGS_URL);
        const ratingsText = await ratingsResponse.text();
        parseRatingData(ratingsText);

        console.log(`Data loaded: ${numUsers} users, ${numMovies} movies, ${ratings.length} ratings`);
        
        return {
            movies,
            ratings,
            numUsers,
            numMovies
        };
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

function parseItemData(text) {
    const lines = text.split('\n');
    movies = [];
    
    for (const line of lines) {
        if (line.trim() === '') continue;
        
        const parts = line.split('|');
        if (parts.length >= 2) {
            const movieId = parseInt(parts[0]);
            const title = parts[1];
            
            // Extract year from title (format: "Movie Title (YYYY)")
            const yearMatch = title.match(/\((\d{4})\)$/);
            const year = yearMatch ? parseInt(yearMatch[1]) : null;
            
            // Clean title by removing year
            const cleanTitle = title.replace(/\s*\(\d{4}\)$/, '');
            
            movies.push({
                id: movieId,
                title: cleanTitle,
                fullTitle: title,
                year: year
            });
        }
    }
    
    // Sort movies alphabetically by title using localeCompare
    movies.sort((a, b) => a.title.localeCompare(b.title));
    
    numMovies = movies.length;
    console.log(`Parsed ${movies.length} movies`);
}

function parseRatingData(text) {
    const lines = text.split('\n');
    ratings = [];
    const userSet = new Set();
    
    for (const line of lines) {
        if (line.trim() === '') continue;
        
        const parts = line.split('\t');
        if (parts.length >= 3) {
            const userId = parseInt(parts[0]);
            const movieId = parseInt(parts[1]);
            const rating = parseFloat(parts[2]);
            
            ratings.push({
                userId: userId,
                movieId: movieId,
                rating: rating
            });
            
            userSet.add(userId);
        }
    }
    
    numUsers = userSet.size;
    console.log(`Parsed ${ratings.length} ratings from ${numUsers} users`);
}