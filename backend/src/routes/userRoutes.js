const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites, addToHistory, getHistory, getUsers, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser);

router.route('/favorites').get(protect, getFavorites).post(protect, addFavorite);
router.route('/favorites/:tmdbId').delete(protect, removeFavorite);

router.route('/history').get(protect, getHistory).post(protect, addToHistory);

module.exports = router;
