const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'allahknowsme123@gmail.com',
        pass: 'wqai stfh ftef wnsy'
    }
});

// Controller to request verification code
exports.requestCode = async (req, res) => {
    try {
        const { email } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verificationCode = crypto.randomInt(1000, 9999).toString();
        user.resetPasswordCode = verificationCode;
        user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
        await user.save();

        const mailOptions = {
            from: 'allahknowsme123@gmail.com',
            to: email,
            subject: 'Password Reset Code',
            text: `Your verification code is ${verificationCode}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Verification code sent to email' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller to verify the code
exports.verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.resetPasswordCode !== code || user.resetPasswordExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        res.status(200).json({ token: user.resetPasswordCode });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller to reset the password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({ resetPasswordCode: token });

        if (!user || user.resetPasswordExpiry < Date.now()) {
            return res.status(400).json({ message: 'Password reset link is invalid or has expired' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


