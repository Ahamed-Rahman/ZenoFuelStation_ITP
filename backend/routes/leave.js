const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const { authenticateToken } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');



// Function to fetch user data (username and role) from JWT
const fetchUserData = (req) => {
  const token = req.headers['authorization'].split(' ')[1];  // Extract the token from the Authorization header
  if (!token) {
    throw new Error('Token not provided');
  }
  const userData = jwt.verify(token, process.env.JWT_SECRET);  // Decode the token using the JWT secret
  return userData;  // Return user data, which should include username and role
};

// POST: Submit a leave request
// POST: Submit a leave request
router.post('/', authenticateToken, async (req, res) => {
  const { username, role, leaveType, dateFrom, dateTo, description, numberOfDays } = req.body;

  if (!dateFrom || !dateTo || !numberOfDays) {
    return res.status(400).json({ message: 'DateFrom, DateTo, and numberOfDays are required.' });
  }

  try {
    // Calculate the maximum allowed days for the leave type
    let maxAllowedDays;
    if (leaveType === 'Medical Leave') {
      maxAllowedDays = 2;
    } else if (leaveType === 'Casual Leave') {
      maxAllowedDays = 1;
    } else if (leaveType === 'Short Leave') {
      maxAllowedDays = 1;
    } else {
      maxAllowedDays = 0; // For other leave types, adjust accordingly
    }

    // Fetch total leaves taken by the user
    const totalLeaves = await Leave.aggregate([
      { $match: { username: username } },
      { $group: { _id: null, totalDays: { $sum: '$numberOfDays' } } },
    ]);

    const totalLeavesTaken = totalLeaves.length > 0 ? totalLeaves[0].totalDays : 0;

    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      username,
      $or: [
        { dateFrom: { $lte: dateTo, $gte: dateFrom } },
        { dateTo: { $gte: dateFrom, $lte: dateTo } },
      ],
    });

    if (overlappingLeave) {
      return res.status(400).json({ message: 'You have already applied for leave during this period.' });
    }

    // Check if salary deduction is needed
    const needsSalaryDeduction = numberOfDays > maxAllowedDays || totalLeavesTaken + numberOfDays > 4;

    // Create and save the new leave request
    const newLeave = new Leave({
      username,
      role,
      leaveType,
      dateFrom,
      dateTo,
      description,
      numberOfDays,
      needsSalaryDeduction,
    });

    await newLeave.save();

    // Mark attendance as absent for the leave period
    for (let d = new Date(dateFrom); d <= new Date(dateTo); d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];

      const existingAttendance = await Attendance.findOne({ username, date: dateString });

      if (!existingAttendance) {
        // No attendance record exists, create one and mark it as Absent
        await new Attendance({
          username,
          role,
          date: dateString,
          checkInTime: 'Not Marked',
          checkOutTime: 'Not Marked',
          attendanceStatus: 'Absent',
        }).save();
      } else {
        // Attendance exists, update the status to 'Absent'
        await Attendance.updateOne({ username, date: dateString }, { attendanceStatus: 'Absent' });
      }
    }

    // Return success response
    res.status(201).json({
      message: 'Leave request submitted successfully',
      needsSalaryDeduction,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting leave request', error });
  }
});


// GET: Fetch all leave requests for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, username } = fetchUserData(req);  // Fetch user role and username from the token
    console.log("Fetching leave requests for:", username, "with role:", role);  // Debugging info

    let leaveRequests;

    // If the user is a worker, show only their own leave requests
    if (role === 'Worker') {
      leaveRequests = await Leave.find({ role:'Worker' });
      console.log("Worker leave requests:", leaveRequests);  // Debugging info
    } 
    // If the user is a manager, show all workers' leave requests
    else if (role === 'Manager') {
      leaveRequests = await Leave.find({ role: 'Manager' });
      console.log("Manager viewing workers' leave requests:", leaveRequests);  // Debugging info
    } 
    // If the user is an admin, show all leave requests (this should be handled by the admin route)
    else {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (leaveRequests.length === 0) {
      console.log("No leave requests found for the user");
    }

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);  // Log the error
    res.status(500).json({ message: 'Error fetching leave requests', error });
  }
});


// Other routes for admin, approve, decline, check leave status, etc.
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const leaveRequests = await Leave.find({});
    res.json(leaveRequests); // Admin can view all leave requests
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests for Admin', error });
  }
});

// GET: Admin fetches all leave requests
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const leaveRequests = await Leave.find({});
    res.json(leaveRequests); // Admin can view all leave requests
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests for Admin', error });
  }
});

// PUT: Approve a leave request by ID
router.put('/approve/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Update only the status field without triggering validation on other fields
    const leave = await Leave.findByIdAndUpdate(
      id, 
      { status: 'Approved' },
      { runValidators: false, new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json({ message: 'Leave approved successfully', leave });
  } catch (error) {
    res.status(500).json({ message: 'Error approving leave', error });
  }
});

// PUT: Decline a leave request by ID
router.put('/decline/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Update only the status field without triggering validation on other fields
    const leave = await Leave.findByIdAndUpdate(
      id, 
      { status: 'Declined' },
      { runValidators: false, new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json({ message: 'Leave declined successfully', leave });
  } catch (error) {
    res.status(500).json({ message: 'Error declining leave', error });
  }
});

// GET: Check if leave has been submitted by a user
router.get('/check/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const today = new Date().toISOString().slice(0, 10);
    const leaveRecord = await Leave.findOne({ username, dateFrom: { $lte: today }, dateTo: { $gte: today } });

    if (!leaveRecord) {
      return res.status(200).json({ hasSubmittedLeave: false });
    }

    res.status(200).json({ hasSubmittedLeave: true });
  } catch (error) {
    res.status(500).json({ message: 'Error checking leave status', error });
  }
});

// GET: Get total leaves taken by a user
router.get('/total-leaves/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    const totalLeaves = await Leave.aggregate([
      { $match: { username: username } },
      { $group: { _id: null, totalDays: { $sum: '$numberOfDays' } } },
    ]);

    const totalLeavesTaken = totalLeaves.length > 0 ? totalLeaves[0].totalDays : 0;

    res.status(200).json({ totalLeaves: totalLeavesTaken });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching total leaves', error });
  }
});

// GET: Get leave requests for the logged-in user (worker or manager)
// GET: Get leave requests for the logged-in user (worker or manager)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, username } = fetchUserData(req);  // Fetch user role and username from the token
    console.log("Fetching leave requests for:", username, "with role:", role);  // Debugging info

    let leaveRequests;

    // If the user is a worker, show only their own leave requests
    if (role === 'Worker') {
      leaveRequests = await Leave.find({ role:'Worker' });
      console.log("Worker leave requests:", leaveRequests);  // Debugging info
    } 
    // If the user is a manager, show all workers' leave requests
    else if (role === 'Manager') {
      leaveRequests = await Leave.find({ role: 'Manager' });
      console.log("Manager viewing workers' leave requests:", leaveRequests);  // Debugging info
    } 
    // If the user is an admin, show all leave requests (this should be handled by the admin route)
    else {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (leaveRequests.length === 0) {
      console.log("No leave requests found for the user");
    }

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);  // Log the error
    res.status(500).json({ message: 'Error fetching leave requests', error });
  }
});

// PUT: Update a leave request by ID
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { leaveType, dateFrom, dateTo, description, numberOfDays, status } = req.body;

    // Find the leave request by ID and update it
    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { leaveType, dateFrom, dateTo, description, numberOfDays, status },
      { new: true } // Return the updated document
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json({ message: 'Leave request updated successfully', updatedLeave });
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave request', error });
  }
});

// DELETE: Delete a leave request by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the leave request by ID
    const leave = await Leave.findByIdAndDelete(id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting leave request', error });
  }
});



module.exports = router;
