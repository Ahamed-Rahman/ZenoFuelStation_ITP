import React, { useRef } from 'react'; // Added useRef
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import Font Awesome
import { faDownload } from '@fortawesome/free-solid-svg-icons'; // Import download icon
import './InventoryChart.css'; // Ensure correct path to CSS file
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoImage from '../../assets/images/logo.png'; // Import your logo image

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const InventoryChart = ({ items }) => {
  const chartRef = useRef(null);

  const data = {
    labels: items.map(item => item.itemName),
    datasets: [{
      data: items.map(item => item.available),
      backgroundColor: items.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`),
      borderColor: '#fff',
      borderWidth: 2,
      hoverOffset: 10,
      hoverBorderColor: '#000',
      hoverBorderWidth: 2,
    }],
  };

  const options = {
    maintainAspectRatio: true, // Ensure the chart remains a perfect circle
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: 'Poppins, Arial, sans-serif',
            weight: 'bold',
            color: '#000',
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 10,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
    },
    layout: {
      padding: {
        bottom: 20,
      },
    },
  };

  const downloadChartAsPDF = () => {
    const chart = chartRef.current;
    if (chart) {
      html2canvas(chart.canvas, { scale: 5 }).then((canvas) => { // Increase scale to 3 for better quality
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('portrait', 'mm', 'a4');

        const logo = new Image();
        logo.src = logoImage;
        logo.onload = () => {
          pdf.addImage(logo, 'PNG', 10, 10, 30, 30); // Add logo at the top-left

          pdf.setFontSize(18);
          pdf.text('Available Items Chart', pdf.internal.pageSize.getWidth() / 2, 50, { align: 'center' });

          // Add the chart image with corrected size for a perfect circle
          pdf.addImage(imgData, 'PNG', 40, 60, 130, 130); // Adjust position and size for a circular chart

          pdf.save('Inventory_Chart.pdf');
        };
      });
    }
  };

  return (
    <div className="AhamedChartContainer4">
    <h2 className="AhamedChartHeading">Available Items</h2>
    <div className="AhamedChartWrapper4">
      <Pie ref={chartRef} data={data} options={options} />
      <button onClick={downloadChartAsPDF} className="downloadButton">
        <FontAwesomeIcon icon={faDownload} /> {/* Add the download icon */}
        
      </button>
    </div>
  </div>
  );
};

export default InventoryChart;
