import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added useNavigate for navigation
import styles from './LeaveTable.module.css';

const LeaveTable = ({ userType = 'Worker' }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Track the logged-in user
  const [editRequest, setEditRequest] = useState(null); // State for the leave request to edit
  const navigate = useNavigate(); // Hook for navigation

  const leaveTypes = [
    "Medical Leave",
    "Casual Leave",
    "Short Leave",
  ]; // Leave types array

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      const token = localStorage.getItem('token');
      setLoading(true); // Start loading
      try {
        // Fetch the current logged-in user data (username and role)
        const userResponse = await fetch('http://localhost:5000/api/attendance/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) throw new Error('Error fetching user data');
        const userData = await userResponse.json();
        setCurrentUser(userData); // Set the logged-in user's data

        // Fetch all leave requests
        const leaveResponse = await fetch('http://localhost:5000/api/leave', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!leaveResponse.ok) throw new Error('Error fetching leave requests');

        const leaveData = await leaveResponse.json();

        // If the user is a manager, show all workers' requests plus their own requests
        let filteredRequests;
        if (userData.role === 'Manager') {
          // Show all requests if the user is a Manager
          filteredRequests = leaveData;
        } else {
          // Otherwise, show only the requests of the logged-in user
          filteredRequests = leaveData.filter(req => req.username === userData.username);
        }

        // Set the filtered leave requests
        setLeaveRequests(filteredRequests);
      } catch (error) {
        setError('Error fetching leave requests');
        console.error(error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchLeaveRequests();
  }, []);

  const handleEdit = (request) => {
    setEditRequest(request); // Set the request to edit
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/leave/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLeaveRequests(leaveRequests.filter(request => request._id !== id));
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/leave/${editRequest._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editRequest), // Send the updated request
      });

      if (response.ok) {
        const updatedLeaveRequests = leaveRequests.map(request =>
          request._id === editRequest._id ? editRequest : request
        );
        setLeaveRequests(updatedLeaveRequests);
        setEditRequest(null); // Clear the edit request
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditRequest(prevRequest => ({
      ...prevRequest,
      [name]: value,
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.leaveTableContainer}>
      <div className={styles.NiflaRecords}>
      <h2> Leave Requests</h2></div>
      <table className={styles.managerleaveTable}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Leave Type</th>
            <th>Date From</th>
            <th>Date To</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.length > 0 ? (
            leaveRequests.map(request => (
              <tr key={request._id}>
                <td>{request.username}</td>
                <td>{request.role}</td>
                <td>{request.leaveType}</td>
                <td>{new Date(request.dateFrom).toLocaleDateString()}</td> {/* Date From */}
                <td>{new Date(request.dateTo).toLocaleDateString()}</td> {/* Date To */}
                <td>{request.description}</td>
                <td>{request.status || 'Pending'}</td>
                <td>
                  <button className={styles.NiflaLeaveEdit}
                    onClick={() => handleEdit(request)} 
                    disabled={request.status === 'Approved'} // Disable if approved
                  >
                    Edit
                  </button>
                  <button className={styles.NiflaLeaveDelete}
                    onClick={() => handleDelete(request._id)} 
                    disabled={request.status === 'Approved'} // Disable if approved
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No leave requests available.</td>
            </tr>
          )}
        </tbody>
      </table>

      {editRequest && ( // Render the edit form if editRequest is set
        <div className={styles.NiflaeditForm}>
          <h3>Edit Leave Request</h3>
          <form onSubmit={handleUpdate}>
            <label>
              Leave Type:
              <select
                name="leaveType"
                value={editRequest.leaveType}
                className={styles.NiflaeditForm2}
                onChange={handleChange}
                required
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Date From:
              <input
                type="date"
                name="dateFrom"
                value={editRequest.dateFrom.split('T')[0]} // Format for date input
                className={styles.NiflaeditForm3}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Date To:
              <input
                type="date"
                name="dateTo"
                value={editRequest.dateTo.split('T')[0]} // Format for date input
                className={styles.NiflaeditForm4}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                name="description"
                value={editRequest.description}
                className={styles.NiflaeditForm5}
                onChange={handleChange}
                required
              />
            </label>
            <button className={styles.UpdateNiflaeditForm4} type="submit">Update</button>
            <button className={styles.CancelNiflaeditForm4} type="button" onClick={() => setEditRequest(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LeaveTable;
