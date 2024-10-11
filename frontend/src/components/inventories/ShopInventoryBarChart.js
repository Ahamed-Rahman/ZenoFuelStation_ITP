import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome for icons
import { faDownload } from '@fortawesome/free-solid-svg-icons'; // Import download icon
import jsPDF from 'jspdf'; // For PDF export
import html2canvas from 'html2canvas'; // For capturing chart as image
import logoImage from '../../assets/images/logo.png'; // Adjust the path to your logo

const ShopInventoryBarChart = ({ items }) => {
    const chartRef = useRef(null); // Use ref to access the chart

    if (!items || items.length === 0) {
        console.log('No data available to display in the chart');
        return <p>No data available</p>;
    }

    const data = {
        labels: items.map(item => item.itemName),
        datasets: [
            {
                label: 'Quantity Available',
                data: items.map(item => item.quantityAvailable || 0), 
                backgroundColor: 'rgba(54, 162, 235, 0.7)', // Light blue
                borderColor: 'rgba(54, 162, 235, 1)', // Darker blue
                borderWidth: 1,
                borderRadius: 5,
                barThickness: 40,
                maxBarThickness: 35,
            },
            {
                label: 'Items Sold',
                data: items.map(item => item.itemsSold || 0), 
                backgroundColor: 'rgba(255, 99, 132, 0.7)', // Light red
                borderColor: 'rgba(255, 99, 132, 1)', // Darker red
                borderWidth: 1,
                borderRadius: 5,
                barThickness: 40,
                maxBarThickness: 35,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top', 
                labels: { font: { size: 14 }, color: '#333' } 
            },
        },
        scales: {
            x: { 
                grid: { display: false },
                ticks: { font: { size: 12 }, color: '#333' }
            },
            y: {
                beginAtZero: true,
                grid: { color: '#e5e5e5' },
                ticks: {
                    stepSize: 20,
                    font: { size: 12 }, 
                    color: '#333'
                },
                title: {
                    display: true,
                    text: 'Quantity / Items Sold',
                    font: { size: 14, weight: 'bold' },
                    color: '#333',
                }
            }
        }
    };

    // Function to download the chart as a PDF
   
    const downloadChartAsPDF = () => {
        const chart = chartRef.current;
        if (chart) {
            html2canvas(chart.canvas, { scale: 5 }).then((canvas) => { // Increase scale to 3 for better quality
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('portrait', 'mm', 'a4');
                
                // Add logo
                const logo = new Image();
                logo.src = logoImage;
                logo.onload = () => {
                    pdf.addImage(logo, 'PNG', 10, 10, 30, 30); // Add logo at the top
                    pdf.setFontSize(16);
                    pdf.text('Quantity Available VS Sold Items', 105, 50, { align: 'center' });
                    pdf.addImage(imgData, 'PNG', 10, 60, 190, 110); // Adjust chart image size and position
                    pdf.save('shop_inventory_bar_chart.pdf'); 
                };
            });
        }
    };

    return (
        <div style={{ 
            marginTop: '-35px', 
            backgroundColor: '#ffffff', 
            borderRadius: '12px', 
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', 
            padding: '20px' 
        }}>
            <h2 style={{ textAlign: 'center', fontSize: '17px', marginBottom: '20px' }}>
                Quantity Available VS Sold Items
            </h2>
            <div style={{ height: '300px', width: '100%' }}>
                <Bar ref={chartRef} data={data} options={options} />
            </div>
            <button 
                onClick={downloadChartAsPDF} 
                style={{
                    marginTop: '15px', 
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
                    marginLeft: '400px',
                    
                }}
            >
                <FontAwesomeIcon icon={faDownload} /> 
            </button>
        </div>
    );
};

export default ShopInventoryBarChart;
