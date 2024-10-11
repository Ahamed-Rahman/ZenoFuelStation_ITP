const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define routes for authentication-related actions
router.post('/register-admin', authController.registerAdmin);
router.post('/login', authController.login);


module.exports = router;
