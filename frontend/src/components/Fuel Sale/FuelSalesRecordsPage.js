import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf'; // Import jsPDF for PDF generation
import 'jspdf-autotable'; // Import jsPDF AutoTable plugin
import './PriceRecordsPage'; // Ensure this CSS file exists for styling
import SidebarLayoutFuel from './SidebarLayoutFuel'; // Adjust this import based on your actual sidebar component
import logoImage from '../../assets/images/logo.png';

const FuelSalesRecordPage = () => {
  const [salesRecords, setSalesRecords] = useState([]);
  const [searchDate, setSearchDate] = useState(''); // State to store the search date
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSalesRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fuel-sales/sales-records', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalesRecords(response.data);
      } catch (error) {
        console.error('Error fetching sales records:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch sales records.',
        });
      }
    };

    fetchSalesRecords();
  }, [token]);

  // Function to filter records by Sale Date
  const filteredRecords = salesRecords.filter((record) => {
    if (!searchDate) return true; // If no search date is provided, return all records
    const saleDate = new Date(record.saleDate).toISOString().split('T')[0]; // Format the sale date
    return saleDate === searchDate; // Match sale date with the search date
  });

  // Function to generate PDF report
  // Function to generate PDF report
  const generatePDF = () => {
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
    doc.text('Fuel Sales Records', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

    // Define the table headers
    const tableHeaders = ['Fuel Type', 'Litres', 'Unit Price', 'Total Price', 'Sale Date'];

    // Map the filtered records to match the table rows structure
    const tableData = filteredRecords.map(record => [
      record.fuelType,
      record.litres,
      record.unitPrice,
      record.totalPrice,
      new Date(record.saleDate).toLocaleDateString()
    ]);

    // Generate the table using jsPDF-autotable with grid theme
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 50, // Adjust to fit the logo and title
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

    let lastY = doc.autoTable.previous.finalY || 50;

    // Add totals and message below the table
    const pageHeight = doc.internal.pageSize.height;
    if (lastY + 50 > pageHeight) {
      doc.addPage();
      lastY = 20;
    }

    // Add a thank-you message at the end
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Thank you for reviewing the sales records report. Please contact us if you have any questions.', 14, lastY + 10);

    // Save the PDF
    doc.save('fuel_sales_records.pdf');
  };

  return (
    <SidebarLayoutFuel>
      <div className="DinukaSaleRecordPage">
        <div className="DinukaPriceRecordPage">
          <div className="dinukahead">
            <h2>Fuel Sales Records</h2>
          </div>

          {/* Search filter by Sale Date */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="date"
              id="searchDate"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              style={{ marginLeft: '350px', marginBottom: '20px', padding: '6px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <table id="Dinuka-price-records-table" className="Dinukatable">
            <thead>
              <tr>
                <th>Fuel Type</th>
                <th>Litres</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record._id}>
                  <td>{record.fuelType}</td>
                  <td>{record.litres}</td>
                  <td>{record.unitPrice}</td>
                  <td>{record.totalPrice}</td>
                  <td>{new Date(record.saleDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Generate Report Button */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={generatePDF}
              style={{
                background: 'linear-gradient(45deg, #081a70, #1e61bf, #266cb3, #26aee9)',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '1020px'
              }}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </SidebarLayoutFuel>
  );
};

export default FuelSalesRecordPage;
