const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust the path as necessary

const registerAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('Zeno1234', 10); // Admin password
    const admin = new User({
      username: 'zenoFuelAdmin1',
      password: hashedPassword,
      role: 'Admin',
      email: 'zeno1@example.com',
      contact: '123-456-7890',
      accountNo: '1234567890',
      bankDetails: 'Bank details here',
      bankName: 'Bank Name',
      profilePhoto: 'profile-photo-url'
    });

    await admin.save();
    console.log('Admin registered successfully');
  } catch (error) {
    console.error('Error registering admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

mongoose.connect('mongodb+srv://dbUser:fuel1234@fuelstation.cit7okx.mongodb.net/zenoFuelDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    registerAdmin();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
