const express = require('express');
const router = express.Router();
const { omdbProxy } = require('../controllers/omdbController');

router.get('/', omdbProxy);

module.exports = router;
