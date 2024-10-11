const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken } = require('../middleware/authMiddleware'); 

// Apply middleware to protect routes and restrict to Admins
router.get('/', authenticateToken, supplierController.getAllSuppliers);
router.post('/', authenticateToken, supplierController.createSupplier);
router.put('/:id', authenticateToken,  supplierController.updateSupplier);
router.delete('/:id', authenticateToken,  supplierController.deleteSupplier);

module.exports = router;
