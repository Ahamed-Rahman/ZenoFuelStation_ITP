import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import socket from '../../services/socketService';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './FuelInventoryPage.module.css'; // Import your CSS module
import SidebarLayoutManager from './SidebarLayoutManager'; // Assuming you're using a sidebar layout
import logoImage from '../../assets/images/logo.png';

const ManagerFuelInventory = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // New state for date filter
  const lowStockThreshold = 15000; // Define low stock threshold

  // Function to format date as YYYY-MM-DD for filtering
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month starts from 0
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch inventory items from the server
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from local storage
        const response = await axios.get('http://localhost:5000/api/fuel-inventory', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(response.data); // Store fetched items in state
      } catch (err) {
        console.error('Failed to fetch items:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch items. Please check your authentication.',
        });
      }
    };
    fetchItems();

    // Listen for inventory updates via socket
    socket.on('inventoryUpdate', (data) => {
      console.log('Received inventory update:', data); // Log the update
      setItems(data); // Update items in the state
    });

    return () => {
      socket.off('inventoryUpdate'); // Cleanup socket listener
    };
  }, []);

  // Generate PDF report of the inventory
  const generatePDF = () => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = logoImage; // Imported logo
    const logoSize = 30;
    doc.addImage(logo, 'PNG', 10, 5, logoSize, logoSize); // Adjust position and size for the logo

    // Center the title below the logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 116, 166);
    doc.text('Inventory Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

    // Define table columns and rows
    const tableColumn = [
      'ID', 
      'Item Name', 
      'Total (litres)', 
      'Sold (litres)', 
      'Available (litres)', 
      'Wholesale Price', 
      'Date Added'
    ];
    const tableRows = [];

    items.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.itemName,
        item.total,
        item.sold,
        item.available,
        item.wholesalePrice ? `$${item.wholesalePrice.toFixed(2)}` : 'N/A',
        new Date(item.dateAdded).toLocaleDateString(),
      ];
      tableRows.push(rowData);
    });

    // Add table to PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
      },
      headStyles: {
        fillColor: [40, 116, 166],
        textColor: [255, 255, 255],
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Save the PDF
    doc.save('inventory_report.pdf');
  };

  // Filter items based on search term and date filter
  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? formatDate(item.dateAdded) === dateFilter : true;
    return matchesSearch && matchesDate;
  });

  return (
    <SidebarLayoutManager>
     <div className={styles.AhamedpageContainer}>
        <div className={styles.Ahamedbackground}></div>
        <div className={styles.AhamedbackgroundOverlay}></div>
        <div className={styles.AhamedinventoryPage}>
          <div className={styles.AhamedinventoryHeader}>
            <h1 className={styles.AhamedinventoryTitle}>Fuel Inventory</h1>
          </div>

          <div className={styles.AhamedinventoryActionsTop}>
            <div className={styles.AhamedsearchBarContainer}>
              <input
                type="text"
                placeholder="Search by item name..."
                className={styles.AhamedSearch}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                
              />

                   {/* Add date filter input */}
              <input
                type="date"
                className={styles.AhamedSearch} // Use the same class to maintain styling
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by Date Added"
              />
            </div>
            

            
             
        
          </div>

          <table className={styles.AhamedinventoryTables}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Total (litres)</th>
                <th>Sold (litres)</th>
                <th>Available (litres)</th>
                <th>Wholesale Price</th>
                <th>Date Added</th>
                
              </tr>
            </thead>
            <tbody>
               {filteredItems.length > 0 ? (
                 filteredItems.map((item, index) => (
                 <tr key={item._id} className={item.available <= lowStockThreshold ? styles.lowStock : ''}>
                 <td>{index + 1}</td>
                 <td>{item.itemName}</td>
                  <td>{item.total}</td>
                 <td>{item.sold}</td>
                 <td>{item.available}</td>
                 <td>${item.wholesalePrice ? item.wholesalePrice.toFixed(2) : 'N/A'}</td>
                 <td>{new Date(item.dateAdded).toLocaleDateString()}</td>
          
         
        
          </tr>
        ))
      ) : (
           <tr>
           
          </tr>
        )}           
          </tbody>


          </table>

          
            <div className={styles.AhamedgenerateReportContainers}>
              <button onClick={generatePDF} className={styles.AhamedgenerateReportButtons}>
                Generate Report
              </button>
            </div>
          
        </div>
      </div>
    </SidebarLayoutManager>
  );
};

export default ManagerFuelInventory;
