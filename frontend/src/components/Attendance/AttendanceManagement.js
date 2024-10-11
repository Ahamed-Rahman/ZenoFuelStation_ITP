import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import styles from './LeaveManagementForm.module.css';

const AttendanceManagement = () => {
  const [user, setUser] = useState({ username: '', role: '' });
  const [date, setDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [minCheckOutTime, setMinCheckOutTime] = useState('');
  const [hasSubmittedLeave, setHasSubmittedLeave] = useState(false); // Track if leave is submitted
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:5000/api/attendance/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Error fetching user data');
        }

        const data = await response.json();
        setUser({ username: data.username, role: data.role });

        // Check if leave has been submitted
        const leaveResponse = await fetch(`http://localhost:5000/api/leave/check/${data.username}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const leaveData = await leaveResponse.json();
        setHasSubmittedLeave(leaveData.hasSubmittedLeave);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error fetching user data');
      }
    };

    fetchUserData();

    // Set today's date
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);

    // Set check-in time as current real-time and it's not editable
    const now = new Date();
    const checkIn = now.toTimeString().slice(0, 5); // HH:MM format
    setCheckInTime(checkIn);

    // Calculate minimum check-out time (5 hours after check-in)
    now.setHours(now.getHours() + 5);
    const minCheckOut = now.toTimeString().slice(0, 5); // HH:MM format
    setMinCheckOutTime(minCheckOut);
    setCheckOutTime(minCheckOut); // Set default check-out to 5 hours after check-in

  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasSubmittedLeave) {
      setError('You cannot mark attendance after submitting a leave request.');
      return;
    }

    const token = localStorage.getItem('token');
    const attendanceData = { username: user.username, role: user.role, date, checkInTime, checkOutTime };

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Confirm Attendance',
      text: 'Are you sure you want to mark attendance?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, mark it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('http://localhost:5000/api/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(attendanceData),
        });

        if (response.ok) {
          Swal.fire(
            'Success!',
            'Attendance marked successfully!',
            'success'
          );
          // Optionally clear the form fields
          setDate('');
          setCheckInTime('');
          setCheckOutTime('');
        } else {
          const data = await response.json();
          setError(data.message || 'Error marking attendance.');
          Swal.fire(
            'Error!',
            data.message || 'Error marking attendance.',
            'error'
          );
        }
      } catch (error) {
        setError('Network error');
        Swal.fire(
          'Network Error!',
          'There was an issue connecting to the server.',
          'error'
        );
      }
    }
  };

  return (
    <div className={styles.NiflaleaveContainer}>
      <div className={styles.NiflaleaveContainerhead}>
      <h2>Attendance Marking</h2></div>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" className={styles.NiflaleaveContainer1} value={user.username} readOnly />
        </label>
        <label>
          Role:
          <input type="text" className={styles.NiflaleaveContainer1} value={user.role} readOnly />
        </label>
        <label>
          Date:
          <input type="date" className={styles.NiflaleaveContainer1} value={date} readOnly required />
        </label>
        <label>
          Check In Time:
          <input type="time" className={styles.NiflaleaveContainer1} value={checkInTime} readOnly required />
        </label>
        <label>
          Check Out Time:
          <input
            type="time"
            className={styles.NiflaleaveContainer1}
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            min={minCheckOutTime} // Set the minimum selectable check-out time to 5 hours after check-in
            required
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.NiflaSubmitContainer3}  type="submit" disabled={hasSubmittedLeave}>
          Mark Attendance
        </button>
      </form>
    </div>
  );
};

export default AttendanceManagement;
