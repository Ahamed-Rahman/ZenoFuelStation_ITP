const express = require('express');
const router = express.Router();
const ShopInventory = require('../models/ShopInventory');
const moment = require('moment');
const multer = require('multer');


const path = require('path');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Ensure the uploads directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
    }
});
const upload = multer({ storage: storage });

// Get all shop items
router.get('/', async (req, res) => {
    try {
        const items = await ShopInventory.find();

        // Map items to include the full URL for the photo
        const itemsWithPhotoURL = items.map(item => {
            if (item.photo) {
                // Construct the full URL for the photo
                const photoURL = `${req.protocol}://${req.get('host')}/uploads/${path.basename(item.photo)}`;
                return { ...item._doc, photo: photoURL }; // Add photo URL to item
            } else {
                return item; // No photo URL if there's no photo
            }
        });

        res.json(itemsWithPhotoURL);
    } catch (error) {
        console.error("Error fetching shop items:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Add a new shop item
router.post('/add', upload.single('photo'), async (req, res) => {
    const { itemName, totalItems, itemsSold, quantityAvailable, purchasePrice, retailPrice, dateAdded } = req.body;
    const photo = req.file; // Handle the uploaded photo file

    // Basic field validations
    if (!itemName || !purchasePrice || !retailPrice || !photo) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const purchase = parseFloat(purchasePrice);
    const retail = parseFloat(retailPrice);

    // Check for valid price values
    if (isNaN(purchase) || purchase <= 0 || isNaN(retail) || retail <= 0) {
        return res.status(400).json({ message: "Invalid price values" });
    }

    const today = moment().startOf('day').toDate(); // Start of today's date
    let providedDate = dateAdded ? new Date(dateAdded) : today;

    // Ensure the date is today's date
    if (!moment(providedDate).isSame(today, 'day')) {
        return res.status(400).json({ message: "Date added must be today's date" });
    }

    try {
        // Check if the item already exists
        let existingItem = await ShopInventory.findOne({ itemName });

        if (existingItem) {
            // If the existing item has a quantity of zero, update it
            if (existingItem.quantityAvailable === 0) {
                existingItem.totalItems = totalItems;
                existingItem.itemsSold = itemsSold;
                existingItem.quantityAvailable = quantityAvailable;
                existingItem.purchasePrice = purchasePrice;
                existingItem.retailPrice = retailPrice;
                existingItem.dateAdded = providedDate;
                existingItem.photo = photo.path; // Update the file path

                await existingItem.save();
                return res.status(200).json({ message: 'Item re-added successfully with updated details.' });
            } else {
                // Item already exists with a non-zero quantity, return an error
                return res.status(400).json({ message: 'Item already exists in the inventory with a non-zero quantity.' });
            }
        } else {
            // Create a new item
            const newItem = new ShopInventory({
                itemName,
                totalItems,
                itemsSold,
                quantityAvailable,
                purchasePrice,
                retailPrice,
                dateAdded: providedDate,
                photo: photo.path // Save the file path in the database
            });

            await newItem.save();
            return res.status(201).json({ message: 'Item added successfully.' });
        }
    } catch (error) {
        console.error("Error adding shop item:", error);
        return res.status(500).json({ message: "Server error" });
    }
});



// Get a single shop item by ID
const mongoose = require('mongoose');

// Get a single shop item by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const item = await ShopInventory.findById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // If the item has a photo, append the full photo URL
        if (item.photo) {
            item.photo = `${req.protocol}://${req.get('host')}/uploads/${path.basename(item.photo)}`;
        }

        res.json(item);
    } catch (error) {
        console.error("Error fetching shop item:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Update a shop item by ID
router.put('/update/:id', upload.single('photo'), async (req, res) => {
    const { itemName, totalItems, itemsSold, quantityAvailable, purchasePrice, retailPrice, dateAdded } = req.body;
    const photo = req.file; // Handle the uploaded photo file

    if (!itemName || !purchasePrice || !retailPrice) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const purchase = parseFloat(purchasePrice);
    const retail = parseFloat(retailPrice);

    if (isNaN(purchase) || purchase <= 0 || isNaN(retail) || retail <= 0) {
        return res.status(400).json({ message: "Invalid price values" });
    }

    const today = moment().startOf('day').toDate();
    const providedDate = dateAdded ? new Date(dateAdded) : today;

    if (!moment(providedDate).isSame(today, 'day')) {
        return res.status(400).json({ message: "Date added must be today's date" });
    }

    try {
        const updateData = {
            itemName,
            totalItems,
            itemsSold,
            quantityAvailable,
            purchasePrice,
            retailPrice,
            dateAdded: providedDate
        };

        if (photo) {
            updateData.photo = photo.path; // Update the file path if a new photo is uploaded
        }

        const item = await ShopInventory.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!item) return res.status(404).json({ message: "Item not found" });
        res.json(item);
    } catch (error) {
        console.error("Error updating shop item:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Quantity Route with Stock Validation
router.put('/update-quantity/:id', async (req, res) => {
    const { quantitySold } = req.body;

    if (quantitySold == null || isNaN(quantitySold) || quantitySold <= 0) {
        return res.status(400).json({ message: "Invalid quantity sold" });
    }

    try {
        const item = await ShopInventory.findById(req.params.id);

        if (!item) return res.status(404).json({ message: "Item not found" });

        const currentQuantity = item.quantityAvailable;
        const newQuantity = currentQuantity - quantitySold;

        if (newQuantity < 0) {
            return res.status(400).json({ message: "Sale quantity exceeds available stock" });
        }

        item.quantityAvailable = newQuantity;
        item.itemsSold = (item.itemsSold || 0) + quantitySold; // Update items sold

        await item.save();

        res.json(item);
    } catch (error) {
        console.error("Error updating item quantity:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a shop item by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const item = await ShopInventory.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting shop item:", error);
        res.status(500).json({ message: "Server error" });
    }
});




module.exports = router;
