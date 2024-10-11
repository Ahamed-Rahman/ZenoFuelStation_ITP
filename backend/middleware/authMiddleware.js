// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');



// Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) return res.status(403).json({ message: 'Token is not valid' });

        // Fetch user from database
        const userFromDb = await User.findById(user.id);
        if (!userFromDb) return res.status(404).json({ message: 'User not found' });

        req.user = userFromDb; // Set user on req
        next();

        
    });
};

// Middleware to check for specific roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access forbidden' });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };