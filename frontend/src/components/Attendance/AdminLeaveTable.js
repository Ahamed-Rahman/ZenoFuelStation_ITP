import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf'; // Import jsPDF
import 'jspdf-autotable'; // Import jsPDF AutoTable plugin
import styles from './AdminLeaveTable.module.css';
import SidebarAttendance from './SidebarAttendance';
import logoImage from '../../assets/images/logo.png';

const AdminLeaveTable = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(''); // State for status filter


  // Fetch leave requests for the admin
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/leave/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching leave requests');
        }

        const data = await response.json();
        setLeaveRequests(data);
      } catch (error) {
        setError('Error fetching leave requests');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  // Handle approving a leave request
  const handleApprove = async (id) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/leave/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLeaveRequests(leaveRequests.map(req =>
          req._id === id ? { ...req, status: 'Approved' } : req
        ));
      } else {
        console.error("Error approving leave:", await response.json());
      }
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  // Handle declining a leave request
  const handleDecline = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/leave/decline/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLeaveRequests(leaveRequests.map(req =>
          req._id === id ? { ...req, status: 'Declined' } : req
        ));
      }
    } catch (error) {
      console.error('Error declining leave:', error);
    }
  };

  // Filter leave requests based on the status filter
  const filteredRequests = leaveRequests.filter(request =>
    statusFilter ? request.status === statusFilter : true
  );

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Add the logo at the top-left corner
    const logo = new Image();
    logo.src = logoImage;  // The imported logo image
    const logoSize = 30;    // Define the size of the logo
    doc.addImage(logo, 'PNG', 10, 10, logoSize, logoSize);  // Position at (10, 10) and size it accordingly
  
    // Define table columns and rows
    const tableColumn = ["Username", "Role", "Leave Type", "No. of Days", "Date From", "Date To", "Status"];
    const tableRows = [];
  
    filteredRequests.forEach(request => {
      const requestData = [
        request.username,
        request.role,
        request.leaveType,
        request.numberOfDays,
        new Date(request.dateFrom).toLocaleDateString(),
        new Date(request.dateTo).toLocaleDateString(),
        request.status
      ];
      tableRows.push(requestData);
    });
  
    // Add the title below the logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Leave Requests Report', 65, 50);  // Adjust position for the title
  
    // Add the table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,  // Start below the logo and title
    });
  
    // Save the PDF with a name
    doc.save('leave_requests_report.pdf');
  };
  
  // Calculate total leaves taken by each employee
  const employeeLeaveTotals = leaveRequests.reduce((acc, curr) => {
    if (!acc[curr.username]) {
      acc[curr.username] = { totalDays: 0, leaveTypes: {} };
    }
    acc[curr.username].totalDays += curr.numberOfDays;
    if (!acc[curr.username].leaveTypes[curr.leaveType]) {
      acc[curr.username].leaveTypes[curr.leaveType] = curr.numberOfDays;
    } else {
      acc[curr.username].leaveTypes[curr.leaveType] += curr.numberOfDays;
    }
    return acc;
  }, {});

  // Render loading state
  if (loading) return <div>Loading...</div>;
  // Render error state
  if (error) return <div>Error: {error}</div>;

  return (
    <SidebarAttendance>
      <div className={styles.adminLeaveTableContainer}>
        <h2>Admin Leave Requests</h2>

         {/* Dropdown Filter for Status */}
         <div className={styles.NiflaSearching1}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.NiflaSearching1}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
        </div>

        <table className={styles.NiflaLeavetable}>
  <thead>
    <tr>
      <th>Username</th>
      <th>Role</th>
      <th>Leave Type</th>
      <th>No. of Days</th>
      <th>Date From</th>
      <th>Date To</th>
      <th>Description</th> {/* Add description column */}
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredRequests.length > 0 ? (
      filteredRequests.map((leaveRequest) => (
        <tr key={leaveRequest._id}>
          <td>{leaveRequest.username}</td>
          <td>{leaveRequest.role}</td>
          <td>{leaveRequest.leaveType}</td>
          <td>{leaveRequest.numberOfDays}</td>
          <td>{new Date(leaveRequest.dateFrom).toLocaleDateString()}</td>
          <td>{new Date(leaveRequest.dateTo).toLocaleDateString()}</td>
          <td>{leaveRequest.description}</td> {/* Show the description */}
          <td>{leaveRequest.status}</td>
          <td>
            {leaveRequest.status === 'Pending' && (
              <>
                <button
                  className={styles.NiflaapproveButton}
                  onClick={() => handleApprove(leaveRequest._id)}
                >
                  Approve
                </button>
                <button
                  className={styles.NifladeclineButton}
                  onClick={() => handleDecline(leaveRequest._id)}
                >
                  Decline
                </button>
              </>
            )}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="9">No leave requests found.</td> {/* Adjust the colspan */}
      </tr>
    )}
  </tbody>
</table>


        {/* Display total leaves taken by each employee */}
        <div className={styles.NiflaLeve}>
        <h2>Total Leaves Taken by Employees</h2></div>
        <table className={styles.NiflaLeavetable1}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Total Leaves</th>
              <th>Leave Types</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(employeeLeaveTotals).map(([username, data]) => (
              <tr key={username}>
                <td>{username}</td>
                <td>{data.totalDays}</td>
                <td>
                  {Object.entries(data.leaveTypes).map(([type, days]) => (
                    <div key={type}>{`${type}: ${days} day(s)`}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Generate Report Button */}
        <button className={styles.NiflagenerateReportButton} onClick={generatePDF}>
          Generate Report
        </button>
      </div>
    </SidebarAttendance>
  );
};

export default AdminLeaveTable;
