// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    // Fetch only users who are Managers or Workers
    const users = await User.find({ role: { $in: ['Manager', 'Worker'] } });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const { v4: uuidv4 } = require('uuid');

// Create a new user
exports.createUser = async (req, res) => {
  const { username, email, password, role,basicSalary } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      basicSalary  // Include basicSalary
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { username, email, password, role ,basicSalary} = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }
    user.username = username;
    user.email = email;
    user.role = role;
    user.basicSalary = basicSalary;  // Update basicSalary

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
