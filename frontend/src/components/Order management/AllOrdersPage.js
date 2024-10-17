import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import './AllOrdersPage.css';
import SidebarOrderFuel from './SidebarOrderFuel';
import 'jspdf-autotable'; // Import jsPDF AutoTable plugin
import logoImage from '../../assets/images/logo.png';

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(1);
  const [statusFilter, setStatusFilter] = useState(''); // New state for status filter

  const [searchTerm, setSearchTerm] = useState('');

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/orders/delete-order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire('Deleted!', 'Order has been deleted.', 'success');
      fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      Swal.fire('Error!', 'Failed to delete order.', 'error');
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrderId(order._id);
    setEditingQuantity(order.quantity);
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/orders/update-order/${orderId}`, {
        quantity: editingQuantity,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire('Updated!', 'Order quantity has been updated.', 'success');
      setEditingOrderId(null);
      fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      Swal.fire('Error!', 'Failed to update order.', 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });
  
 // Function to generate the PDF report in table format
  // Function to generate the PDF report
  const generateReport = () => {
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
    doc.text('Orders Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

    // Table headers
    const headers = [['ID', 'Item Name', 'Quantity', 'Supplier Email', 'Status']];

    // Mapping filtered orders for table data
    const tableData = filteredOrders.map((order, index) => [
      index + 1, // ID
      order.itemName, // Item Name
      order.quantity, // Quantity
      order.supplierEmail, // Supplier Email
      order.status || 'Delivered' // Status
    ]);

    // Generating the table in the PDF with grid theme
    doc.autoTable({
      head: headers,
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

    // Add a thank-you message at the end
    const pageHeight = doc.internal.pageSize.height;
    if (lastY + 50 > pageHeight) {
      doc.addPage();
      lastY = 20;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Thank you for reviewing the orders report. Please contact us if you have any questions.', 14, lastY + 10);

    // Save the generated PDF
    doc.save('orders_report.pdf');
  };

  return (
    <SidebarOrderFuel>
      <div className="place-new-order-page">
        <h1>All Fuel Orders</h1>

        <div className="Dan-search-bar">
          <input
            type="text"
            className="DanSearch"
            placeholder="Search by Item Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

           {/* Dropdown for status filter */}
        <select
            className="DanStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
           <option value="">All Statuses</option>
           <option value="Accepted">Accepted</option>
           <option value="Pending">Pending</option>
       </select>
        </div>

        <table className="place-new-order-page__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Supplier Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td>{order.itemName}</td>
                <td>
                  {editingOrderId === order._id ? (
                    <input
                      type="number"
                      value={editingQuantity}
                      onChange={(e) => setEditingQuantity(e.target.value)}
                      min="1"
                    />
                  ) : (
                    order.quantity
                  )}
                </td>
                <td>{order.supplierEmail}</td>
                <td>{order.status || 'Delivered'}</td>
                <td>
                  <div className="DanBtn">
                    {order.status !== 'Accepted' && (
                      <>
                        {editingOrderId === order._id ? (
                          <button className="DanSave" onClick={() => handleUpdateOrder(order._id)}>Save</button>
                        ) : (
                          <button className="DananjayaEdit" onClick={() => handleEditOrder(order)}>Edit</button>
                        )}
                        <button className="DananjayaDelete" onClick={() => handleDeleteOrder(order._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="Dananjayagenerate" onClick={generateReport}>Generate Report</button>
      </div>
    </SidebarOrderFuel>
  );
};

export default AllOrdersPage;
