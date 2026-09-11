import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { omdbApi, OMDB_API_KEY } from '../api/omdb';

const initialState = {
    latest: [],
    trending: [],
    popular: [],
    tvShows: [],
    searchResults: [],
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
};

const mapOmdbSearchResults = (data) => {
    if (!data || data.Response === 'False' || !Array.isArray(data.Search)) return [];
    return data.Search.map(item => ({
        id: item.imdbID,
        title: item.Title,
        name: item.Title,
        posterUrl: item.Poster !== 'N/A' ? item.Poster : null,
        release_date: item.Year ? `${item.Year}-01-01` : null,
        first_air_date: null,
        vote_average: Number(item.imdbRating) || null,
        mediaType: item.Type,
    }));
};

export const fetchLatest = createAsyncThunk('movies/fetchLatest', async () => {
    // To get the latest movies from OMDb, we search common words restricted to the current year
    const currentYear = new Date().getFullYear();
    const searches = ['man', 'the', 'world', 'day', 'time'];
    const results = [];
    for (const term of searches) {
        try {
            const res = await omdbApi.get('', {
                params: { apikey: OMDB_API_KEY, s: term, y: currentYear, type: 'movie', page: 1 },
            });
            const mapped = mapOmdbSearchResults(res.data);
            results.push(...mapped.filter(m => m.posterUrl && m.posterUrl !== 'N/A'));
        } catch (e) { /* skip on error */ }
    }
    const seen = new Set();
    return results
        .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; })
        .slice(0, 8);
});
export const fetchTrending = createAsyncThunk('movies/fetchTrending', async () => {
    const response = await omdbApi.get('', {
        params: {
            apikey: OMDB_API_KEY,
            s: 'avengers',
            page: 1,
        },
    });
    return mapOmdbSearchResults(response.data);
});

export const fetchPopular = createAsyncThunk('movies/fetchPopular', async (page = 1) => {
    const response = await omdbApi.get('', {
        params: {
            apikey: OMDB_API_KEY,
            s: 'star',
            page,
        },
    });
    return mapOmdbSearchResults(response.data);
});

export const fetchTvShows = createAsyncThunk('movies/fetchTvShows', async (page = 1) => {
    const response = await omdbApi.get('', {
        params: {
            apikey: OMDB_API_KEY,
            s: 'friends',
            type: 'series',
            page,
        },
    });
    return mapOmdbSearchResults(response.data);
});

export const searchMovies = createAsyncThunk('movies/searchMovies', async ({ query, page = 1 }) => {
    if (!query) return [];
    const response = await omdbApi.get('', {
        params: {
            apikey: OMDB_API_KEY,
            s: query,
            page,
        },
    });
    return mapOmdbSearchResults(response.data);
});

export const movieSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        clearSearch: (state) => {
            state.searchResults = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Latest
            .addCase(fetchLatest.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchLatest.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.latest = action.payload;
            })
            .addCase(fetchLatest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Trending
            .addCase(fetchTrending.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTrending.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.trending = action.payload;
            })
            .addCase(fetchTrending.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Popular movies (supports infinite scroll)
            .addCase(fetchPopular.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPopular.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const page = action.meta.arg || 1;
                if (page > 1) {
                    state.popular = [...state.popular, ...action.payload];
                } else {
                    state.popular = action.payload;
                }
            })
            .addCase(fetchPopular.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // TV shows
            .addCase(fetchTvShows.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTvShows.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tvShows = action.payload;
            })
            .addCase(fetchTvShows.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Search
            .addCase(searchMovies.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(searchMovies.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { page = 1 } = action.meta.arg || {};
                if (page > 1) {
                    state.searchResults = [...state.searchResults, ...action.payload];
                } else {
                    state.searchResults = action.payload;
                }
            })
            .addCase(searchMovies.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { clearSearch } = movieSlice.actions;
export default movieSlice.reducer;
