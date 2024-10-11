import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './NewItemOrderPage.css';
import SidebarOrderFuel from './SidebarOrderFuel';


const AddNewOrdersPage = () => {
  const [itemName, setItemName] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierEmails, setSupplierEmails] = useState([]); // State to store supplier emails
  const [totalAmount, setTotalAmount] = useState(0);  // Add totalAmount state
  const [orderDate, setOrderDate] = useState('');     // Add orderDate state

  // Fetch supplier emails when the component mounts
  useEffect(() => {
    const fetchSupplierEmails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/suppliers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSupplierEmails(response.data.map(supplier => supplier.email));
      } catch (err) {
        console.error('Error fetching supplier emails:', err);
      }
    };

    fetchSupplierEmails();
  }, []);

  // Calculate totalAmount whenever quantity or wholesalePrice changes
  useEffect(() => {
    const wholesalePrice = 100;  // Example, replace this with your actual wholesale price logic
    setTotalAmount(orderQuantity * wholesalePrice);
  }, [orderQuantity]);

  // Set today's date as the default orderDate
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setOrderDate(today);
  }, []);

  const handlePlaceOrder = async () => {
    const orderData = {
      itemName,
      quantity: orderQuantity,
      supplierEmail,
      totalAmount, // Ensure this field is included
      orderDate,   // Ensure this field is included
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/orders/place-new-item-order', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire('Order placed!', `Order for ${itemName} has been placed.`, 'success');

      // Clear inputs after successful order
      setItemName('');
      setOrderQuantity(1);
      setSupplierEmail('');
    } catch (err) {
      console.error('Error placing order:', err);
      Swal.fire('Error!', 'Failed to place order.', 'error');
    }
  };

  return (
    <SidebarOrderFuel>
      <div className="place-new-order-page">
        <h1>Place Orders for New Items</h1>

        <table className="place-new-order-page__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Supplier Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                <input
                  type="text"
                  value={itemName}
                  className="DananjayaInput"
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Enter Item Name"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={orderQuantity}
                  className="DananjayaInput"
                  onChange={(e) => setOrderQuantity(e.target.value)}
                />
              </td>
              <td>
                <select
                  value={supplierEmail}
                  className="DananjayaInput"
                  onChange={(e) => setSupplierEmail(e.target.value)}
                >
                  <option value="" disabled>Select Supplier</option>
                  {supplierEmails.map((email, index) => (
                    <option key={index} value={email}>{email}</option>
                  ))}
                </select>
              </td>
              <td>
                <button className="DananjayaOrder" onClick={handlePlaceOrder}>Order</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SidebarOrderFuel>
  );
};

export default AddNewOrdersPage;
