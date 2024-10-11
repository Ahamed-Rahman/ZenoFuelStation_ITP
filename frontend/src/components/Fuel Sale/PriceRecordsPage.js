import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf'; // Import jsPDF for PDF export
import 'jspdf-autotable';
import './PriceRecordPage.css';
import SidebarLayoutFuel from './SidebarLayoutFuel';
import '@fortawesome/fontawesome-free/css/all.min.css';
import html2canvas from 'html2canvas'; // Import html2canvas for capturing the chart as image
import logoImage from '../../assets/images/logo.png';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PriceRecordsPage = () => {
  const [priceRecords, setPriceRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [selectedFuel, setSelectedFuel] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [litres, setLitres] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPriceRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fuel-sales/price-records', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPriceRecords(response.data);
      } catch (error) {
        console.error('Error fetching price records:', error);
        if (error.response && error.response.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Forbidden',
            text: 'You do not have permission to access this resource.',
          });
        }
      }
    };

    const fetchFuelTypes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fuel-sales/inventory-items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFuelTypes(response.data);
      } catch (error) {
        console.error('Error fetching fuel types:', error);
        if (error.response.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You need to log in to access this page.',
          });
        }
      }
    };

    fetchPriceRecords();
    fetchFuelTypes();
  }, [token]);

  useEffect(() => {
    setTotalPrice(unitPrice * litres);
  }, [unitPrice, litres]);

  const handleEdit = (record) => {
    setEditRecord(record);
    setSelectedFuel(record.fuelType);
    setUnitPrice(record.unitPrice);
    setLitres(record.litres);
    setTotalPrice(record.totalPrice);
  };

  const handleUpdate = async () => {
    try {
      const updatedRecord = {
        fuelType: selectedFuel,
        unitPrice,
        litres,
        totalPrice: unitPrice * litres,
      };

      await axios.put(`http://localhost:5000/api/fuel-sales/price-records/${editRecord._id}`, updatedRecord, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'Price record updated successfully!',
      });

      setPriceRecords((prevRecords) =>
        prevRecords.map((record) =>
          record._id === editRecord._id ? { ...record, ...updatedRecord } : record
        )
      );

      setEditRecord(null);
    } catch (error) {
      console.error('Error updating price record:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update price record.',
      });
    }
  };

  const handleCancel = () => {
    setEditRecord(null);
    setSelectedFuel('');
    setUnitPrice(0);
    setLitres(0);
    setTotalPrice(0);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/fuel-sales/price-records/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Record deleted successfully!',
        });
        setPriceRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
      } catch (error) {
        console.error('Error deleting record:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete record.',
        });
      }
    }
  };

  // Data for the bar chart with improved appearance
  // Data for the bar chart with improved appearance
  const chartData = {
    labels: priceRecords.map((record) => record.fuelType),
    datasets: [
      {
        label: 'Total Price',
        data: priceRecords.map((record) => record.totalPrice),
        backgroundColor: 'rgba(78, 192, 192, 0.3)', // Light blue
        borderColor: '#4BC0C0',
        borderWidth: 2,
        hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)', // Pink for hover
        hoverBorderColor: 'rgba(255, 99, 132, 1)', // Pink border for hover
      },
    ],
  };

  // Function to download the chart as PDF with the logo
  const downloadChartAsPDF = () => {
    const chartElement = document.getElementsByTagName('canvas')[0];
    if (chartElement) {
      html2canvas(chartElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const logo = new Image();
        logo.src = logoImage;
        pdf.addImage(logo, 'PNG', 10, 10, 30, 30); // Adding logo to the PDF
        pdf.text('Fuel Price Records Chart', 10, 50); // Move the title below the logo
        pdf.addImage(imgData, 'PNG', 10, 60, 180, 120); // Add chart to PDF below the logo
        pdf.save('Price_Records_Chart.pdf'); // Save as PDF
      });
    }
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF();

    // Add the logo at the top-left corner
    const logo = new Image();
    logo.src = logoImage; // The imported logo image
    const logoSize = 30;
    doc.addImage(logo, 'PNG', 10, 5, logoSize, logoSize); // Adjust the position and size for the logo

    // Center the title below the logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 116, 166);
    doc.text('Fuel Price Records', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

    // Define the table headers (excluding "Actions")
    const headers = [['Fuel Type', 'Unit Price', 'Quantity (Litres)', 'Total Price']];

    // Map through priceRecords to construct the table rows (excluding the "Actions" column)
    const rows = priceRecords.map(record => [
      record.fuelType,
      record.unitPrice,
      record.litres,
      record.totalPrice,
    ]);

    // Generate the table using jsPDF-autotable with grid theme for better presentation
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 50, // Adjusted to fit logo and title
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        textColor: [40, 40, 40],
        lineColor: [216, 216, 216],
        lineWidth: 0.1,
        cellPadding: 4, // Adds padding for better readability
      },
      headStyles: {
        fillColor: [40, 116, 166],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center', // Center-align headers
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
        valign: 'middle',
        halign: 'center', // Center-align text in the body
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
    });

    // Add total price records and summary information below the table
    let lastY = doc.autoTable.previous.finalY || 50;

    // Check if a new page is needed for totals
    const pageHeight = doc.internal.pageSize.height;
    if (lastY + 50 > pageHeight) {
      doc.addPage();
      lastY = 20;
    }

    lastY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Total Records: ${priceRecords.length}`, 14, lastY);

    // Add a thank-you message at the end
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for reviewing the price records report. Please contact us if you have any questions.', 14, lastY + 20);

    // Save the generated PDF
    doc.save('PriceRecords.pdf');
  };


  return (
    <SidebarLayoutFuel>
      <div className="DinukaPriceRecordPage">
        {editRecord && (
          <div className="modal-overlay">
            <div className="DinukaEditForm">
              <h2>Edit Record</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                <label>
                  <div className='DinukaSelect2'>
                    Fuel Type:
                    <select value={selectedFuel} onChange={(e) => setSelectedFuel(e.target.value)}>
                      <option value="">Select Fuel Type</option>
                      {fuelTypes.map((fuel) => (
                        <option key={fuel.itemName} value={fuel.itemName}>
                          {fuel.itemName}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <label>
                  <div className='DinukaPrice2'>
                    Unit Price:
                    <input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                      min="0"
                    />
                  </div>
                </label>

                <label>
                  <div className='DinukaQty2'>
                    Qty (Litres):
                    <input
                      type="number"
                      value={litres}
                      onChange={(e) => setLitres(parseFloat(e.target.value))}
                      min="0"
                    />
                  </div>
                </label>

                <label>
                  <div className='DinukaNumber2'>
                    Total Price:
                    <input
                      type="number"
                      value={totalPrice}
                      readOnly
                    />
                  </div>
                </label>

                <button className="Dinukaupdate" type="submit">Update Record</button>
                <button className="Dinukacancel" type="button" onClick={handleCancel}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        <h1 className="hello">Fuel Price Records</h1>

        {/* Bar Chart */}
        <div className="Dinuka-chart-main">
          <div className="Dinuka-chart-container" style={{ marginTop: '10px', marginLeft: '30px', height: '300px', width: '500px', marginBottom: '50px' }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: 'white', // Set legend text color to white
                      boxWidth: 19,
                      font: {
                        size: 14,
                        weight: 'bold',
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      title: (tooltipItems) => tooltipItems[0].label,
                      label: (tooltipItem) => `Total Price: ${tooltipItem.raw}`,
                    },
                    backgroundColor: '#343a40', // Tooltip background color
                    titleColor: '#ffd700', // Title color
                    bodyColor: 'white', // Body text color
                    displayColors: false,
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      color: 'black', // Set Y-axis ticks color to black
                      font: {
                        size: 12,
                      },
                    },
                  },
                  x: {
                    grid: {
                      display: false, // Hide X-axis grid lines
                    },
                    ticks: {
                      color: 'black', // Set X-axis ticks color to black
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
                elements: {
                  bar: {
                    borderRadius: 20, // Set border radius for curved bars
                  },
                },
              }}
            />

            {/* Download Chart Button */}
            <button
              onClick={downloadChartAsPDF} // Updated to download as PDF
              style={{
                marginTop: '3px', // Space between chart and button
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
                marginLeft: '510px',
                position: 'relative'
              }}>
              <i className="fas fa-download"></i> 
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="Dinuka-search-bar">
          <input
            type="text"
            placeholder="Search by item name..."
            className="DinukaSearch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className='D2'>
          <button className='DinukaGenerate' onClick={handleGenerateReport}>Generate Report</button>
        </div>

        <div className='Dinukatable1'>
          <table id="Dinuka-price-records-table" className="Dinukatable">
            <thead>
              <tr>
                <th>Fuel Type</th>
                <th>Unit Price</th>
                <th>Quantity (Litres)</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {priceRecords.filter(record =>
                searchTerm === '' || record.fuelType.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((record) => (
                <tr key={record._id}>
                  <td>{record.fuelType}</td>
                  <td>{record.unitPrice}</td>
                  <td>{record.litres}</td>
                  <td>{record.totalPrice}</td>
                  <td>
                    <button className="Dinukaedit" onClick={() => handleEdit(record)}>Edit</button>
                    <button className="Dinukadelete" onClick={() => handleDelete(record._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayoutFuel>
  );
};

export default PriceRecordsPage;
