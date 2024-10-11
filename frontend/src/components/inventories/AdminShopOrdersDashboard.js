import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import SidebarLayoutShop from './SidebarLayoutShop.js';

const AdminShopOrdersDashboard = () => {
  const [receivedShopOrders, setReceivedShopOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceivedShopOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/ordersShop/received-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReceivedShopOrders(response.data);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch received shop orders', 'error');
      }
    };

    fetchReceivedShopOrders();
  }, []);

  const handleAddToInventory = async (order) => {
    navigate('/admin-welcome/add-shop-item', {
      state: { 
        itemName: order.itemName, 
        purchasePrice: order.wholesalePrice,  // Pass as purchasePrice
        orderId: order._id,
        quantity: order.quantity
      }
    });
  };

  // Update the status in the local state after adding to inventory
 

  const filteredOrders = receivedShopOrders.filter(order => {
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    const matchesDate = dateFilter ? new Date(order.orderDate).toLocaleDateString() === new Date(dateFilter).toLocaleDateString() : true;
    return matchesStatus && matchesDate;
  });

  return (
    <SidebarLayoutShop>
      <div className="AhamedDashboard">
        <h1>Admin Shop Orders Dashboard</h1>

        <div className="filtersection">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="filterSelect"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="AddedToInventory">Added to Inventory</option>
          </select>

          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)} 
            className="dateInput"
          />
        </div>
        <table id="Ahamed-records-table" className="Dinukatable">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Wholesale Price (Rs)</th>
              <th>Total Amount (Rs)</th> 
              <th>Received Date</th> 
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{order.itemName}</td>
                <td>{order.quantity}</td>
                <td>{order.wholesalePrice}</td> 
                <td>{order.totalAmount !== undefined && order.totalAmount !== 0 ? order.totalAmount : 'N/A'}</td>
                <td>{order.dateReceived ? new Date(order.dateReceived).toLocaleDateString('en-US') : 'Invalid Date'}</td>
                <td>{order.status}</td>
                <td>
                {order.status === 'Pending' ? (
        <button className="add-inventory-button" onClick={() => handleAddToInventory(order)}>Add to Inventory</button>
      ) : (
        <button disabled>Added to Inventory</button>
      )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarLayoutShop>
  );
};

export default AdminShopOrdersDashboard;
