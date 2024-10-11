const express = require('express');
const router = express.Router();
const editUserController = require('../controllers/editUserController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // Adjust path based on where you placed the multer config



// Route to update user profile
router.put('/update-profile', authenticateToken, authorizeRoles('Admin', 'Manager', 'Worker'), upload.single('profilePhoto'), editUserController.updateProfile);

// Route to get user profile
router.get('/user-profile', authenticateToken, authorizeRoles('Admin', 'Manager', 'Worker'), editUserController.getUserProfile);


// Route to change password
router.put('/change-password', authenticateToken, authorizeRoles('Admin', 'Manager', 'Worker'), editUserController.changePassword);


// Route to change password
router.post('/sendCardToEmail', authenticateToken, authorizeRoles('Admin', 'Manager', 'Worker'), editUserController.sendCardToEmail);



// Route to change password
router.post('/saveCard', authenticateToken, authorizeRoles('Admin', 'Manager', 'Worker'), editUserController.saveCard);

module.exports = router;


