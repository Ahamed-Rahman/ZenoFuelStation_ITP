import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';  // Import chart.js
import SidebarAttendance from './SidebarAttendance';

const AttendancePieChart = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [presentCount, setPresentCount] = useState(0);
    const [absentCount, setAbsentCount] = useState(0);
  
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
          setAttendanceRecords(data);
        } catch (error) {
          console.error('Error fetching attendance records:', error);
        }
      };
  
      fetchRecords();
    }, []);
  
    const handleDateFilter = (e) => {
      const selectedDate = e.target.value;
      setFilterDate(selectedDate);
  
      const filtered = attendanceRecords.filter((record) =>
        new Date(record.date).toLocaleDateString() === new Date(selectedDate).toLocaleDateString()
      );
      
      setFilteredRecords(filtered);
      
      // Count Present and Absent for the selected date
      const present = filtered.filter((record) => record.attendanceStatus === 'Present').length;
      const absent = filtered.filter((record) => record.attendanceStatus === 'Absent').length;
      
      setPresentCount(present);
      setAbsentCount(absent);
    };
  
    // Data for Pie Chart
    const data = {
      labels: ['Present', 'Absent'],
      datasets: [
        {
          label: 'Attendance Status',
          data: [presentCount, absentCount],
          backgroundColor: ['#4caf50', '#f44336'], // Colors for Present and Absent
        },
      ],
    };
  
    const options = {
      responsive: true,
      maintainAspectRatio: false,
    };
  
    return (
        <SidebarAttendance>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Attendance Pie Chart</h2>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="date"
            value={filterDate}
            onChange={handleDateFilter}
            style={{
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>
  
        {/* White container with curved borders */}
        <div
          style={{
            width: '450px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '15px', // Curved border
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Light shadow for 3D effect
          }}
        >
          <div style={{ width: '400px', height: '400px', margin: '0 auto' }}>
            <Pie data={data} options={options} />
          </div>
        </div>
      </div>
      </SidebarAttendance>
    );
  };
  
  export default AttendancePieChart;