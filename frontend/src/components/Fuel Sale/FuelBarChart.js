// src/BarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import SidebarLayoutFuel from './SidebarLayoutFuel'
import html2canvas from 'html2canvas';

// Registering components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ fuelTypes, chartTitle }) => {
    // Prepare data for the bar chart
    const data = {
        labels: fuelTypes.map(fuel => fuel.type), // Fuel types as labels
        datasets: [
            {
                label: 'Fuel Prices',
                data: fuelTypes.map(fuel => fuel.fuelPrice), // Fuel prices as data
                backgroundColor: 'rgba(75, 192, 192, 0.8)', // Less transparent
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: chartTitle || 'Assigned Fuel Prices', // Use chartTitle prop or fallback to 'Default Title'
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `Price: $${tooltipItem.raw}`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Fuel Type'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Price'
                },
                beginAtZero: true
            }
        }
    };

    // Function to download the chart as a PDF
    const downloadPDF = () => {
        const chartElement = document.getElementById('barChartCanvas');
        html2canvas(chartElement).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.text(chartTitle || 'Assigned Fuel Prices', 14, 15);
            pdf.addImage(imgData, 'PNG', 10, 20, 180, 120); // Adjust position and size as needed
            pdf.save('fuel_prices_chart.pdf');
        });
    };

    return (
        <SidebarLayoutFuel>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h1 style={{ textAlign: 'center', fontFamily: 'Arial Black', color: 'white' }}>Assigned Fuel Prices</h1>
            <br style={{ width: '80%', margin: '20px auto', borderTop: '2px solid #007bff' }} /> {/* Line after heading */}
            <div 
                id="barChartCanvas" 
                style={{ 
                    backgroundColor: '#fff', // White background for the chart
                    padding: '20px', 
                    borderRadius: '8px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    maxWidth: '80%', // Adjust size here
                    margin: '0 auto'
                }}
            >
                <Bar data={data} options={options} />
            </div>
            <button 
                onClick={downloadPDF}
                style={{ 
                    marginTop: '30px', 
                    marginBottom: '40px',
                    padding: '10px', 
                    cursor: 'pointer',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px'
                }}
            >
                Download Chart as PDF
            </button>
        </div>
        </SidebarLayoutFuel>
    );
};

export default BarChart;
