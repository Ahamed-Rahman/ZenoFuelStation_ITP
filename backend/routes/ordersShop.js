// routes/orders.js
const express = require('express');
const router = express.Router();
const OrdersShop = require('../models/OrdersShop');
const ShopInventory = require('../models/ShopInventory');
const ReceivedOrderShop = require('../models/ReceivedOrderShop');
const Supplier = require('../models/Supplier'); // Assuming you have a Supplier model

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await OrdersShop.find();
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get low stock items
// Get low stock items from shop inventory
// Get low stock items
router.get('/low-stock-items', async (req, res) => {
    try {
        // Adjusting the query to check for 'quantityAvailable' instead of 'available'
        const lowStockItems = await ShopInventory.find({ quantityAvailable: { $lte: 10 } });
        
        if (lowStockItems.length === 0) {
            return res.status(404).json({ message: "No low stock items found" });
        }

        res.status(200).json(lowStockItems);
    } catch (error) {
        console.error("Error fetching low stock items:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to place a new item order for the shop
// Route to place a new item order for the shop
router.post('/place-order', async (req, res) => {
    const { itemName, quantity, supplierEmail, orderDate } = req.body;
  
    // Log incoming request for debugging
    console.log('Received order data:', req.body);
  
    if (!itemName || !quantity || !supplierEmail || !orderDate) {
      console.error('Missing fields in order data:', { itemName, quantity, supplierEmail, orderDate });
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      const newOrder = new OrdersShop({
        itemName,
        quantityOrdered: quantity,
        supplierEmail,
        orderDate: new Date(orderDate),
        status: 'Pending',
      });
  
      await newOrder.save();
      res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  
router.put('/update/:id', async (req, res) => {
    const orderId = req.params.id;
    const { quantityOrdered } = req.body;

    try {
        // Find the order by ID and update the quantityOrdered
        const updatedOrder = await OrdersShop.findByIdAndUpdate(
            orderId,
            { quantityOrdered },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully', updatedOrder });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Place an order for new items
router.post('/new-item', async (req, res) => {
    const { itemName, quantityOrdered, supplierEmail } = req.body;

    if (!itemName || !quantityOrdered || !supplierEmail) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const newOrder = new OrdersShop({ itemName, quantityOrdered, supplierEmail });
        await newOrder.save();
        res.status(201).json({ message: 'New item order placed successfully' });
    } catch (error) {
        console.error("Error placing new item order:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update an existing order
router.put('/update/:id', async (req, res) => {
    const { quantityOrdered } = req.body;

    if (quantityOrdered == null || isNaN(quantityOrdered) || quantityOrdered <= 0) {
        return res.status(400).json({ message: "Invalid quantity ordered" });
    }

    try {
        const order = await OrdersShop.findByIdAndUpdate(req.params.id, { quantityOrdered }, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });

        res.json(order);
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete an order
router.delete('/delete/:id', async (req, res) => {
    try {
        const order = await OrdersShop.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// Get received orders for shop
router.get('/received-orders', async (req, res) => {
    try {
        const receivedOrders = await ReceivedOrderShop.find();
        res.status(200).json(receivedOrders);
    } catch (error) {
        console.error('Error fetching received orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to place new received order
router.post('/received-orders', async (req, res) => {
    const { itemName, quantity, wholesalePrice, supplierEmail, orderDate } = req.body;

    if (!itemName || !quantity || !wholesalePrice || !supplierEmail || !orderDate) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const newReceivedOrder = new ReceivedOrderShop({
            itemName,
            quantity,
            wholesalePrice,
            supplierEmail,
            totalAmount: 0,  // Set totalAmount as 0 initially, will be calculated when added to inventory
            orderDate: new Date(orderDate),
        });

        await newReceivedOrder.save();
        res.status(201).json({ message: 'Received order placed successfully', order: newReceivedOrder });
    } catch (err) {
        console.error('Error placing received order:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Route to add received order to shop inventory
// Route to add received order to shop inventory
router.post('/received-orders/:id/add-to-inventory', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        const receivedOrder = await ReceivedOrderShop.findById(id);
        if (!receivedOrder) {
            return res.status(404).json({ message: 'Received order not found' });
        }

        const totalAmount = quantity * receivedOrder.wholesalePrice;

        let shopItem = await ShopInventory.findOne({ itemName: receivedOrder.itemName });
        if (shopItem) {
            shopItem.quantityAvailable += quantity;
            await shopItem.save();
        } else {
            shopItem = new ShopInventory({
                itemName: receivedOrder.itemName,
                quantityAvailable: quantity,
                purchasePrice: receivedOrder.wholesalePrice,
                dateAdded: new Date(),
            });
            await shopItem.save();
        }

      // Update received order with totalAmount, status, and dateReceived
      receivedOrder.totalAmount = totalAmount;
      receivedOrder.status = 'AddedToInventory';
      receivedOrder.dateReceived = new Date();
      await receivedOrder.save();

        res.status(200).json({ message: 'Order added to inventory successfully', receivedOrder });
    } catch (error) {
        console.error('Error adding item to inventory:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




module.exports = router;
