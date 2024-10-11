import React, { useState, useEffect, useRef } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import styles from './Charts.module.css'; // Import CSS Module
import SidebarUser from '../User/SidebarUser';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoImage from '../../assets/images/logo.png'; // Import the logo


const Charts = () => {
  const [userRolesData, setUserRolesData] = useState({ Manager: 0, Worker: 0 });
  const pieChartRef = useRef(null); 
  const barChartRef = useRef(null); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const roleCount = data.reduce(
            (acc, user) => {
              acc[user.role] = acc[user.role] ? acc[user.role] + 1 : 1;
              return acc;
            },
            { Manager: 0, Worker: 0 }
          );
          setUserRolesData(roleCount);
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  // Data for Pie Chart with Sky Baby Blue and Pink
  const pieData = {
    labels: ['Manager', 'Worker'],
    datasets: [
      {
        label: 'User Distribution by Role',
        data: [userRolesData.Manager, userRolesData.Worker],
        backgroundColor: ['#87CEEB', '#FFC0CB'], 
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Options for Pie Chart with aspect ratio fixes
  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} users`,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: true,  // Ensures aspect ratio is maintained
    layout: {
      padding: {
        top: 20,
        bottom: 20
      }
    },
    aspectRatio: 1, // Forces a 1:1 aspect ratio for a circular pie chart
  };

  // Data for Bar Chart
  const barData = {
    labels: ['Manager', 'Worker'],
    datasets: [
      {
        label: 'User Count per Role',
        data: [userRolesData.Manager, userRolesData.Worker],
        backgroundColor: '#87CEEB',
        borderColor: '#fff',
        borderWidth: 2,
        borderRadius: 15,
      },
    ],
  };

  // Options for Bar Chart
  const barOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} users`,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#333',
        },
      },
      y: {
        grid: {
          borderDash: [5, 5],
          borderColor: '',
        },
        ticks: {
          callback: (value) => `${value} users`,
          color: '#333',
        },
      },
    },
  };

  // Function to download each chart as a separate PDF
  const downloadChartAsPDF = (chartRef, chartTitle) => {
    const chart = chartRef.current;
    if (chart) {
      html2canvas(chart.canvas, { scale: 5 }).then((canvas) => { // Increase scale to 3 for better quality
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        
        const logo = new Image();
        logo.src = logoImage;
        logo.onload = () => {
          pdf.addImage(logo, 'PNG', 10, 10, 30, 30);
          pdf.setFontSize(16);
          pdf.text(chartTitle, 105, 50, { align: 'center' });
          pdf.addImage(imgData, 'PNG', 25, 60, 160, 160); // Adjusted size and positioning for pie chart
          pdf.save(`${chartTitle}.pdf`);
        };
      });
    }
  };
  return (
    <SidebarUser>
      <div className={styles.chartsContainer}>
        <h2 className={styles.title}>User Role Distribution</h2>
        <div className={styles.chartWrapper}>
          {/* Pie Chart */}
          <div className={styles.pieChartContainer}>
            <h3 className={styles.chartTitle}>Pie Chart: Distribution of Users by Role</h3>
            <div className={styles.pieChart}>
              <Pie ref={pieChartRef} data={pieData} options={pieOptions} />
            </div>
            <button
              onClick={() => downloadChartAsPDF(pieChartRef, 'User_Role_Distribution_Pie_Chart')}
              style={{
                marginTop: '10px',
                backgroundColor: '#1d328e',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                marginLeft:'400px'
              }}
            >
              <FontAwesomeIcon icon={faDownload} /> 
            </button>
          </div>

          {/* Bar Chart */}
          <div className={styles.barChartContainer}>
            <h3 className={styles.chartTitle}>Bar Chart: User Count per Role</h3>
            <div className={styles.barChart}>
              <Bar ref={barChartRef} data={barData} options={barOptions} />
            </div>
            <button
              onClick={() => downloadChartAsPDF(barChartRef, 'User_Count_Per_Role_Bar_Chart')}
              style={{
                marginTop: '10px',
                backgroundColor: '#1d328e',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                marginLeft:'400px'
              }}
            >
              <FontAwesomeIcon icon={faDownload} /> 
            </button>
          </div>
        </div>
      </div>
    </SidebarUser>
  );
};

export default Charts;
