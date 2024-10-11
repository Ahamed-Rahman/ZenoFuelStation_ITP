import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import 'chart.js/auto'; // Required for Chart.js v3
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SidebarOrderFuel from './SidebarOrderFuel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons'; // FontAwesome download icon
import logoImage from '../../assets/images/logo.png'; // System logo image

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrderQuantityBarChart = () => {
  const [orders, setOrders] = useState([]);
  const chartRef = useRef(null); // Use a ref to access the chart instance

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      Swal.fire('Error!', 'Failed to fetch orders.', 'error');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (!orders.length) {
    return <p>No data available</p>;
  }

  // Prepare data for Bar Chart
  const chartData = {
    labels: orders.map(order => order.itemName),
    datasets: [
      {
        label: 'Quantity Ordered',
        data: orders.map(order => order.quantity),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4, // Rounded corners
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold',
          },
          color: 'black',
        },
      },
      title: {
        display: true,
        text: 'Quantity Ordered for Items',
        font: {
          size: 16,
        },
        color: 'black',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'black',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'black',
        },
      },
    },
  };

  // Function to download chart as PDF with logo
  const downloadChartAsPDF = () => {
    const chart = chartRef.current;
    if (chart) {
        html2canvas(chart.canvas, { scale: 5 }).then((canvas) => { // Increase scale to 3 for better quality
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('portrait', 'mm', 'a4');

        // Add logo to PDF
        const logo = new Image();
        logo.src = logoImage; // The imported logo image path
        logo.onload = () => {
          pdf.addImage(logo, 'PNG', 10, 10, 40, 40); // Add logo at the top-left corner
          pdf.setFontSize(18);
          pdf.text('Orders - Quantity per Item', 60, 20); // Add title below logo

          // Add chart image to PDF
          pdf.addImage(imgData, 'PNG', 10, 60, 190, 100); // Adjust position and size for PDF

          pdf.save('orders_quantity_chart.pdf'); // Save the PDF
        };
      });
    }
  };

  return (
    <SidebarOrderFuel>
      <div
        style={{
          padding: '10px',
          margin: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          marginLeft: '400px',
          width: '900px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#333',
          }}
        >
          Orders - Quantity per Item
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            height: '400px',
            marginBottom: '30px',
          }}
        >
          <Bar ref={chartRef} data={chartData} options={chartOptions} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={downloadChartAsPDF}
            style={{
              backgroundColor: '#1d328e',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              marginLeft: '820px',
            }}
          >
            <FontAwesomeIcon icon={faDownload} />
            
          </button>
        </div>
      </div>
    </SidebarOrderFuel>
  );
};

export default OrderQuantityBarChart;
