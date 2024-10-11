import React, { useState, useEffect } from 'react';
import ShopInventoryChart from './ShopInventoryChart';  // Pie chart component
import ShopInventoryBarChart from './ShopInventoryBarChart'; // Bar chart component
import styles from './DashboardShop.module.css'; // Assuming you have some styles
import SidebarLayout from './SidebarLayoutShop';
import axios from 'axios';

const DashboardShop = () => {
    // Fetch your data from backend or state management
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        const fetchItems = async () => {
            const token = localStorage.getItem('token'); // Adjust based on where your token is stored
            try {
                const response = await axios.get('http://localhost:5000/api/shop-inventory', {
                    headers: { Authorization: `Bearer ${token}` }
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
                setItems(itemsWithSequentialId);
            } catch (error) {
                console.error("Error fetching items:", error);
                // Handle specific error codes or show a message to the user
            } finally {
                setLoading(false);
            }
        };


        fetchItems();
    }, []);
    const filteredItems = items.filter(item =>
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <SidebarLayout>
            <div className={styles.dashboardContainer}>
            <h1 className={styles.pageTitle}>Dashboard</h1>
           <div className={styles.chartsWrapper}>
                <div className={styles.AchartS}>
                    <h2></h2>
                    <ShopInventoryBarChart items={filteredItems} />
                </div>

                {/* Pie Chart */}
                <div className={styles.Achart}>
                <h2 style={{ marginLeft:'150px', fontSize:'19px'}}>Available Shop Items</h2>
                    
                    <ShopInventoryChart items={filteredItems} />
                </div>
            

            {/* Add more dashboard components or widgets below */}
        </div>
        </div>
        
        </SidebarLayout>
    );
};

export default DashboardShop;
