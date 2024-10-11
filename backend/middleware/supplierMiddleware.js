const jwt = require('jsonwebtoken');
const SupplierAuth = require('../models/SupplierAuth');

const authenticateSupplierToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token is not valid' });

        // Fetch supplier from database
        const supplierFromDb = await SupplierAuth.findById(decoded.supplierId);
        console.log('Supplier from DB:', supplierFromDb); // Log supplier from DB
        if (!supplierFromDb) return res.status(404).json({ message: 'Supplier not found' });

        req.supplier = supplierFromDb; // Set supplier on req
        next();
    });
};

module.exports = { authenticateSupplierToken };
