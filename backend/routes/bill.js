const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Create a new bill
router.post('/', async (req, res) => {
    try {
        const { customerName, customerContact, billDate, items, totalAmount } = req.body;
        const newBill = new Bill({ customerName, customerContact, billDate, items, totalAmount });
        await newBill.save();
        res.status(201).json(newBill);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create bill.' });
    }
});

// Get all bills
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find();
        res.status(200).json(bills);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bills.' });
    }
});

module.exports = router;
