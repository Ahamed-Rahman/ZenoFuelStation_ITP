import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SidebarOrder from './SidebarOrder';
import jsPDF from 'jspdf'; // Import jsPDF
import html2canvas from 'html2canvas'; // Import html2canvas
import logoImage from '../../assets/images/logo.png'; // System logo image

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrderedItemsBarChart = () => {
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ordersShop', {
        headers: {
          'Authorization': `Bearer ${token}` // Include token in the headers
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Swal.fire('Error', 'Failed to fetch orders', 'error');
    }
  };

  // Prepare data for the bar chart
  const chartData = {
    labels: orders.map(order => order.itemName), // Item names as labels
    datasets: [
      {
        label: 'Quantity Ordered',
        data: orders.map(order => order.quantityOrdered), // Quantities as data
        backgroundColor: 'rgba(54, 162, 235, 0.7)', // Bar color
        borderColor: 'rgba(54, 162, 235, 1)', // Bar border color
        borderWidth: 2, // Bar border width
        hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)', // Change color on hover
        hoverBorderColor: 'rgba(255, 99, 132, 1)', // Border on hover
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { 
        display: true, 
        text: 'Ordered Items Quantity',
        font: { size: 18, family: 'Arial', weight: 'bold' },
        color: '#333',
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { font: { size: 14 }, color: '#333' },
      },
      y: { 
        beginAtZero: true, 
        ticks: { font: { size: 14 }, color: '#333' },
        grid: { color: '#ccc' },
      },
    },
    elements: {
      bar: {
        borderRadius: 10, // Rounded bar corners
      },
    },
  };

  // Function to download chart as PDF
  const downloadChartAsPDF = () => {
    const chartElement = document.getElementsByTagName('canvas')[0];
    if (chartElement) {
      html2canvas(chartElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('portrait', 'mm', 'a4');

        // Add the logo to the PDF
        const img = new Image();
        img.src = logoImage;
        pdf.addImage(img, 'PNG', 10, 10, 40, 40); // Add logo to the top-left corner

        pdf.setFontSize(18);
        pdf.text('Ordered Items Chart', pdf.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
        
        // Add the chart image to the PDF
        pdf.addImage(imgData, 'PNG', 10, 70, 190, 100); // Adjust width and height accordingly
        pdf.save('Ordered_Items_Chart.pdf');
      });
    }
  };

  return (
    <SidebarOrder>
      <div  style={{
          padding: '10px',
          margin: '20px',
          backgroundColor: '#ffff',
          borderRadius: '8px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          marginLeft: '400px',
          width: '900px',
        }}>
        <h2 style={{ fontFamily: 'Arial, sans-serif', color: '#333', textAlign:'center'}}>Ordered Items Chart</h2>
        <div style={{ width: '80%', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '10px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Download button with icon */}
        <button
          onClick={downloadChartAsPDF}
          style={{
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
          
            textAlign: 'center',
            width: 'fit-content',
            marginLeft:'850px'
          }}
        >
          <i className="fas fa-download"></i> 

        </button>
      </div>
    </SidebarOrder>
  );
};

export default OrderedItemsBarChart;
