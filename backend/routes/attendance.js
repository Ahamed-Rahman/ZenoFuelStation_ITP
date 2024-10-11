const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave'); // Import the LeaveRequest model
const User = require('../models/User'); // Import the User model
const { authenticateToken } = require('../middleware/authMiddleware');

// GET: Fetch attendance records for Admins
// GET: Fetch attendance records for Admins
router.get('/admin', authenticateToken, async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find().select('username role date checkInTime checkOutTime attendanceStatus'); // Ensure status is selected
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance records.', error });
    }
});

// GET: Fetch attendance records for Managers (only Workers)
router.get('/manager', authenticateToken, async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({ role: 'Worker' });
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance records.', error });
    }
});

// Route to fetch the current user's details
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error });
    }
});

// POST: Mark attendance
// POST: Mark attendance
router.post('/', authenticateToken, async (req, res) => {
    const { username, role, date, checkInTime, checkOutTime } = req.body;

    try {
        // Check if the user has submitted a leave request for the date
        const leaveRequest = await Leave.findOne({ username, dateFrom: { $lte: date }, dateTo: { $gte: date } });
        if (leaveRequest) {
            return res.status(400).json({ message: 'Attendance cannot be marked. You have already submitted a leave request for this date.' });
        }

        // Check if attendance is already marked for the date
        const existingAttendance = await Attendance.findOne({ username, date });
        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked for this date.' });
        }

        const newAttendance = new Attendance({
            username,
            role,
            date,
            checkInTime,
            checkOutTime,
            attendanceStatus: 'Present' // Mark the status as Present if no leave request exists
        });

        await newAttendance.save();
        res.status(201).json({ message: 'Attendance marked successfully', attendance: newAttendance });
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance.', error });
    }
});



// DELETE: Remove an attendance record by ID
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Attendance.findByIdAndDelete(id);

        if (result) {
            res.status(200).json({ message: 'Record deleted successfully' });
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting record', error });
    }
});

// GET: Fetch attendance records (optional, add if you need it)
router.get('/admin', authenticateToken, async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find(); // Ensure 'status' field is part of the response
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance records.', error });
    }
});

// GET: Check attendance for a specific user
router.get('/check/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        const attendanceRecord = await Attendance.findOne({ username });

        if (!attendanceRecord) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.status(200).json(attendanceRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance record', error });
    }
});

// GET: Check if leave request has been submitted for a specific user
router.get('/leave/check/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        const leaveRecord = await Leave.findOne({ username });

        if (!leaveRecord) {
            return res.status(200).json({ hasSubmittedLeave: false });
        }

        res.status(200).json({ hasSubmittedLeave: true });
    } catch (error) {
        res.status(500).json({ message: 'Error checking leave status', error });
    }
});

module.exports = router;
