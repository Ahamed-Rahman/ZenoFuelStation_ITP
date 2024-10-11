import React, { useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import Font Awesome
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoImage from '../../assets/images/logo.png'; // Import the system logo image

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SoldVsTotalLitresChart = ({ items }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    console.log('Items received by SoldVsTotalLitresChart:', items);
  }, [items]);

  if (!items || items.length === 0) {
    console.log('No data available to display in the chart');
    return <p>No data available</p>;
  }

  const chartData = {
    labels: items.map(item => item.itemName),
    datasets: [
      {
        label: 'Total Litres',
        data: items.map(item => item.total),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        borderRadius: 5,
        barThickness: 50, // Increased bar thickness
        maxBarThickness: 70, // Increased max bar thickness
        categoryPercentage: 0.3, // Adjusted for better bar width
      },
      {
        label: 'Sold Litres',
        data: items.map(item => item.sold),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        borderRadius: 5,
        barThickness: 50, // Increased bar thickness
        maxBarThickness: 70, // Increased max bar thickness
        categoryPercentage: 0.5, // Adjusted for better bar width
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, max: Math.max(...items.map(item => item.total)) * 1.2 }
    }
  };

  // Function to download the chart as PDF

  // Function to download the chart as PDF with logo and proper heading position
  const downloadChartAsPDF = () => {
    const chart = chartRef.current;
    if (chart) {
      html2canvas(chart.canvas, { scale: 5 }).then((canvas) => { // Increase scale to 3 for better quality
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('portrait', 'mm', 'a4');

        // Add the logo to the PDF
        const logo = new Image();
        logo.src = logoImage;
        logo.onload = () => {
          // Add logo at the top-left corner
          pdf.addImage(logo, 'PNG', 10, 10, 30, 30);
          
          // Add the title below the logo
          pdf.setFontSize(18);
          pdf.text('Sold Litres vs. Total Litres', pdf.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

          // Add the chart image to the PDF
          pdf.addImage(imgData, 'PNG', 10, 50, 190, 100); // Adjust the position and size of the chart image

          pdf.save('Sold_vs_Total_Litres_Chart.pdf');
        };
      });
    }
  };


  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'auto', // Keeping the existing chart wrapper size
      width: 'auto', // Keeping the existing chart wrapper size
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      margin: '0 auto', // Keeps the container centered on the page
    }}>
      <div style={{ width: '100%' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', color: '#333' }}>
          Sold vs Total Litres
        </h1>
        <Bar ref={chartRef} data={chartData} options={options} />
        <button 
          onClick={downloadChartAsPDF} 
          style={{
            marginTop: '10px', // Space between chart and button
            backgroundColor: '#1d328e', 
            color: 'white', 
            border: 'none', 
            padding: '10px 15px', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px', // Space between icon and text
            fontSize: '14px', // Adjust font size if needed
            marginLeft: '500px', // Ensures the button stays aligned to the right
            marginRight: 'auto', // Ensures the button stays centered
            display: 'block'
          }}
        >
          <FontAwesomeIcon  icon={faDownload} /> 
        </button>
      </div>
    </div>
  );
};

export default SoldVsTotalLitresChart;
