import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // For handling route params and navigation

const EditLeaveForm = () => {
  const { id } = useParams(); // Get leave request ID from the URL
  const [leaveRequest, setLeaveRequest] = useState({
    leaveType: '',
    date: '',
    description: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/leave/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Error fetching leave request');

        const data = await response.json();
        setLeaveRequest({
          leaveType: data.leaveType,
          date: new Date(data.date).toISOString().split('T')[0], // Format date for input field
          description: data.description,
          status: data.status || 'Pending',
        });
      } catch (error) {
        setError('Error fetching leave request');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequest();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/leave/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(leaveRequest),
      });

      if (response.ok) {
        navigate('/leave'); // Redirect back to the leave list page
      } else {
        throw new Error('Error updating leave request');
      }
    } catch (error) {
      setError('Error updating leave request');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Edit Leave Request</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Leave Type:
          <input
            type="text"
            name="leaveType"
            value={leaveRequest.leaveType}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={leaveRequest.date}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={leaveRequest.description}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Status:
          <select
            name="status"
            value={leaveRequest.status}
            onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
        <button type="submit">Update Leave Request</button>
      </form>
    </div>
  );
};

export default EditLeaveForm;
