import axios from 'axios';

export const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

export const omdbApi = axios.create({
    baseURL: 'https://www.omdbapi.com/',
});

