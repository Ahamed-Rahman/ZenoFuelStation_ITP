const express = require('express');
const router = express.Router();
const SupplierAuth = require('../models/SupplierAuth'); // Supplier authentication model

const Order = require('../models/Order'); // Order model
const OrdersShop = require('../models/OrdersShop'); // Order model
const { authenticateSupplierToken} = require('../middleware/supplierMiddleware');
const ReceivedOrder = require('../models/ReceivedOrder'); // ReceivedOrder model
const ReceivedOrderShop = require('../models/ReceivedOrderShop'); // ReceivedOrder model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Supplier Login Route
// Supplier Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the supplier exists in the SupplierAuth collection
        const supplier = await SupplierAuth.findOne({ email });
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Compare the entered password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, supplier.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token for authentication with supplier's email and supplierId
        // After validating supplier credentials
const token = jwt.sign(
    { supplierId: supplier._id, email: supplier.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);


        // Send back the token
        res.json({ token });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

  
  

// Supplier Registration Route
// No authentication middleware needed here
router.post('/register-supplier', async (req, res) => {
    const { companyName, email, password } = req.body;
  
    try {
      const existingSupplier = await SupplierAuth.findOne({ email });
      if (existingSupplier) {
        return res.status(400).json({ error: 'Supplier already registered' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newSupplier = new SupplierAuth({
        companyName,
        email,
        password: hashedPassword,
      });
  
      await newSupplier.save();
      res.status(201).json({ message: 'Supplier registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  


// Fetch all fuel orders for the supplier
router.get('/orders', authenticateSupplierToken, async (req, res) => {
  try {
    const supplierEmail = req.supplier.email; // Get supplier's email from token
    const orders = await Order.find({ supplierEmail });
    if (!orders.length) {
      return res.status(404).json({ message: 'No fuel orders found' });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all shop orders for the supplier
router.get('/shop-orders', authenticateSupplierToken, async (req, res) => {
  try {
    const supplierEmail = req.supplier.email; // Get supplier's email from token
    const orders = await OrdersShop.find({ supplierEmail }); // Find shop orders for the supplier
    if (!orders.length) {
      return res.status(404).json({ message: 'No shop orders found' });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept a fuel order
router.post('/orders/:id/accept', authenticateSupplierToken, async (req, res) => {
  const { quantity, wholesalePrice, orderDate } = req.body;
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Fuel order not found' });
    }

    if (req.supplier.email !== order.supplierEmail) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const totalAmount = quantity * wholesalePrice; // Calculate total amount
    order.status = 'Accepted';
    order.totalAmount = totalAmount;
    order.orderDate = orderDate;
    await order.save();

    const receivedOrder = new ReceivedOrder({
      itemName: order.itemName,
      quantity,
      wholesalePrice,
      totalAmount,
      supplierEmail: order.supplierEmail,
    });
    await receivedOrder.save();
    res.json({ message: 'Fuel order accepted and received', receivedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept a shop order
router.post('/shop-orders/:id/accept', authenticateSupplierToken, async (req, res) => {
  const { quantity, wholesalePrice, orderDate } = req.body;
  const orderId = req.params.id;

  try {
    const order = await OrdersShop.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Shop order not found' });
    }

    if (req.supplier.email !== order.supplierEmail) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const totalAmount = quantity * wholesalePrice; // Calculate total amount
    order.status = 'Accepted';
    order.totalAmount = totalAmount;
    order.orderDate = orderDate;
    await order.save();

    const receivedOrder = new ReceivedOrderShop({
      itemName: order.itemName,
      quantity,
      wholesalePrice,
      totalAmount,
      supplierEmail: order.supplierEmail,
    });
    await receivedOrder.save();
    res.json({ message: 'Shop order accepted and received', receivedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject a fuel order
router.put('/orders/:id/reject', authenticateSupplierToken, async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Fuel order not found' });
    }

    order.status = 'Rejected';
    await order.save();
    res.status(200).json({ message: 'Fuel order rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a shop order
router.put('/shop-orders/:id/reject', authenticateSupplierToken, async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await OrdersShop.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Shop order not found' });
    }

    order.status = 'Rejected';
    await order.save();
    res.status(200).json({ message: 'Shop order rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



  


  

  
   
module.exports = router;
