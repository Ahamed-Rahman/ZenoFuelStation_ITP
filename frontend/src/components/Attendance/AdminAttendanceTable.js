import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';  // Import SweetAlert2
import styles from './AdminAttendanceTable.module.css'; // Adjust the path as needed
import SidebarAttendance from './SidebarAttendance';
import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation
import 'jspdf-autotable'; // Import autoTable plugin
import logoImage from '../../assets/images/logo.png'; // Import the logo image

const AdminAttendanceTable = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/attendance/admin', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Error fetching attendance records');
            }

            const data = await response.json();
            console.log('Fetched Records:', data); // Verify if 'attendanceStatus' is present
            setAttendanceRecords(data);
            setFilteredRecords(data); // Initialize filtered records
        } catch (error) {
            console.error('Error fetching attendance records:', error);
        }
    };

    fetchRecords();
}, []);


  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/attendance/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const newRecords = attendanceRecords.filter(record => record._id !== id);
          setAttendanceRecords(newRecords);
          setFilteredRecords(newRecords); // Update filtered records after deletion
          Swal.fire(
            'Deleted!',
            'The record has been deleted.',
            'success'
          );
        } else {
          console.error('Error deleting record');
          Swal.fire(
            'Error!',
            'There was a problem deleting the record.',
            'error'
          );
        }
      } catch (error) {
        console.error('Network error:', error);
        Swal.fire(
          'Error!',
          'Network error occurred while deleting the record.',
          'error'
        );
      }
    }
  };

  const handleDateFilter = (e) => {
    const selectedDate = e.target.value;
    setFilterDate(selectedDate);

    if (selectedDate === '') {
      setFilteredRecords(attendanceRecords); // If no date is selected, show all records
    } else {
      const filtered = attendanceRecords.filter((record) =>
        new Date(record.date).toLocaleDateString() === new Date(selectedDate).toLocaleDateString()
      );
      setFilteredRecords(filtered);
    }
  };

  
  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Add the logo at the top-left corner
    const logo = new Image();
    logo.src = logoImage;  // The imported logo image
    const logoSize = 30;    // Define the size of the logo
    doc.addImage(logo, 'PNG', 10, 10, logoSize, logoSize);  // Position at (10, 10) and size it accordingly
  
    // Define table columns and rows
    const tableColumn = ["ID", "Username", "Role", "Date", "Check In Time", "Check Out Time", "AttendanceStatus"];
    const tableRows = [];
  
    filteredRecords.forEach((record, index) => {
      const recordData = [
        index + 1,
        record.username,
        record.role,
        new Date(record.date).toLocaleDateString(),
        record.checkInTime,
        record.checkOutTime,
        record.attendanceStatus
      ];
      tableRows.push(recordData);
    });
  
    // Add the title below the logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Attendance Records Report', 65, 50);  // Adjust position for the title
  
    // Add the table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,  // Start below the logo and title
    });
  
    // Get the Y position where the table ends
    let finalY = doc.autoTable.previous.finalY || 60;
  
    // Add the thank you text below the table
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
  
    // Set text color to light gray
    doc.setTextColor(169, 169, 169);  // RGB for light gray
  
    // Center the text
    const pageWidth = doc.internal.pageSize.getWidth();
    const thankYouMessage = 'Thank you for reviewing the attendance report. Please contact us for more information.';
    doc.text(thankYouMessage, pageWidth / 2, finalY + 20, { align: 'center' });
  
    // Save the PDF with a name
    doc.save('attendance_records_report.pdf');
  };
  
  
  return (
    <SidebarAttendance>
      <div className={styles.Niflaadbg}>
        <div className={styles.NiflaHeading}>
        <h2> Attendance Records</h2>

        {/* Date Filter */}
        <div className={styles.NiflaSearching}>
         
          <input
            type="date"
            id="filterDate"
            value={filterDate}
            onChange={handleDateFilter}
            className={styles.NiflaSearching}
          />
        </div>

        <table className={styles.Niflatable}>
        <thead>
  <tr>
    <th>ID</th>
    <th>Username</th>
    <th>Role</th>
    <th>Date</th>
    <th>Check In Time</th>
    <th>Check Out Time</th>
    <th>Attendance Status</th> {/* Correct header for the attendance status column */}
  </tr>
</thead>

<tbody>
  {filteredRecords.length > 0 ? (
    filteredRecords.map((record, index) => (
      <tr key={record._id}>
        <td>{index + 1}</td>
        <td>{record.username}</td>
        <td>{record.role}</td>
        <td>{new Date(record.date).toLocaleDateString()}</td>
        <td>{record.checkInTime}</td>
        <td>{record.checkOutTime}</td>
        <td>{record.attendanceStatus ? record.attendanceStatus : 'Not Available'}</td> {/* Ensure status is displayed */}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className={styles.noRecords}>No records found</td>
    </tr>
  )}
</tbody>



        </table>

         {/* Generate Report Button */}
         <button className={styles.NiflagenerateReportButton1} onClick={generatePDF}>
          Generate Report
        </button>
      </div>
      </div>
    </SidebarAttendance>
  );
};

export default AdminAttendanceTable;
