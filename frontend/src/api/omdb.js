import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://filmyway.onrender.com/api';

export const omdbApi = axios.create({
    baseURL: `${API_BASE_URL}/omdb`,
});
