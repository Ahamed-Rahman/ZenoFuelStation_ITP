import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import socket from '../../services/socketService';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './FuelInventoryPage.module.css'; // Import your CSS module
import SidebarLayout from './SidebarLayout'; // Assuming you're using a sidebar layout
import logoImage from '../../assets/images/logo.png';

const FuelInventoryPage = ({ isManager }) => {
  const [items, setItems] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false); // New state for low stock filter

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

  // Delete an item from the inventory
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/fuel-inventory/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(items.filter(item => item._id !== id)); // Update state to reflect deleted item
        Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
      } catch (err) {
        console.error('Failed to delete item:', err);
        Swal.fire('Error!', 'An error occurred while deleting the item.', 'error');
      }
    }
  };

  // Low stock alert listener
  useEffect(() => {
    socket.on('lowStockAlert', (data) => {
      console.log('Low stock alert received:', data);
      Swal.fire({
        icon: 'warning',
        title: 'Low Stock Alert',
        text: `${data.itemName} is low on stock (Available: ${data.available})`,
      });
    });

    return () => {
      socket.off('lowStockAlert');
    };
  }, []);

  // Generate PDF report of the inventory
  // Generate PDF report of the inventory with the logo and improved styling
const generatePDF = () => {
  const doc = new jsPDF();

  // Add the logo at the top-left corner
  const logo = new Image();
  logo.src = logoImage; // Imported logo
  const logoSize = 30;
  doc.addImage(logo, 'PNG', 10, 5, logoSize, logoSize); // Adjust position and size for the logo

  // Center the title below the logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(40, 116, 166);
  doc.text('Fuel Inventory Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

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

  // Add table to PDF with grid theme for better presentation
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 50, // Adjusted start to accommodate the logo and title
    theme: 'grid', // Use grid theme for clean table
    margin: { top: 10, bottom: 20 },
    styles: {
      font: 'helvetica',
      fontSize: 10,
      textColor: [40, 40, 40],
      lineColor: [216, 216, 216],
      lineWidth: 0.1,
      cellPadding: 4, // Add padding for better spacing
    },
    headStyles: {
      fillColor: [40, 116, 166],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center', // Center-align headers
    },
    bodyStyles: {
      fillColor: [245, 245, 245],
      valign: 'middle', // Vertically align content in the middle
      halign: 'center', // Center-align all text
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
  });

  // Calculate total items and low stock items
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.available <= lowStockThreshold).length;

  let lastY = doc.autoTable.previous.finalY || 50;

  // Add total items and low stock items below the table
  const pageHeight = doc.internal.pageSize.height;
  if (lastY + 50 > pageHeight) {
    doc.addPage();
    lastY = 20;
  }

  lastY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total items in inventory: ${totalItems}`, 14, lastY);
  doc.text(`Total low stock items: ${lowStockItems}`, 14, lastY + 10);

  // Add a thank-you message
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for reviewing the fuel inventory report. Please contact us if you have any questions or need further information.', 14, lastY + 30);

  // Save the PDF with a meaningful name
  doc.save('fuel_inventory_report.pdf');
};

   
  // Filter items based on search term and date filter
  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? formatDate(item.dateAdded) === dateFilter : true;
    const matchesLowStock = showLowStock ? item.available <= lowStockThreshold : true;
  return matchesSearch && matchesDate && matchesLowStock;
    return matchesSearch && matchesDate;
  });

  return (
    <SidebarLayout>
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

               {/* Add Low Stock Filter Toggle */}
               <label className={styles.AhamedSearchLabel}>
  <input
    type="checkbox"
    checked={showLowStock}
    className={styles.AhamedSearch1}
    onChange={(e) => setShowLowStock(e.target.checked)}
  />
  Show Low Stock Only
</label>

            </div>
            

            {!isManager && (
              <div className={styles.AhamedinventoryActions}>
                <Link to="/admin-welcome/add-item" className={`${styles.Ahamedbutton} ${styles.AhamedaddItemButton}`}>
                  Add New Item
                </Link>
              </div>
            )}
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
                {!isManager && <th>Actions</th>} 
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
          {!isManager && (
          <td className={styles.AhamedButton}>
            <Link to={`/admin-welcome/edit-item/${item._id}`} className={`${styles.AhamededitsButton}`}>
              Edit
            </Link>
            <button className={styles.AhameddeletesButton} onClick={() => handleDelete(item._id)}>
              Delete
            </button>
          </td>
        )}
          </tr>
        ))
      ) : (
           <tr>
           <td colSpan={isManager ? "7" : "8"}>No items found</td>
          </tr>
        )}           
          </tbody>


          </table>

          {!isManager && (
            <div className={styles.AhamedgenerateReportContainers}>
              <button onClick={generatePDF} className={styles.AhamedgenerateReportButtons}>
                Generate Report
              </button>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default FuelInventoryPage;