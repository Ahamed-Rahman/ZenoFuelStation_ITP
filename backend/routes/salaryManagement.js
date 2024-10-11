// backend/routes/salaryManagement.js
const express = require('express');
const router = express.Router();
const SalaryManagement = require('../models/SalaryManagement');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { authenticateToken } = require('../middleware/authMiddleware');


// GET: Fetch all salary details
// GET: Fetch all salary details for Workers and Managers (exclude Admins)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch all users excluding Admins
    const users = await User.find({ role: { $in: ['Worker', 'Manager'] } });

    // Iterate through each user and calculate their salary
    const salaries = await Promise.all(users.map(async (user) => {
      // Fetch total leaves taken from the Leave collection for each user
      const totalLeavesData = await Leave.aggregate([
        { $match: { username: user.username } },
        { $group: { _id: null, totalDays: { $sum: '$numberOfDays' } } },
      ]);
      const totalLeaves = totalLeavesData.length > 0 ? totalLeavesData[0].totalDays : 0;

      // Calculate final salary based on leaves taken
      const leavesOverLimit = totalLeaves > 4 ? totalLeaves - 4 : 0;
      const dailySalary = user.basicSalary / 30;
      const deduction = dailySalary * leavesOverLimit;
      const finalSalary = user.basicSalary - deduction;

      // Create or update salary data for the user
      const salaryData = await SalaryManagement.findOneAndUpdate(
        { username: user.username },
        { username: user.username, role: user.role, basicSalary: user.basicSalary, totalLeaves, finalSalary },
        { new: true, upsert: true } // Upsert will create the document if it doesn't exist
      );
      
      return salaryData;
    }));

    res.status(200).json(salaries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching salary management data', error });
  }
});

// PUT: Update Final Salary for a User
router.put('/update-final-salary/:username', authenticateToken, async (req, res) => {
  const { username } = req.params;
  const { finalSalary } = req.body;

  try {
    const salaryRecord = await SalaryManagement.findOneAndUpdate(
      { username },
      { finalSalary },
      { new: true }
    );

    if (!salaryRecord) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.status(200).json({ message: 'Final salary updated successfully', finalSalary: salaryRecord.finalSalary });
  } catch (error) {
    res.status(500).json({ message: 'Error updating final salary', error });
  }
});

// DELETE: Delete a user from salary management
router.delete('/delete-user/:username', authenticateToken, async (req, res) => {
  const { username } = req.params;

  try {
    const salaryRecord = await SalaryManagement.findOneAndDelete({ username });
    if (!salaryRecord) {
      return res.status(404).json({ message: 'User not found in salary management' });
    }

    res.status(200).json({ message: 'User deleted from salary management successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user from salary management', error });
  }
});
module.exports = router;
