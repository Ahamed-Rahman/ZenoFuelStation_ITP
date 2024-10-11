import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './SupplierDashboard.module.css';

const AcceptOrderForm = ({ orderId, supplierEmail, orderType, onOrderAccepted ,onCancel}) => {
  const [quantity, setQuantity] = useState(1);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0); // New total amount state
  const [orderDate, setOrderDate] = useState(''); // New order date state

  // Automatically set today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setOrderDate(today);
  }, []);

  // Calculate total amount whenever quantity or wholesale price changes
  useEffect(() => {
    setTotalAmount(quantity * wholesalePrice);
  }, [quantity, wholesalePrice]);

  const handleAcceptOrder = async () => {
    if (!totalAmount || !orderDate) {
      Swal.fire('Error', 'Total amount and order date are required', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      // Decide the API route based on the order type
      const apiRoute = orderType === 'shop'
        ? `shop-orders/${orderId}/accept`
        : `orders/${orderId}/accept`;

      const response = await axios.post(`http://localhost:5000/api/supplierRoutes/${apiRoute}`, {
        quantity,
        wholesalePrice,
        totalAmount,  // Send total amount
        orderDate,    // Send the order date
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire('Success', response.data.message, 'success');
      onOrderAccepted();
    } catch (error) {
      console.error('Error accepting order:', error.response ? error.response.data : error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to accept the order', 'error');
    }
  };

  return (
    <div className={styles.acceptOrderForm}>
      <div className={styles.acceptOrderFormQL}>
      <h3>Accept Order</h3></div>
      <label>Quantity:</label>
      <input
        type="number"
        value={quantity}
        min="1"
        className={styles.acceptOrderFormQ}
        onChange={(e) => setQuantity(e.target.value)}

      />

      <label>Wholesale Price:</label>
      <input
        type="number"
        value={wholesalePrice}
        min="0"
        className={styles.acceptOrderFormQ}
        onChange={(e) => setWholesalePrice(e.target.value)}
      />

      <label>Total Amount (Rs):</label>
      <input
        type="number"
        value={totalAmount}
        className={styles.acceptOrderFormQ}
        readOnly
      />

      <label>Order Date:</label>
      <input
        type="date"
        value={orderDate}
        className={styles.acceptOrderFormQ}
        readOnly
      />

      <button className={styles.acceptOrderFormQB} onClick={handleAcceptOrder}>Submit</button>
       <button className={styles.acceptOrderFormCancel} onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default AcceptOrderForm;
