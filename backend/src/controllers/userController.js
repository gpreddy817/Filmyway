const User = require('../models/User');

// @desc    Add movie to favorites
// @route   POST /api/users/favorites
// @access  Private
const addFavorite = async (req, res) => {
    try {
        const { tmdbId, title, posterUrl, mediaType } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isFavorite = user.favorites.find((fav) => fav.tmdbId === tmdbId);

        if (isFavorite) {
            return res.status(400).json({ message: 'Movie already in favorites' });
        }

        user.favorites.push({ tmdbId, title, posterUrl, mediaType });
        await user.save();

        res.status(201).json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove movie from favorites
// @route   DELETE /api/users/favorites/:tmdbId
// @access  Private
const removeFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.favorites = user.favorites.filter((fav) => fav.tmdbId !== req.params.tmdbId);
        await user.save();

        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add to watch history
// @route   POST /api/users/history
// @access  Private
const addToHistory = async (req, res) => {
    try {
        const { tmdbId, title, posterUrl, mediaType } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Remove if exists to bring it to top
        user.watchHistory = user.watchHistory.filter((hist) => hist.tmdbId !== tmdbId);

        user.watchHistory.unshift({ tmdbId, title, posterUrl, mediaType, watchedAt: Date.now() });

        // Keep only top 20 items to save space
        if (user.watchHistory.length > 20) {
            user.watchHistory.pop();
        }

        await user.save();

        res.status(201).json(user.watchHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get watch history
// @route   GET /api/users/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.watchHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addFavorite, removeFavorite, getFavorites, addToHistory, getHistory, getUsers, deleteUser };
