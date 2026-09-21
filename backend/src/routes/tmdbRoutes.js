const express = require('express');
const router = express.Router();
const { tmdbProxy } = require('../controllers/tmdbController');

router.get('/*path', tmdbProxy);

module.exports = router;
