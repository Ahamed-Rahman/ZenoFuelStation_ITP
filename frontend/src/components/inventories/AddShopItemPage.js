import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './AddItemPage.module.css';
import SidebarLayout from './SidebarLayoutShop'; // Change the layout to SidebarLayoutShop

const AddShopItemPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract passed state (prefilled data) from location, or default to empty strings
  const { itemName: prefilledItemName, purchasePrice: prefilledPurchasePrice, orderId, quantity } = location.state || {};

  // State variables for the form fields
  const [itemName, setItemName] = useState(prefilledItemName || '');
  const [purchasePrice, setPurchasePrice] = useState(prefilledPurchasePrice || 0);
  const [total, setTotal] = useState(quantity || 0); // Use total to match other page
  const [retailPrice, setRetailPrice] = useState('');
  const [dateAdded, setDateAdded] = useState(new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState(null); // For image upload

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!itemName || total <= 0 || purchasePrice <= 0 || !retailPrice || !dateAdded) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in all fields correctly.',
      });
      return;
    }

    // Prepare the form data for the API call
    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('totalItems', total);
    formData.append('itemsSold', 0);
    formData.append('quantityAvailable', total); // Use the received quantity
    formData.append('purchasePrice', purchasePrice);
    formData.append('retailPrice', retailPrice);
    formData.append('dateAdded', dateAdded);
    if (photo) formData.append('photo', photo); // Append photo if available

    try {
      const token = localStorage.getItem('token'); // Assuming token-based auth

      // Post the new item to shop inventory
      await axios.post('http://localhost:5000/api/shop-inventory/add', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      // Mark the order as added to inventory
      await axios.post(`http://localhost:5000/api/ordersShop/received-orders/${orderId}/add-to-inventory`, {
        quantity: total, // Send the quantity ordered
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Shop item added successfully!',
      }).then(() => {
        navigate('/admin-welcome/shop-inventory');
      });
    } catch (error) {
      console.error('Error adding shop item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add shop item.',
      });
    }
  };

  return (
    <SidebarLayout>
      <div className={styles.AhamedaddItemPage}>
        <h1>Add New Shop Item</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Item Name:
            <input 
              type="text" 
              className={styles.AhamedSelect}
              value={itemName} 
              onChange={(e) => setItemName(e.target.value)} 
              readOnly // Make it read-only since it's prefilled
            />
          </label>

          <label>
            Total:
            <input
              type="number"
              className={styles.AhamedNumber}
              value={total}
              readOnly // Prefilled value from received order
            />
          </label>

          <label>
            Purchase Price:
            <input
              type="number"
              className={styles.AhamedNumber}
              value={purchasePrice}
              readOnly // Prefilled value from received order
            />
          </label>

          <label>
            Retail Price:
            <input
              type="number"
              className={styles.AhamedNumber}
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              required
            />
          </label>

          <label>
            Date Added:
            <input
              type="date"
              className={styles.AhamedDate}
              value={dateAdded}
              onChange={(e) => setDateAdded(e.target.value)}
              required
            />
          </label>

          <label>
            Upload Photo:
            <input
              type="file"
              accept="image/*"
              className={styles.AhamedDate}
              onChange={(e) => setPhoto(e.target.files[0])}
            />
          </label>

          <button className={styles.AhamedAdd} type="submit">
            Add Item
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
};

export default AddShopItemPage;
