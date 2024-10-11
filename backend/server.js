const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const editUserRoutes = require('./routes/editUserRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const suppliersRoutes = require('./routes/supplierRoutes');
const supplierRoutes = require('./routes/supplier');
const attendanceRoutes = require('./routes/attendance'); 
const leaveRouter = require('./routes/leave');
//const billRoutes = require('./routes/bills');
const shopInventoryRoutes = require('./routes/shopInventory');
const fuelInventoryRoutes = require('./routes/fuelInventory');
const shopSalesRoutes = require('./routes/shopSales');
const fuelSalesRoutes = require('./routes/fuelSales');
const orderManagementRoutes = require('./routes/orderManagement');
const { authenticateToken } = require('./middleware/authMiddleware');
const promoRoute = require("./routes/Promotions.js");
const minimumPurchaseRouter = require('./routes/MinimumPurchase');
const sendPromoReport = require("./routes/sendPromoReport.js")
const orderRoutes = require('./routes/orderRoutes'); // Adjust path as needed
const { authenticateSupplierToken } = require('./middleware/supplierMiddleware');
const inventoryRoutes = require('./routes/inventoryRoute');
const packageRoutes = require('./routes/packageRoute');
const billRoutes = require('./routes/billRoute');
const ordersShopRoutes = require('./routes/ordersShop');
const nodemailer = require('nodemailer');
const { PDFDocument } = require('pdf-lib'); // For PDF generation on server
const salaryManagementRoutes = require('./routes/salaryManagement');



// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const server = http.createServer(app);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


// Increase the request body size limit
app.use(express.json({ limit: '10mb' }));  // Adjust the limit as needed (e.g., 10mb, 20mb)
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));





// Middleware for parsing JSON
// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// Middleware to set CORS and CORP headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
  
  // Set Cross-Origin-Resource-Policy header
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  
  next();
});




// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));


// File upload route
// In your main server file, typically `server.js` or `app.js`
app.post('/api/uploads', upload.single('profilePhoto'), (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded.' });
      }
      const filePath = `/uploads/${req.file.filename}`;
      res.status(200).json({
          message: 'File uploaded successfully.',
          filePath: filePath
      });
  } catch (error) {
      console.error('Error while uploading file:', error);
      res.status(500).json({ message: 'Server error while uploading file.' });
  }
});



// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


// Routes

app.use('/api/auth', authRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/supplierRoutes', suppliersRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api', authenticateToken, editUserRoutes);
app.use('/api/suppliers', authenticateToken, supplierRoutes);

app.use('/api/attendance', authenticateToken,attendanceRoutes);
app.use('/api/leave', authenticateToken,leaveRouter);

//app.use('/api/bills', authenticateToken, billRoutes);
app.use('/api/shop-inventory',authenticateToken, shopInventoryRoutes);
app.use('/api/fuel-inventory', authenticateToken, fuelInventoryRoutes);

app.use('/api/order-management',authenticateToken, orderManagementRoutes);
app.use('/api/fuel-sales', authenticateToken, fuelSalesRoutes);
app.use('/api/shop-sales', authenticateToken, shopSalesRoutes);
app.use('/api/ordersShop', ordersShopRoutes);

app.use('/api/orders', authenticateToken, orderRoutes); // Use the order routes
app.use('/inventory', authenticateToken, inventoryRoutes);
app.use('/packages', authenticateToken, packageRoutes);
app.use('/bills', authenticateToken, billRoutes);




// Defining the url for the pages
app.use("/Promotions",authenticateToken,promoRoute);
app.use('/MinimumPurchase',authenticateToken, minimumPurchaseRouter);
app.use('/sendReport', authenticateToken,sendPromoReport);

// Use the salary management routes
app.use('/api/salary-management', salaryManagementRoutes);



// Endpoint to send the email with the PDF
app.post('/api/send-pdf-email', authenticateToken, async (req, res) => {
  const { email, pdf } = req.body; // Email address and PDF data sent from the frontend

  try {
      // Create a Nodemailer transporter object
     // Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'allahknowsme123@gmail.com',
      pass: 'wqai stfh ftef wnsy'
  }
});
      // Define mail options
      const mailOptions = {
          from: 'your-email@example.com', // Sender address
          to: email, // List of recipients (user's email)
          subject: 'Your ID Card PDF',
          text: 'Please find your ID card attached as a PDF.',
          attachments: [
              {
                  filename: 'ID_Card.pdf',
                  content: Buffer.from(pdf, 'base64'), // Attach the PDF as a base64 string
                  encoding: 'base64',
              },
          ],
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      // Respond with success message
      res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email', error });
  }
});




// Socket.IO setup
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Handle 404 errors for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export the io instance if needed elsewhere
module.exports = { io };
