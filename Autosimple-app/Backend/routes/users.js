const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/users/signup - Regjistrim
router.post('/signup', authController.signup);

// POST /api/users/login - Login
router.post('/login', authController.login);

module.exports = router;