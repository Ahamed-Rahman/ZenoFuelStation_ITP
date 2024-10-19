const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const FuelInventory = require('../models/FuelInventory');
const Supplier = require('../models/Supplier');
const ReceivedOrder = require('../models/ReceivedOrder'); // ReceivedOrder model
const { authenticateToken } = require('../middleware/authMiddleware');
 // Ensure authentication middleware is in place




// Example route for placing a new order
router.post('/place-order', async (req, res) => {
  const { itemName, quantity, supplierEmail, totalAmount, orderDate } = req.body;

  if (!itemName || !quantity || !supplierEmail || !totalAmount || !orderDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newOrder = new Order({
      itemName,
      quantity,
      supplierEmail,
      totalAmount,  // Ensure totalAmount is passed
      orderDate,    // Ensure orderDate is passed
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Route to place a new order
router.post('/place-new-item-order', async (req, res) => {
  const { itemName, quantity, supplierEmail, orderDate } = req.body;

  if (!itemName || !quantity || !supplierEmail  || !orderDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const supplier = await Supplier.findOne({ email: supplierEmail });
    if (!supplier) {
      return res.status(400).json({ error: 'Invalid supplier email' });
    }

   

    const newOrder = new Order({
      itemName,
      quantity,
      supplierEmail,
      totalAmount: 0,  // Initialize totalAmount as 0, will be calculated when order is accepted
      orderDate: new Date(orderDate), // Ensure the proper date format
    });

    await newOrder.save();
    res.status(201).json({ message: 'New item order placed successfully', order: newOrder });
  } catch (err) {
    console.error('Error placing new item order:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Route to get all orders (optional)
router.get('/', async (req, res) => {
    try {
      // Remove the populate call
      const orders = await Order.find(); 
      res.json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
// Get new items route
router.get('/new-items', async (req, res) => {
  try {
    const newItems = await FuelInventory.find({ isNew: true }); // Assuming you have an isNew field to identify new items
    res.status(200).json(newItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching new items', error });
  }
});

// Route to update order quantity
// Simplified logic for testing without FuelInventory
router.put('/update-order/:id', async (req, res) => {
  const orderId = req.params.id;
  const { quantity } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Remove inventory dependency for testing
    // const fuelInventory = await FuelInventory.findOne({ itemName: order.itemName });

    const totalAmount = quantity * 100; // Use a static value for wholesale price

    order.quantity = quantity;
    order.totalAmount = totalAmount;

    await order.save();

    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to delete an order
router.delete('/delete-order/:id', async (req, res) => {
    try {
      const orderId = req.params.id;
      await Order.findByIdAndDelete(orderId);
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting order', error: err.message });
    }
  });

  // Route to get all received orders
// Route to get all received orders
// Route to get all received orders
router.get('/received-orders', authenticateToken, async (req, res) => {
  try {
    const receivedOrders = await ReceivedOrder.find(); // Assuming you want all received orders
    res.json(receivedOrders);
  } catch (error) {
    console.error('Error fetching received orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Route to add received order to inventory
// Route to add received order to fuel inventory
router.post('/received-orders/:id/addToInventory', authenticateToken, async (req, res) => {
  const receivedOrderId = req.params.id;
  const { quantity } = req.body;

  try {
    const receivedOrder = await ReceivedOrder.findById(receivedOrderId);

    if (!receivedOrder) {
      return res.status(404).json({ message: 'Received order not found' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Calculate totalAmount (quantity * wholesalePrice)
    const totalAmount = quantity * receivedOrder.wholesalePrice;

    // Ensure a valid orderDate is set (use today's date if missing)
    if (!receivedOrder.orderDate) {
      receivedOrder.orderDate = new Date();  // Default to today’s date
    }

    let inventoryItem = await FuelInventory.findOne({ itemName: receivedOrder.itemName });
    if (inventoryItem) {
      // Update the available quantity without affecting the total
      inventoryItem.available = quantity;  // Increment available quantity
      inventoryItem.total = quantity;
      await inventoryItem.save();
    } else {
      inventoryItem = new FuelInventory({
        itemName: receivedOrder.itemName,
        total: quantity,  // Set new total as the received quantity
        available: quantity,  // Set available quantity as the received quantity
        wholesalePrice: receivedOrder.wholesalePrice,
        dateAdded: new Date(),
      });
      await inventoryItem.save();
    }

    // Update the received order with totalAmount and status
    receivedOrder.totalAmount = totalAmount;
    receivedOrder.status = 'AddedToInventory';

    await receivedOrder.save();
    res.json({ message: 'Item added to inventory successfully', receivedOrder });
  } catch (error) {
    console.error('Error adding item to inventory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



module.exports = router;
