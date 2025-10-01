// Global variables to store parsed data
let movies = [];
let ratings = [];
let numUsers = 0;
let numMovies = 0;

// Sample movie data (instead of fetching from external URL)
const SAMPLE_MOVIES = `1|Toy Story (1995)
2|GoldenEye (1995)
3|Four Rooms (1995)
4|Get Shorty (1995)
5|Copycat (1995)
6|Shanghai Triad (1995)
7|Twelve Monkeys (1995)
8|Babe (1995)
9|Dead Man Walking (1995)
10|Richard III (1995)
11|Seven (Se7en) (1995)
12|Usual Suspects, The (1995)
13|Mighty Aphrodite (1995)
14|Postino, Il (1994)
15|Mr. Holland's Opus (1995)
16|French Twist (Gazon maudit) (1995)
17|From Dusk Till Dawn (1996)
18|White Balloon, The (1995)
19|Antonia's Line (1995)
20|Angels and Insects (1995)`;

// Sample rating data (instead of fetching from external URL)
const SAMPLE_RATINGS = `196	242	3	881250949
186	302	3	891717742
22	377	1	878887116
244	51	2	880606923
166	346	1	886397596
298	474	4	884182806
115	265	2	881171488
253	465	5	891628467
305	451	3	886324817
6	86	3	883603013
62	257	2	879372434
286	1014	5	879781125
200	222	5	876042340
210	40	3	891035994
224	29	3	888104457
303	785	3	879485318
122	387	5	879270459
194	274	5	879539794
291	1042	4	874834944
234	1184	2	892079237
119	392	4	886176272
167	486	4	884106854
299	144	4	884952247
291	118	2	887736598
308	1	4	879357019
95	546	4	879357019
38	243	5	879357019
161	93	4	879357019
102	62	3	879357019
13	144	4	879357019`;

async function loadData() {
    try {
        console.log('Loading movie data...');
        
        // Use sample data instead of fetching from external URLs
        parseItemData(SAMPLE_MOVIES);

        console.log('Loading rating data...');
        parseRatingData(SAMPLE_RATINGS);

        console.log(`Data loaded: ${numUsers} users, ${numMovies} movies, ${ratings.length} ratings`);
        
        return {
            movies,
            ratings,
            numUsers,
            numMovies
        };
    } catch (error) {
        console.error('Error loading data:', error);
        
        // If there's an error, create minimal sample data to ensure the app works
        console.log('Creating fallback sample data...');
        createFallbackData();
        
        return {
            movies,
            ratings,
            numUsers,
            numMovies
        };
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

// Fallback function to create sample data if everything else fails
function createFallbackData() {
    console.log('Creating fallback data...');
    
    // Create some sample movies
    movies = [
        { id: 1, title: "Toy Story", fullTitle: "Toy Story (1995)", year: 1995 },
        { id: 2, title: "GoldenEye", fullTitle: "GoldenEye (1995)", year: 1995 },
        { id: 3, title: "Four Rooms", fullTitle: "Four Rooms (1995)", year: 1995 },
        { id: 4, title: "Get Shorty", fullTitle: "Get Shorty (1995)", year: 1995 },
        { id: 5, title: "Copycat", fullTitle: "Copycat (1995)", year: 1995 },
        { id: 6, title: "Seven", fullTitle: "Seven (Se7en) (1995)", year: 1995 },
        { id: 7, title: "Usual Suspects", fullTitle: "Usual Suspects, The (1995)", year: 1995 },
        { id: 8, title: "From Dusk Till Dawn", fullTitle: "From Dusk Till Dawn (1996)", year: 1996 }
    ];
    
    // Create some sample ratings
    ratings = [
        { userId: 1, movieId: 1, rating: 5 },
        { userId: 1, movieId: 2, rating: 3 },
        { userId: 1, movieId: 3, rating: 4 },
        { userId: 2, movieId: 1, rating: 4 },
        { userId: 2, movieId: 4, rating: 5 },
        { userId: 2, movieId: 5, rating: 3 },
        { userId: 3, movieId: 2, rating: 4 },
        { userId: 3, movieId: 6, rating: 5 },
        { userId: 3, movieId: 7, rating: 4 },
        { userId: 4, movieId: 3, rating: 3 },
        { userId: 4, movieId: 8, rating: 5 },
        { userId: 4, movieId: 1, rating: 4 }
    ];
    
    numMovies = movies.length;
    numUsers = 4;
    
    console.log(`Created fallback data: ${numUsers} users, ${numMovies} movies, ${ratings.length} ratings`);
}
