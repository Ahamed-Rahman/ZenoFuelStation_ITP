import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoImage from '../../assets/images/logo.png'; // Assuming the logo is available
import './checkout.css';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const [pastSales, setPastSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchDate, setSearchDate] = useState(''); // State to store search input

    useEffect(() => {
        const fetchPastSales = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/shop-sales/view-orders', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Past Sales Response:", response.data);
                setPastSales(response.data);
                setFilteredSales(response.data); // Set initial filtered sales to all sales
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError('Unauthorized access. Please log in.');
                    navigate('/login');
                } else {
                    setError('Error fetching past sales.');
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPastSales();
    }, [navigate]);

    // Function to handle the date search
    const handleSearchDate = (e) => {
        const searchValue = e.target.value;
        setSearchDate(searchValue);
    
        filterSales(searchValue, searchTerm);
    };
    
    const handleSearchTerm = (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);
    
        filterSales(searchDate, searchValue);
    };
    
    const filterSales = (date, term) => {
        const filtered = pastSales.filter((order) => {
            const matchesDate = date
                ? new Date(order.saleDate).toLocaleDateString() === new Date(date).toLocaleDateString()
                : true;
            const matchesTerm = term
                ? order.itemName.toLowerCase().includes(term.toLowerCase())
                : true;
            return matchesDate && matchesTerm;
        });
    
        setFilteredSales(filtered);
    };
    

    const handleBack = () => {
        navigate('/admin-welcome/BillShow');
    };


    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        // Add the logo in the top left corner
        const logoSize = 30;
        doc.addImage(logoImage, 'PNG', margin, margin, logoSize, logoSize);

        // Add the title below the logo
        doc.setFontSize(16);
        doc.setFont('Helvetica', 'bold');
        doc.text('Sales Report', margin + 70, margin + 30);

        // Define the table data
        const tableData = filteredSales.map(order => [
            order.itemName, 
            order.quantity, 
            `Rs. ${order.totalPrice}`, 
            new Date(order.saleDate).toLocaleDateString()
        ]);

        // Add the sales table
        doc.autoTable({
            head: [['Item Name', 'Quantity', 'Total Price', 'Date']],
            body: tableData,
            startY: margin + 40, // Adjust the Y position to leave space for logo and title
        });

        // Add the "Thank You" message at the bottom
        const thankYouMessage = "Thank you for reviewing the report!";
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'italic');
        doc.setTextColor(0, 102, 204); // Set a nice color for the thank you message
        const textWidth = doc.getTextWidth(thankYouMessage);
        const textXPosition = (pageWidth - textWidth) / 2;
        doc.text(thankYouMessage, textXPosition, doc.lastAutoTable.finalY + 20);

        // Save the PDF
        doc.save('sales_report.pdf');
    };


    return (
        <div className="past-sales-container">
            <h1 className="past-sales-title">Past Sales</h1>
            
            {/* Search bar for filtering by date */}

   <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' ,marginLeft: '-500px'}}>
    <input
        type="text"
        className="seshan-search-bar"
        value={searchTerm}
        onChange={handleSearchTerm}
        placeholder="Search by item name"
        style={{ padding: '6px', borderRadius: '8px', border: '1px solid #ccc',marginLeft: '-10px' }}
    />
            <input
                type="date"
                className="seshan-search-bar"
                value={searchDate}
                onChange={handleSearchDate}
                placeholder="Search by date"
                style={{ padding: '6px', borderRadius: '8px', border: '1px solid #ccc',marginLeft: '10px' }}
            />
            </div>


            {loading ? (
                <p className="loading-message">Loading past sales...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                
                    <table id="Sheshan-sale-table" className="Sheshantable">
                        <thead className="table-header">
                            <tr>
                                <th className="table-header-cell">Item Name</th>
                                <th className="table-header-cell">Quantity</th>
                                <th className="table-header-cell">Total Price</th>
                                <th className="table-header-cell">Date</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {filteredSales.length === 0 ? (
                                <tr className="no-orders-row">
                                    <td colSpan="4" className="no-orders-message">No past orders found.</td>
                                </tr>
                            ) : (
                                filteredSales.map((order, index) => (
                                    <tr key={index} className="sales-row">
                                        <td className="sales-cell">{order.itemName}</td>
                                        <td className="sales-cell">{order.quantity}</td>
                                        <td className="sales-cell">{`Rs. ${order.totalPrice}`}</td>
                                        <td className="sales-cell">{new Date(order.saleDate).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                
            )}
            
             <div>
            <button className="seshan-generate-report-button" onClick={generatePDF}>Generate Report</button></div>
            <div>
            <button className="seshan-back-button" onClick={handleBack}>Back</button></div>
        </div>
    );
};

export default CheckoutPage;
