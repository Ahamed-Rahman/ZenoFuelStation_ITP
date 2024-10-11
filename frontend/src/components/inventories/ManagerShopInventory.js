import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './ShopInventoryPage.module.css'; // Create a new CSS module or adjust styles as needed
import SidebarLayoutManager from './SidebarLayoutManager';
import logoImage from '../../assets/images/logo.png';
import socket from '../../services/socketService'; // Make sure to import your socket service

const ManagerShopInventory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from local storage
        const response = await axios.get('http://localhost:5000/api/shop-inventory', {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to request headers
          },
        });

        const itemsWithSequentialId = response.data.map((item, index) => ({
          id: index + 1,
          mongoId: item._id,
          itemName: item.itemName,
          totalItems: item.totalItems,
          itemsSold: item.itemsSold,
          quantityAvailable: item.quantityAvailable,
          purchasePrice: item.purchasePrice,
          retailPrice: item.retailPrice,
          dateAdded: item.dateAdded,
          photo: item.photo,
        }));

        itemsWithSequentialId.forEach(item => {
          if (item.quantityAvailable < 10) {
            alertOrderManagement(item);
          }
        });

        setItems(itemsWithSequentialId);
      } catch (error) {
        console.error("Error fetching items:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to fetch items. Please try again.',
        });
        if (error.response?.status === 401) {
          // Handle 401 Unauthorized
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'Your session has expired. Please log in again.',
          }).then(() => {
            navigate('/'); // Redirect to login page
          });
        }
      } finally {
        setLoading(false);
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
  }, [navigate]);

  const alertOrderManagement = async (item) => {
    try {
      await axios.post('http://localhost:5000/api/order-management/low-stock-alert', {
        itemId: item.mongoId,
        itemName: item.itemName,
        quantityAvailable: item.quantityAvailable,
      });
    } catch (error) {
      console.error("Error alerting order management:", error);
    }
  };

  const generateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'You need to log in to generate the report.',
        });
        navigate('/login'); // Redirect to login page if token is missing
        return;
      }

      const response = await axios.get('http://localhost:5000/api/shop-inventory', {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is passed in request headers
        },
      });
      const items = response.data;

      const doc = new jsPDF();
      const logo = new Image();
      logo.src = logoImage;
      const logoSize = 30;
      doc.addImage(logo, 'PNG', 10, 5, logoSize, logoSize);

      // Set the title to be centered below the logo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(40, 116, 166);
      doc.text('Monthly Inventory Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

      const tableColumn = [
        'Item Name',
        'Total Items',
        'Items Sold',
        'Quantity Available',
        'Purchase Price (Rs)',
        'Retail Price (Rs)',
        'Date Added',
        'Photo',
      ];
      const tableRows = items.map(item => [
        item.itemName,
        item.totalItems,
        item.itemsSold,
        item.quantityAvailable,
        item.purchasePrice,
        item.retailPrice,
        new Date(item.dateAdded).toLocaleDateString(),
        item.photo,
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
      });

      doc.save(`Inventory_Report_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
      Swal.fire('Error', 'Failed to generate report. Please try again.', 'error');
    }
  };

  const filteredItems = items.filter(item =>
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;

  return (
    <SidebarLayoutManager>
      <div className={styles.AhamedpageContainer}>
        <div className={styles.Ahamedbackground}></div>
        <div className={styles.AhamedbackgroundOverlay}></div>
        <div className={styles.AhamedinventoryPage}>
          <div className={styles.AhamedinventoryHeader}>
            <h1 className={styles.AhamedinventoryTitle}>Shop Inventory</h1>
          </div>

          <div className={styles.AhamedinventoryActionsTop}>
            <div className={styles.AhamedsearchBarContainer}>
              <input
                type="text"
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.AhamedSearch}
              />
            </div>
          </div>

          <table className={styles.AhamedinventoryTables}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Total Items</th>
                <th>Items Sold</th>
                <th>Quantity Available</th>
                <th>Purchase Price (Rs)</th>
                <th>Retail Price (Rs)</th>
                <th>Date Added</th>
                <th>Photo</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.mongoId}>
                  <td>{item.id}</td>
                  <td>{item.itemName ?? 'N/A'}</td>
                  <td>{item.totalItems}</td>
                  <td>{item.itemsSold}</td>
                  <td className={item.quantityAvailable < 10 ? styles.lowStock : ''}>
                    {item.quantityAvailable}
                  </td>
                  <td>{item.purchasePrice}</td>
                  <td>{item.retailPrice}</td>
                  <td>{new Date(item.dateAdded).toLocaleDateString()}</td>
                  <td>
                    {item.photo ? (
                      <img
                        src={item.photo.startsWith('http') ? item.photo : `http://localhost:5000/uploads/${item.photo}`}
                        alt={item.itemName}
                        className={styles.AhameditemImage}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    ) : (
                      'No image available'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.AhamedgenerateReportContainers}>
            <button onClick={generateReport} className={styles.AhamedgenerateReportButtons}>
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </SidebarLayoutManager>
  );
};

export default ManagerShopInventory;
