const express = require('express'); 
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPasswordController');

// Route to request verification code
router.post('/request-code', forgotPasswordController.requestCode);

// Route to verify the code
router.post('/verify-code', forgotPasswordController.verifyCode);

// Route to reset password
router.post('/reset-password', forgotPasswordController.resetPassword);

module.exports = router;
