import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';  // Import SweetAlert for confirmation
import styles from './LeaveManagementForm.module.css';

const LeaveManagementForm = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [leaveType, setLeaveType] = useState('Medical Leave');
  const [dateFrom, setDateFrom] = useState(''); // Real-time Date From
  const [dateTo, setDateTo] = useState('');
  const [description, setDescription] = useState('');
  const [totalLeavesTaken, setTotalLeavesTaken] = useState(0); // Total leaves already taken
  const [error, setError] = useState('');
  const [hasMarkedAttendance, setHasMarkedAttendance] = useState(false);
  const [hasSubmittedLeave, setHasSubmittedLeave] = useState(false); // Track if leave has been submitted
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        // Fetch user info
        const response = await fetch('http://localhost:5000/api/attendance/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Error fetching user data');
        const data = await response.json();
        setUsername(data.username);
        setRole(data.role);

        // Check if attendance has been marked
        const attendanceResponse = await fetch(`http://localhost:5000/api/attendance/check/${data.username}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const attendanceData = await attendanceResponse.json();
        setHasMarkedAttendance(attendanceData.hasMarkedAttendance);

        // Check if leave has been submitted
        const leaveResponse = await fetch(`http://localhost:5000/api/leave/check/${data.username}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const leaveData = await leaveResponse.json();
        setHasSubmittedLeave(leaveData.hasSubmittedLeave);

        // Fetch total leaves taken
        const totalLeavesResponse = await fetch(`http://localhost:5000/api/leave/total-leaves/${data.username}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const totalLeavesData = await totalLeavesResponse.json();
        setTotalLeavesTaken(totalLeavesData.totalLeaves);

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    // Set real-time Date From to current date
    const today = new Date().toISOString().slice(0, 10);
    setDateFrom(today);

    if (id) {
      // Fetch existing leave data (for editing)
      const fetchLeaveData = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`http://localhost:5000/api/leave/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await response.json();
          setLeaveType(data.leaveType);
          setDateTo(data.dateTo);
          setDescription(data.description);
        } catch (error) {
          console.error('Error fetching leave data:', error);
        }
      };
      fetchLeaveData();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (hasMarkedAttendance) {
      setError('You cannot submit a leave request after marking attendance.');
      return;
    }
    if (hasSubmittedLeave) {
      setError('You have already submitted a leave request.');
      return;
    }

    // Validate date input
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const timeDiff = toDate - fromDate;
    const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Include both start and end date

    if (numberOfDays <= 0) {
      setError('The "Date To" must be after "Date From".');
      return;
    }

    // Validate leave type durations
    let maxAllowedDays;
    let leaveTypeMessage = ''; // Store message for leave confirmation
    if (leaveType === 'Medical Leave') {
      maxAllowedDays = 2;
      leaveTypeMessage = 'Medical leaves can only be taken for 2 days per month.';
    } else if (leaveType === 'Casual Leave') {
      maxAllowedDays = 1;
      leaveTypeMessage = 'Casual leaves can only be taken for 1 day per month.';
    } else if (leaveType === 'Short Leave') {
      maxAllowedDays = 1;
      leaveTypeMessage = 'Short leaves can only be taken for 1 day per month.';
    } else {
      maxAllowedDays = 0; // For other leave types, adjust accordingly
    }

    // Step 1: Check if total leave days exceed the leave type max limit
    if (numberOfDays > maxAllowedDays) {
      // Show confirmation if leave exceeds allowed days for the leave type
      Swal.fire({
        title: 'Confirm Leave Submission',
        text: `${leaveTypeMessage} You have already taken ${totalLeavesTaken} day(s) of leave. For this leave, amount will be deducted from your salary. Do you want to proceed?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, submit',
        cancelButtonText: 'No, cancel'
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Proceed with leave submission
          await submitLeave(numberOfDays); // Ensure `submitLeave` is called
        }
      });
    } else if (totalLeavesTaken + numberOfDays > 4) {
      // Step 2: Check if the total leave exceeds 4 days
      Swal.fire({
        title: 'Confirm Exceeding Leave Submission',
        text: `You have exceeded the maximum total leave allowance of 4 days. Amount will be deducted from your salary. Do you want to proceed?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, submit',
        cancelButtonText: 'No, cancel'
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Proceed with leave submission
          await submitLeave(numberOfDays);
        }
      });
    } else {
      // Proceed normally if within the allowed days
      await submitLeave(numberOfDays);
    }
  };

  // Ensure that this function is called inside the SweetAlert `then` block
  const submitLeave = async (numberOfDays) => {
    const token = localStorage.getItem('token');
    const leaveData = { username, role, leaveType, dateFrom, dateTo, description, numberOfDays };
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(`http://localhost:5000/api/leave${id ? `/${id}` : ''}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(leaveData),
      });

      if (response.ok) {
        Swal.fire('Success!', 'Leave request submitted successfully!', 'success');
        navigate('/worker-welcome/leave-records');
      } else {
        const data = await response.json();
        setError(data.message || 'Error submitting leave request.');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleViewLeaveRequests = () => {
    if (role === 'Worker') {
      navigate('/worker-welcome/leave-records');
    } else if (role === 'Manager') {
      navigate('/manager-welcome/leave-records');
    }
  };

  return (
    <div className={styles.NiflaleaveContainer}>
      <div className={styles.NiflaleaveContainerhead}>
      <h2>{id ? 'Edit Leave Request' : 'Leave Management'}</h2></div>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} className={styles.NiflaleaveContainer1} readOnly />
          
        </label>
        <label>
          Role:
          <input type="text" value={role}  className={styles.NiflaleaveContainer1} readOnly />
      
        </label>
        <label>
          Leave Type:
          
          <select value={leaveType} className={styles.NiflaleaveContainer3} onChange={(e) => setLeaveType(e.target.value)} required>
            <option value="Medical Leave">Medical Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Short Leave">Short Leave</option>
            {/* Add other leave types if necessary */}
          </select>
        </label>
        <label>
          Date From:
          <input type="date" value={dateFrom}    className={styles.NiflaleaveContainer1} readOnly required />

        </label>
        <label>
          Date To:
          <input type="date" value={dateTo} className={styles.NiflaleaveContainer1} onChange={(e) => setDateTo(e.target.value)} required />
        </label>
        <label>
          Description:
          <textarea value={description} className={styles.NiflaleaveContainer2} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.NiflaSubmitContainer2} type="submit" disabled={hasMarkedAttendance || hasSubmittedLeave}>
          {id ? 'Update Leave' : 'Submit Leave'}
        </button>
      </form>
<div>
      <button className={styles.NiflaSubmitContainer3} onClick={handleViewLeaveRequests}>
        View Leave Requests
      </button>
      </div>
    </div>
  );
};

export default LeaveManagementForm;
