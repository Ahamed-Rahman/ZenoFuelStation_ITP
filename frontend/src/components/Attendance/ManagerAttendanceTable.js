import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import styles from './ManagerAttendanceTable.module.css'; // Adjust the path as needed
import { jsPDF } from 'jspdf'; // Import jsPDF
import 'jspdf-autotable'; // Import jsPDF AutoTable plugin
import logoImage from '../../assets/images/logo.png'; // Adjust path to your logo image


const ManagerAttendanceTable = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]); // State for filtered records
  const [filterDate, setFilterDate] = useState(''); // State for date filter

  useEffect(() => {
    const fetchRecords = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/attendance/manager', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Error fetching attendance records');
        }

        const data = await response.json();
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
      text: 'This action will permanently delete the record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
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
          Swal.fire('Deleted!', 'The record has been deleted.', 'success');
        } else {
          Swal.fire('Error!', 'There was an issue deleting the record.', 'error');
        }
      } catch (error) {
        console.error('Network error:', error);
        Swal.fire('Error!', 'There was a network error.', 'error');
      }
    }
  };

  // Handle date filtering
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
      logo.src = logoImage; // The imported logo image
      const logoSize = 30; // Define the size of the logo
      doc.addImage(logo, 'PNG', 10, 10, logoSize, logoSize); // Position at (10, 10) and size it accordingly
  
      // Define table columns and rows
      const tableColumn = ["ID", "Username", "Date", "Check In", "Check Out"];
      const tableRows = [];
  
      filteredRecords.forEach((record, index) => {
        const recordData = [
          index + 1,
          record.username,
          new Date(record.date).toLocaleDateString(),
          record.checkInTime,
          record.checkOutTime,
        ];
        tableRows.push(recordData);
      });
  
      // Add the title below the logo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Attendance Report', 65, 50); // Adjust position for the title
  
      // Add the table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60, // Start below the logo and title
      });
  
      // Add a thank-you message
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(128, 128, 128); // Light gray color
      doc.text('Thank you for reviewing the attendance report.', doc.internal.pageSize.getWidth() / 2, doc.autoTable.previous.finalY + 20, { align: 'center' });
  
      // Save the PDF with a name
      doc.save('attendance_report.pdf');
    };
    
  return (
    <div className={styles.tableContainer}>
      <div className={styles.ManagerHead}>
        <h2>Manager Attendance Records</h2>
      </div>

      {/* Date Filter */}
      <div className={styles.NiflaSearching5}>
       
        <input
          type="date"
          id="filterDate"
          value={filterDate}
          onChange={handleDateFilter}
          className={styles.NiflaSearching5}
        />
      </div>

      <table className={styles.Niflamanagertable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Date</th> {/* Added Date Column */}
            <th>Check In Time</th>
            <th>Check Out Time</th>
            
            <th>AttendanceStatus</th>
            
          </tr>
        </thead>
        <tbody>
  {filteredRecords.length > 0 ? (
    filteredRecords.map((record, index) => (
      <tr key={record._id}>
        <td>{index + 1}</td>
        <td>{record.username}</td>
        <td>{new Date(record.date).toLocaleDateString()}</td> {/* Date column */}
        <td>{record.checkInTime}</td>
        <td>{record.checkOutTime}</td>
        <td>{record.attendanceStatus ? record.attendanceStatus : 'No Status'}</td> {/* Display attendanceStatus */}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className={styles.noRecords}>No records found</td>
    </tr>
  )}
</tbody>

      </table>

            {/* Generate Report Button */}
            <button className={styles.NiflagenerateReportButton6} onClick={generatePDF}>
        Generate Report
      </button>

    </div>
  );
};

export default ManagerAttendanceTable;
