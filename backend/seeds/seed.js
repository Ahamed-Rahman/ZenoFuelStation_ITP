require('dotenv').config(); // Ensure this is at the top

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjust path as necessary
const Counter = require('../models/Counter'); // Adjust path as necessary

const createNewAdmin = async () => {
    try {
        // Delete all existing admins
        await User.deleteMany({ role: 'Admin' });
        console.log('Deleted all existing admins.');

        // Create a new admin user
        const hashedPassword = await bcrypt.hash('123Zeno', 10); // Change to desired password

        const newAdmin = new User({
            username: 'zenoFuel123', // Desired username
            password: hashedPassword,
            email: 'zenofuel123@example.com', // Optional: provide an email
            contact: '123-456-7890', // Optional: provide a contact number
            accountNo: '1234567890', // Optional: provide an account number
            bankDetails: 'Bank details here', // Optional: provide bank details
            bankName: 'Bank Name', // Optional: provide bank name
            role: 'Admin',
            profilePhoto: 'profile-photo-url' // Optional: provide a profile photo URL
        });

        // Save the new admin user
        await newAdmin.save();
        console.log('New Admin user created');
    } catch (error) {
        console.error('Error creating new admin:', error);
    } finally {
        mongoose.disconnect();
    }
};

// Function to connect to MongoDB and start the seeding process
const start = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected');
        await createNewAdmin();
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

start();
