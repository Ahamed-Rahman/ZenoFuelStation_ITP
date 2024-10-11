import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './EditItemPage.module.css';
import socket from '../../services/socketService';


const predefinedItems = ['Diesel', 'Petrol', 'LPG', 'CNG', 'Gas', 'Ethanol'];

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    itemName: '',
    total: 0,
    wholesalePrice: 0,
    dateAdded: ''
  });
  const [originalName, setOriginalName] = useState('');
  const [sold, setSold] = useState(0);
  const [isOther, setIsOther] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      const token = localStorage.getItem('token'); // Adjust this if your token is stored elsewhere
      try {
        const response = await axios.get(`http://localhost:5000/api/fuel-inventory/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const itemData = response.data;
        setItem({
          itemName: itemData.itemName,
          total: itemData.total,
          wholesalePrice: itemData.wholesalePrice,
          dateAdded: itemData.dateAdded
        });
        setOriginalName(itemData.itemName); 
        setSold(itemData.sold);
        setIsOther(!predefinedItems.includes(itemData.itemName));
      } catch (err) {
        console.error('Failed to fetch item:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch item data.',
        });
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const available = item.total - sold;
    const formattedDate = new Date(item.dateAdded).toISOString().split('T')[0];

    if (!item.itemName || item.total <= 0 || available < 0 || item.wholesalePrice < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in all fields correctly.',
      });
      return;
    }

    const itemDate = new Date(item.dateAdded);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    itemDate.setHours(0, 0, 0, 0);

    if (itemDate.getTime() !== today.getTime()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid date. Please select today\'s date.',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Adjust this if your token is stored elsewhere
      const { data: existingItems } = await axios.get('http://localhost:5000/api/fuel-inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const itemExists = existingItems.some(existingItem =>
        existingItem.itemName.toLowerCase() === item.itemName.toLowerCase() && existingItem._id !== id
      );

      if (itemExists && item.available > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An item with this name already exists.',
        });
        return;
      }

      await axios.put(`http://localhost:5000/api/fuel-inventory/update/${id}`, {
        ...item,
        dateAdded: formattedDate,
        available,
        sold,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Item updated successfully!',
      });

      if (socket) {
        socket.emit('inventoryUpdate', { ...item, available, sold });
      } else {
        console.error('Socket instance is not initialized.');
      }

      navigate('/admin-welcome/fuel-inventory');
    } catch (err) {
      console.error('Failed to update item:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update item.',
      });
    }
  };

  const handleItemChange = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      setIsOther(true);
      setItem({ ...item, itemName: '' });
    } else {
      setIsOther(false);
      setItem({ ...item, itemName: value });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleGoBack = () => {
    navigate('/admin-welcome/fuel-inventory');
  };
  
  return (
    <div className={styles.AhamedpageContainer}>
    <div className={styles.Ahamedbackground}></div>
    <div class={styles.AhamedbackgroundOverlay}></div>
    <div className={styles.AhamededitItemPage}>
    <button className={styles.AhamedgoBackButton3} onClick={handleGoBack}>
        Go Back
      </button>
    

      <h1 className={styles.Ahamedheading}>Edit Item</h1>
      <form className={styles.Ahamedform3} onSubmit={handleSubmit}>
        <label className={styles.Ahamedlabel3}>
          Item Name:
          <select
            className={styles.Ahamedselect3}
            value={isOther ? 'Other' : item.itemName}
            onChange={handleItemChange}
          >
            {predefinedItems.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          {isOther && (
            <input
              type="text"
              name="itemName"
              className={styles.Ahamedinput3}
              value={item.itemName}
              onChange={handleChange}
              placeholder="Enter item name"
            />
          )}
        </label>
        <label>
      
          Total:
          <div className={styles.AhamedNur4}>
          <input
            type="number"
            name="total"
            className={styles.AhamedNumber4}
            value={item.total}
            onChange={handleChange}
            disabled // Make field non-editable
          />
          </div>
        </label>
        <label>
        <div className={styles.AhamedPrice3}>
          Wholesale Price:
          <input
            type="number"
            name="wholesalePrice"
            className={styles.AhamedNumber4}
            value={item.wholesalePrice}
            onChange={handleChange}
            disabled // Make field non-editable
          />
          </div>
        </label>

        <label>
        <div className={styles.hh}>
          Date Added:
          <input
            type="date"
            name="dateAdded"
            className={styles.AhamedDate3}
            value={item.dateAdded}
            onChange={handleChange}
          />
          </div>
        </label>

        <button className={styles.Ahamedbutton3} type="submit">
          Update Item
        </button>
      </form>
     
    </div>
    </div>
  );
};

export default EditItemPage;
