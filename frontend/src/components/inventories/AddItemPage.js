import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './AddItemPage.module.css';
import SidebarLayout from './SidebarLayout';

const AddItemPage = () => {
  const location = useLocation();
  const { itemName: initialItemName, wholesalePrice: initialWholesalePrice, orderId, quantity } = location.state || {};

  const [itemName, setItemName] = useState(initialItemName || ''); 
  const [total, setTotal] = useState(quantity || 0);  
  const [wholesalePrice, setWholesalePrice] = useState(initialWholesalePrice || 0); 
  const [dateAdded, setDateAdded] = useState(new Date().toISOString().split('T')[0]); // Set today's date

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemName || total <= 0 || wholesalePrice < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in all fields correctly.',
      });
      return;
    }

    const formattedDate = new Date(dateAdded).toISOString().split('T')[0];

    try {
      const token = localStorage.getItem('token');

      // Post new item to the server
      await axios.post('http://localhost:5000/api/fuel-inventory/add', {
        itemName,
        dateAdded: formattedDate,
        total,
        sold: 0,
        wholesalePrice,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mark the order as added to inventory
      await axios.post(`http://localhost:5000/api/orders/received-orders/${orderId}/addToInventory`, {
        quantity: total, // This should be the same quantity that was ordered
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Item added successfully!',
      }).then(() => {
        navigate('/admin-welcome/fuel-inventory');
      });
    } catch (error) {
      console.error('Error adding item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add item.',
      });
    }
  };

  return (
    <SidebarLayout>
      <div className={styles.AhamedaddItemPage}>
        <h1>Add New Item</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Item Name:
            <input 
              type="text" 
              className={styles.AhamedSelect}
              value={itemName} 
              onChange={(e) => setItemName(e.target.value)} 
              readOnly 
            />
          </label>

          <label>
            Total:
            <input
              type="number"
              className={styles.AhamedNumber}
              value={total}
              readOnly 
            />
          </label>

          <label>
            Wholesale Price:
            <input
              type="number"
              className={styles.AhamedNumber}
              value={wholesalePrice}
              readOnly 
            />
          </label>

          <label>
            Date Added:
            <input
              type="date"
              className={styles.AhamedDate}
              value={dateAdded}
              onChange={(e) => setDateAdded(e.target.value)}
            />
          </label>

          <button className={styles.AhamedAdd} type="submit">Add Item</button>
        </form>
      </div>
    </SidebarLayout>
  );
};

export default AddItemPage;
