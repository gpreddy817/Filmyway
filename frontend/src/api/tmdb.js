import axios from 'axios';

export const TMDB_SECRET = import.meta.env.VITE_TMDB_SECRET || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3N2E0OTU5NGEzOGZiN2JmMGYwNjQyMzZlNDkxNjg4MyIsIm5iZiI6MTc4OTYyNDMxMS4zMjA5OTk5LCJzdWIiOiI2YWFiN2ZmN2ZhNjJlZDhjNzYxODBkYWUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.mhXzuO8w0oDQKr5s86lGMVTmjTSvzwYdn_HH-8FVUnU';
export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '77a49594a38fb7bf0f064236e4916883';

export const tmdbApi = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: {
        Authorization: `Bearer ${TMDB_SECRET}`,
        'Content-Type': 'application/json',
    },
});

export const getTmdbPosterUrl = (path) => {
    if (!path) return '/no-poster.png';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
};

export const getTmdbBackdropUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w1280${path}`;
};

export const mapTmdbItem = (item) => {
    if (!item) return null;
    const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const title = item.title || item.name || item.original_title || item.original_name || 'Untitled';
    const releaseDate = item.release_date || item.first_air_date || null;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

    return {
        id: String(item.id),
        tmdbId: String(item.id),
        title,
        name: title,
        Poster: item.poster_path ? getTmdbPosterUrl(item.poster_path) : null,
        posterUrl: item.poster_path ? getTmdbPosterUrl(item.poster_path) : null,
        backdropUrl: item.backdrop_path ? getTmdbBackdropUrl(item.backdrop_path) : null,
        release_date: releaseDate,
        year,
        first_air_date: item.first_air_date || null,
        vote_average: item.vote_average ? Number(item.vote_average) : null,
        imdbRating: item.vote_average ? item.vote_average.toFixed(1) : null,
        overview: item.overview || '',
        mediaType,
    };
};

export const mapTmdbResults = (results) => {
    if (!Array.isArray(results)) return [];
    return results.map(mapTmdbItem).filter(Boolean);
};
