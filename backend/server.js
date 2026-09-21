const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const movieRoutes = require('./src/routes/movieRoutes');
const tmdbRoutes = require('./src/routes/tmdbRoutes');
const omdbRoutes = require('./src/routes/omdbRoutes');

connectDB();

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://filmyway.vercel.app',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow for general access while preserving credentials handling
        }
    },
    credentials: true,
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/omdb', omdbRoutes);

app.get('/', (req, res) => {
    res.send('Filmyway API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
