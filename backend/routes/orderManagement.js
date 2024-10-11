// routes/orderManagement.js
const express = require('express');
const router = express.Router();

// Low stock alert route
router.post('/low-stock-alert', (req, res) => {
    const { itemId, itemName, quantityAvailable } = req.body;

    // Handle alert logic (e.g., send email, notify via system, etc.)
    console.log(`Low stock alert for item: ${itemName} with quantity: ${quantityAvailable}`);

    res.status(200).send({ message: 'Order management alerted successfully.' });
});

module.exports = router;
