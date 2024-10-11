const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const FuelInventory = require('../models/FuelInventory');
const { io } = require('../server'); // Import your Socket.IO instance
const { isToday } = require('../utils/dateUtils');
const moment = require('moment');

// Route to get all fuel inventory items
router.get('/', async (req, res) => {
  try {
    const items = await FuelInventory.find();
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});





// Route to add a new fuel inventory item
router.post('/add', async (req, res) => {
  const { itemName, total , sold = 0, wholesalePrice, dateAdded } = req.body;

  // Validate input
  if (
    !itemName ||
    typeof total !== 'number' || total < 0 || // total should not have a default
    typeof sold !== 'number' || sold < 0 ||
    total < 0 ||
    sold < 0 ||
    !dateAdded ||
    typeof wholesalePrice !== 'number' ||
    wholesalePrice < 0
  ) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  const today = moment().startOf('day').toDate(); // Start of today
  let providedDate;

  if (dateAdded) {
    providedDate = new Date(dateAdded);
  } else {
    providedDate = today;
  }

  if (!moment(providedDate).isSame(today, 'day')) {
    return res.status(400).json({ message: "Date added must be today's date" });
  }

  try {
    // Check if item already exists
    const existingItem = await FuelInventory.findOne({ itemName });
    if (existingItem) {
      return res.status(400).json({ message: 'Item already exists' });
    }

    const newItem = new FuelInventory({
      itemName,
      total,
      sold,
      available: total - sold,
      wholesalePrice,
      dateAdded: providedDate, // Use the parsed date
    });

    await newItem.save();

    // Emit the update event with the updated inventory data
    const items = await FuelInventory.find();
    if (io) {
      io.emit('inventoryUpdate', items);
    } else {
      console.error('Socket.io instance is not available');
    }

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});




// Route to get an item by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Check if the id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const item = await FuelInventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error fetching item by ID:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});




// Route to update an item

// Route to update an item
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  let { itemName, total = 50000, sold = 0, wholesalePrice, dateAdded } = req.body;

  // Convert values to appropriate types
  total = Number(total);
  sold = Number(sold);
  wholesalePrice = Number(wholesalePrice);

  // Validate input
  if (
    !itemName ||
    typeof total !== 'number' ||
    typeof sold !== 'number' ||
    typeof wholesalePrice !== 'number' ||
    total < 0 ||
    sold < 0 ||
    wholesalePrice < 0 ||
    !dateAdded
  ) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  // Check if the provided date is today's date
  if (!isToday(dateAdded)) {
    return res.status(400).json({ message: 'Invalid date: You can only use today\'s date.' });
  }

  try {
    const existingItem = await FuelInventory.findOne({ itemName, _id: { $ne: id } });
    if (existingItem) {
      return res.status(400).json({ message: 'Item name already exists' });
    }

    const updatedItem = await FuelInventory.findByIdAndUpdate(
      id,
      {
        itemName,
        total,
        sold,
        available: total - sold,
        wholesalePrice,
        dateAdded: new Date(dateAdded),
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Emit the update event with the updated inventory data
    const items = await FuelInventory.find();
    if (io) {
      io.emit('inventoryUpdate', items);
    } else {
      console.error('Socket.io instance is not available');
    }

    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});




// Route to delete an item
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const deletedItem = await FuelInventory.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Emit the update event with the updated inventory data
    const items = await FuelInventory.find();
    if (io) {
      io.emit('inventoryUpdate', items);
    } else {
      console.error('Socket.io instance is not available');
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Route to check if an item with the same name exists
router.get('/check-item-name/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const item = await FuelInventory.findOne({ itemName: name });
    res.status(200).json({ exists: !!item });
  } catch (err) {
    console.error('Error checking item name:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;
