import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tmdbApi, mapTmdbResults } from '../api/tmdb';

const initialState = {
    latest: [],
    trending: [],
    popular: [],
    tvShows: [],
    searchResults: [],
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
};

export const fetchLatest = createAsyncThunk('movies/fetchLatest', async () => {
    try {
        const response = await tmdbApi.get('/movie/now_playing', { params: { page: 1 } });
        return mapTmdbResults(response.data?.results || []);
    } catch (error) {
        console.error('Error fetching latest movies from TMDB:', error);
        throw error;
    }
});

export const fetchTrending = createAsyncThunk('movies/fetchTrending', async () => {
    try {
        const response = await tmdbApi.get('/trending/movie/day');
        return mapTmdbResults(response.data?.results || []);
    } catch (error) {
        console.error('Error fetching trending movies from TMDB:', error);
        throw error;
    }
});

export const fetchPopular = createAsyncThunk('movies/fetchPopular', async (page = 1) => {
    try {
        const response = await tmdbApi.get('/movie/popular', { params: { page } });
        return mapTmdbResults(response.data?.results || []);
    } catch (error) {
        console.error('Error fetching popular movies from TMDB:', error);
        throw error;
    }
});

export const fetchTvShows = createAsyncThunk('movies/fetchTvShows', async (page = 1) => {
    try {
        const response = await tmdbApi.get('/tv/popular', { params: { page } });
        return mapTmdbResults(response.data?.results || []);
    } catch (error) {
        console.error('Error fetching TV shows from TMDB:', error);
        throw error;
    }
});

export const searchMovies = createAsyncThunk('movies/searchMovies', async ({ query, page = 1 }) => {
    if (!query || !query.trim()) return [];
    try {
        const response = await tmdbApi.get('/search/multi', {
            params: { query: query.trim(), page, include_adult: false },
        });
        const items = (response.data?.results || []).filter(item => item.media_type !== 'person');
        return mapTmdbResults(items);
    } catch (error) {
        console.error('Error searching media on TMDB:', error);
        throw error;
    }
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
                state.error = action.error?.message || 'Failed to fetch latest movies';
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
                state.error = action.error?.message || 'Failed to fetch trending movies';
            })
            // Popular movies
            .addCase(fetchPopular.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPopular.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const page = action.meta.arg || 1;
                const newItems = page > 1 ? [...state.popular, ...action.payload] : action.payload;
                const seen = new Set();
                state.popular = newItems.filter(m => {
                    if (seen.has(m.id)) return false;
                    seen.add(m.id);
                    return true;
                });
            })
            .addCase(fetchPopular.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error?.message || 'Failed to fetch popular movies';
            })
            // TV shows
            .addCase(fetchTvShows.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTvShows.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const page = action.meta.arg || 1;
                const newItems = page > 1 ? [...state.tvShows, ...action.payload] : action.payload;
                const seen = new Set();
                state.tvShows = newItems.filter(m => {
                    if (seen.has(m.id)) return false;
                    seen.add(m.id);
                    return true;
                });
            })
            .addCase(fetchTvShows.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error?.message || 'Failed to fetch TV shows';
            })
            // Search
            .addCase(searchMovies.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(searchMovies.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { page = 1 } = action.meta.arg || {};
                const newItems = page > 1 ? [...state.searchResults, ...action.payload] : action.payload;
                const seen = new Set();
                state.searchResults = newItems.filter(m => {
                    if (seen.has(m.id)) return false;
                    seen.add(m.id);
                    return true;
                });
            })
            .addCase(searchMovies.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error?.message || 'Failed to search movies';
            });
    },
});

export const { clearSearch } = movieSlice.actions;
export default movieSlice.reducer;
