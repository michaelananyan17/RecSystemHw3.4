// Global variables to store parsed data
let movies = [];
let ratings = [];
let numUsers = 0;
let numMovies = 0;

async function loadData() {
    try {
        console.log('Loading movie data...');
        
        // Try multiple approaches to load the data
        let moviesData = await loadLocalFile('u.item');
        let ratingsData = await loadLocalFile('u.data');
        
        if (moviesData) {
            parseItemData(moviesData);
        } else {
            throw new Error('Could not load movie data');
        }
        
        if (ratingsData) {
            parseRatingData(ratingsData);
        } else {
            throw new Error('Could not load rating data');
        }

        console.log(`Data loaded: ${numUsers} users, ${numMovies} movies, ${ratings.length} ratings`);
        
        return {
            movies,
            ratings,
            numUsers,
            numMovies
        };
    } catch (error) {
        console.error('Error loading data:', error);
        updateStatus('Error loading data files. Please make sure u.item and u.data are in the same folder.', 0);
        throw error;
    }
}

async function loadLocalFile(filename) {
    try {
        // Approach 1: Try to fetch from same directory
        const response = await fetch(filename);
        if (response.ok) {
            return await response.text();
        }
    } catch (error) {
        console.log(`Fetch approach failed for ${filename}, trying alternative methods...`);
    }
    
    // If fetch fails, provide instructions
    throw new Error(`Could not load ${filename}. Please make sure the file is in the same directory as your HTML file.`);
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
