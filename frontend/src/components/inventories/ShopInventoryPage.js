import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './ShopInventoryPage.module.css';
import { Link } from 'react-router-dom';
import SidebarLayoutShop from './SidebarLayoutShop';
import logoImage from '../../assets/images/logo.png';


const ShopInventoryPage = ({ isManager }) => {
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
                        'Authorization': `Bearer ${token}` // Attach token to request headers
                    }
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

    const handleAddItemClick = () => {
        navigate('/admin-welcome/add-shop-item');
    };

    const handleEditItemClick = (id) => {
      console.log("Editing item with ID:", id); // Check the ID
      navigate(`/admin-welcome/edit-shop-item/${id}`);
  };
  

  const handleDeleteItemClick = async (id) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
            const token = localStorage.getItem('token'); // Get token from local storage
            await axios.delete(`http://localhost:5000/api/shop-inventory/delete/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}` // Attach token to request headers
                }
            });
            setItems(prevItems => prevItems.filter(item => item.mongoId !== id));
            Swal.fire(
                'Deleted!',
                'Item deleted successfully.',
                'success'
            );
        } catch (error) {
            console.error("Error deleting item:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete item. Please try again.',
            });
        }
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
          'Authorization': `Bearer ${token}` // Ensure token is passed in request headers
        }
      }); // Fetch inventory data
      const items = response.data;
  
      // Calculate total items and low stock items
      const totalItems = items.length;
      const totalLowStockItems = items.filter(item => item.quantityAvailable < 10).length;
  
      const doc = new jsPDF();
  
      // Define constants for image and logo sizes
      const imgMaxWidth = 20; // Maximum image width
      const imgMaxHeight = 20; // Maximum image height
      const logoSize = 30;
  
      // Move the logo slightly higher and adjust size
      const logo = new Image();
      logo.src = logoImage;
      doc.addImage(logo, 'PNG', 10, 5, logoSize, logoSize); // Adjusted Y position and size for the logo
  
      // Set the title to be centered below the logo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(40, 116, 166);
      doc.text('Monthly Inventory Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' }); // Centered title
  
      // Define table columns and rows (including photos)
      const tableColumn = [
        'Item Name', 
        'Total Items', 
        'Items Sold', 
        'Quantity Available', 
        'Purchase Price (Rs)', 
        'Retail Price (Rs)', 
        'Date Added', 
        'Photo'
      ];
  
      const tableRows = [];
      const addRowWithImage = (item) => {
        const row = [
          item.itemName,
          item.totalItems,
          item.itemsSold,
          item.quantityAvailable,
          item.purchasePrice,
          item.retailPrice,
          new Date(item.dateAdded).toLocaleDateString(),
          { img: item.photo } // Store photo path for later use
        ];
        tableRows.push(row);
      };
  
      items.forEach(addRowWithImage);
  
      // Add table to PDF with custom styling
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50, // Adjusted start to accommodate the logo and title
        margin: { top: 10, bottom: 20 },
        theme: 'grid', // Changed theme to grid
        styles: {
          font: 'helvetica',
          fontSize: 10,
          textColor: [40, 40, 40],
          lineColor: [216, 216, 216],
          lineWidth: 0.1,
          minCellHeight: 25, // Set minimum height to accommodate images properly
          cellPadding: 4 // Added padding for better spacing
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
        didDrawCell: (data) => {
          // Add image to the cell if the column index corresponds to the 'Photo' column
          if (data.column.index === 7 && data.cell.raw && data.cell.raw.img) {
            const imageUrl = data.cell.raw.img.startsWith('http') 
              ? data.cell.raw.img 
              : `http://localhost:5000/uploads/${data.cell.raw.img}`;
            
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;
  
            // Calculate aspect ratio and ensure the image fits within the cell
            const aspectRatio = imgMaxWidth / imgMaxHeight;
            let imgWidth = cellWidth * 0.8;
            let imgHeight = imgWidth / aspectRatio;
  
            if (imgHeight > cellHeight) {
              imgHeight = cellHeight * 0.8;
              imgWidth = imgHeight * aspectRatio;
            }
  
            const xOffset = (cellWidth - imgWidth) / 2; // Center the image horizontally
            const yOffset = (cellHeight - imgHeight) / 2; // Center the image vertically
  
            // Add the image to the cell using jsPDF's addImage method
            doc.addImage(imageUrl, 'JPEG', data.cell.x + xOffset, data.cell.y + yOffset, imgWidth, imgHeight);
          }
        }
      });
  
      let lastY = doc.autoTable.previous.finalY || 50;
  
      // Check if new page is needed for totals
      const pageHeight = doc.internal.pageSize.height;
      if (lastY + 50 > pageHeight) {
        doc.addPage();
        lastY = 20;
      }
  
      // Add totals and message with custom font and spacing, properly placed below the table
      lastY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`Total Available Items: ${totalItems}`, 14, lastY);
      doc.text(`Total Low Stock Items: ${totalLowStockItems}`, 14, lastY + 10);
  
      // Add a thank-you message with a different color and font size
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for reviewing the inventory report. Please contact us if you have any questions or need further information.', 14, lastY + 30);
  
      // Save the PDF with a meaningful name
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
      
      <SidebarLayoutShop>
          
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

        <div className={styles.AhamedinventoryActions}>
            <Link to="/admin-welcome/add-shop-item" className={`${styles.Ahamedbutton} ${styles.AhamedaddItemButton}`}>
              Add New Item
            </Link>
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
                <th>Photo</th> {/* New column for photo */}
                <th>Actions</th>
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
            className={styles.AhameditemImage} // Assuming you have a style for the image
            style={{ width: '50px', height: '50px', objectFit: 'cover' }} // Optional styles
        />
    ) : (
        'No image available' // Fallback message
    )}
</td>

       <td className={styles.ShopAhamed}>
           <Link to={`/admin-welcome/edit-shop-item/${item.mongoId}`} className={styles.AhamedShopeditsButton}>
               Edit
           </Link>
           <button className={styles.AhamedShopdeletesButton} onClick={() => handleDeleteItemClick(item.mongoId)}>
               Delete
           </button>
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
          </SidebarLayoutShop>
        
      );
    };
    
export default ShopInventoryPage;
