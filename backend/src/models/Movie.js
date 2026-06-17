const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    posterUrl: { type: String },
    description: { type: String },
    releaseDate: { type: String },
    trailerUrl: { type: String },
    genre: { type: String },
    category: { type: String, enum: ['Movies', 'TV Shows'], default: 'Movies' },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
