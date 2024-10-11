const User = require('../models/User'); // Assume you have a User model
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { jsPDF } = require('jspdf');
const html2canvas = require('html2canvas');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');


// Function to create and save PDF
const saveCard = async (req, res) => {
    const { username, email, contact, bankName, accountNo, bankDetails } = req.body;

    // Initialize jsPDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const cardWidth = 180;
    const cardHeight = 95;
    const cardX = (pageWidth - cardWidth) / 2;
    const marginTop = 20;

    // Read background and logo images
    const bgImagePath = path.join(__dirname, '..', 'assets', 'images', 'simple.jpg');
    const logoImagePath = path.join(__dirname, '..', 'assets', 'images', 'logo.png');

    const bgImage = fs.readFileSync(bgImagePath, 'base64');
    const logoImage = fs.readFileSync(logoImagePath, 'base64');

    // Add images and user information to the PDF
    doc.addImage(`data:image/jpg;base64,${bgImage}`, 'JPEG', cardX - 5, marginTop - 5, cardWidth + 10, cardHeight + 10);
    doc.addImage(`data:image/png;base64,${logoImage}`, 'PNG', cardX + 10, marginTop, 30, 30);

    const textX = cardX + 30;
    doc.setFontSize(10);
    doc.text(`Name: ${username}`, textX, marginTop + 60);
    doc.text(`Email: ${email}`, textX, marginTop + 70);
    doc.text(`Contact: ${contact}`, textX, marginTop + 80);
    doc.text(`Bank Name: ${bankName}`, textX + 70, marginTop + 60);
    doc.text(`Account No: ${accountNo}`, textX + 70, marginTop + 70);
    doc.text(`Bank Details: ${bankDetails}`, textX + 70, marginTop + 80);

    // Save the PDF to the backend
    const outputPath = path.join(__dirname, '..', 'cards', `${username}_ID_Card.pdf`);
    doc.save(outputPath);

    // Send this PDF as an email attachment
    sendCardToEmail(email, username, outputPath, res);
};

// Function to send the card via email
const sendCardToEmail = async (email, username, outputPath, res) => {
    console.log('Email:', email); // Log email to debug
    if (!email) {
        console.error('Error: No recipient email defined.');
        return res.status(400).json({ message: 'No recipient email defined.' });
    }

    // Configure Nodemailer transport
    
// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'allahknowsme123@gmail.com',
        pass: 'wqai stfh ftef wnsy'
    }
});

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your Generated ID Card',
        text: `Hello ${username},\n\nPlease find attached your generated ID card.`,
        attachments: [
            {
                filename: `${username}_ID_Card.pdf`,
                path: outputPath,
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email', error });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, contact, accountNo, bankDetails, bankName } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.contact = contact || user.contact;
        user.accountNo = accountNo || user.accountNo;
        user.bankDetails = bankDetails || user.bankDetails;
        user.bankName = bankName || user.bankName;

        // Ensure the profile photo path is correctly stored
        if (req.file) {
            user.profilePhoto = `/uploads/${req.file.filename}`; // Store only the relative path
        }

        await user.save();
        res.json({ message: 'Profile updated successfully!', profilePhoto: user.profilePhoto }); // Return the new profile photo path
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Server error.');
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const profileData = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            contact: user.contact,
            accountNo: user.accountNo,
            bankDetails: user.bankDetails,
            bankName: user.bankName,
            profilePhoto: user.profilePhoto ? `http://localhost:5000${user.profilePhoto}` : null // Correctly form the URL
        };

        res.status(200).json(profileData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile data', error });
    }
};


// Change password route handler
const changePassword = [
    // Validate and sanitize inputs
    body('oldPassword')
        .exists().withMessage('Old password is required'),
    body('newPassword')
        .exists().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),

    // Change password logic
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const userId = req.user._id; // Get user ID from request
            const { oldPassword, newPassword } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Old password is incorrect' });
            }

            if (await bcrypt.compare(newPassword, user.password)) {
                return res.status(400).json({ message: 'New password must be different from the old password' });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];


module.exports = {
    getUserProfile,
    updateProfile,
    changePassword,
    sendCardToEmail,
    saveCard
    
    
};