import React, { useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, Title, ArcElement } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf'; // Import jsPDF for PDF export
import html2canvas from 'html2canvas'; // Import html2canvas to convert chart to image
import 'chart.js/auto'; // Required for Chart.js v3
import styles from './ShopInventoryChart.css'; // Ensure correct path to CSS file
import logoImage from '../../assets/images/logo.png'; // Path to your logo



// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ShopInventoryChart = ({ items }) => {
    const chartRef = useRef(null); // Create a ref to access the chart

    const data = {
        labels: items.map(item => item.itemName),
        datasets: [
            {
                label: 'Quantity Available',
                data: items.map(item => item.quantityAvailable),
                backgroundColor: items.map(() => 
                    `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
                ),
                hoverBackgroundColor: items.map(() => 
                    `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`
                ),
                borderWidth: 2,
                borderColor: '#0000',
            }
        ]
    };

    const options = {
        plugins: {
            title: {
                display: false,
            },
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 10,
                        color: '#ffffff'
                    },
                    color: '#000' 
                }
            },
            tooltip: {
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                backgroundColor: '#333333',
            }
        },
        responsive: true,
        maintainAspectRatio: true, // Ensures the chart stays circular
        animation: {
            animateRotate: true,
            animateScale: true,
        }
    };

    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        textAlign: 'center',
        paddingLeft: '30px',
        marginLeft: '50px',
        width: '400px',
        backgroundColor: '#ffffff',
        marginTop: '20px', // Adjusted margin to push it up
        borderRadius: '30px'
    };

    const chartStyle = {
        width: '400px',
        height: '400px',
    };

    // Function to download the chart as PDF
    // Function to download the chart as PDF
    const downloadChartAsPDF = () => {
        const chart = chartRef.current;
        if (chart) {
            html2canvas(chart.canvas, { scale: 5 }).then((canvas) => { // Increase scale to 3 for better quality
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('portrait', 'mm', 'a4');
                
                // Adding logo image
                const logo = new Image();
                logo.src = logoImage;
                logo.onload = () => {
                    pdf.addImage(logo, 'PNG', 10, 10, 30, 30); // Add the logo to the top-left
                    pdf.setFontSize(18);
                    pdf.text('Shop Inventory Chart', pdf.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
                    pdf.addImage(imgData, 'PNG', 40, 60, 130, 130); // Place the chart as an image
                    pdf.save('shop_inventory_chart.pdf'); // Save as PDF
                };
            });
        }
    };


    return (
        <div className={styles.chartContainers} style={containerStyle}>
            
            <div className={styles.chartWrapper}>
                <div style={chartStyle}>
                    <Pie ref={chartRef} data={data} options={options} />
                </div>
                <button 
                    onClick={downloadChartAsPDF} // Change function to download as PDF
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
                        marginLeft: '400px'
                    }}
                >
                    <FontAwesomeIcon icon={faDownload} />
                  
                </button>
            </div>
        </div>
    );
};

export default ShopInventoryChart;
