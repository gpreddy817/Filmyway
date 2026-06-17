const Movie = require('../models/Movie');

// @desc    Get all movies added by admin
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find({});
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single admin movie
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
    try {
        const { title, posterUrl, description, releaseDate, trailerUrl, genre, category } = req.body;

        const movie = new Movie({
            title,
            posterUrl,
            description,
            releaseDate,
            trailerUrl,
            genre,
            category
        });

        const createdMovie = await movie.save();
        res.status(201).json(createdMovie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
    try {
        const { title, posterUrl, description, releaseDate, trailerUrl, genre, category } = req.body;

        const movie = await Movie.findById(req.params.id);

        if (movie) {
            movie.title = title || movie.title;
            movie.posterUrl = posterUrl || movie.posterUrl;
            movie.description = description || movie.description;
            movie.releaseDate = releaseDate || movie.releaseDate;
            movie.trailerUrl = trailerUrl || movie.trailerUrl;
            movie.genre = genre || movie.genre;
            movie.category = category || movie.category;

            const updatedMovie = await movie.save();
            res.json(updatedMovie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            await movie.deleteOne();
            res.json({ message: 'Movie removed' });
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMovies, getMovieById, createMovie, updateMovie, deleteMovie };
