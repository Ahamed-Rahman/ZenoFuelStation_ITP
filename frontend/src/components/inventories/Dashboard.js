import React, { useState, useEffect } from 'react';
import socket from '../../services/socketService';
import SidebarLayout from './SidebarLayout';
import SoldVsTotalLitresChart from './SoldVsTotalLitresChart';
import InventoryChart from './InventoryChart';
import styles from './Dashboard.module.css';
import axios from 'axios';

const Dashboard = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem('token'); // Adjust this if your token is stored elsewhere
      try {
        const response = await axios.get('http://localhost:5000/api/fuel-inventory/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(response.data);
      } catch (err) {
        console.error('Failed to fetch items:', err);
        // You can handle specific error codes here if needed
      }
    };
    fetchItems();


  
    socket.on('inventoryUpdate', (data) => {
      console.log('Received inventory update:', data); // Add logging
      setItems(data);
    });
  
    return () => {
      socket.off('inventoryUpdate');
    };
  }, []);

  return (
    <SidebarLayout>
      <div className={styles.AhameddashboardContainers}>
        <h1 className={styles.AhamedpageTitle}>Dashboard</h1>
        <div className={styles.AhamedchartsWrapper}>
          <div className={styles.AhamedchartS}>
            <SoldVsTotalLitresChart items={items} />
          </div>
          <div className={styles.Ahamedchart}>
            <InventoryChart items={items} />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
