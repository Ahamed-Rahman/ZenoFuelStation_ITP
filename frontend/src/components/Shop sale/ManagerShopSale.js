import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './checkout.css';
import SidebarLayoutFuelManager from '../Fuel Sale/SidebarLayoutFuelManager';


const ManagerSale = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [pastSales, setPastSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchDate, setSearchDate] = useState(''); // State to store search input

    useEffect(() => {
        const fetchPastSales = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/shop-sales/view-orders', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Past Sales Response:", response.data);
                setPastSales(response.data);
                setFilteredSales(response.data); // Set initial filtered sales to all sales
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError('Unauthorized access. Please log in.');
                    navigate('/login');
                } else {
                    setError('Error fetching past sales.');
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPastSales();
    }, [navigate]);

    // Function to handle the date search
    const handleSearch = (e) => {
        const searchValue = e.target.value;
        setSearchDate(searchValue);

        if (searchValue) {
            // Filter sales by the date input
            const filtered = pastSales.filter(order => {
                const orderDate = new Date(order.saleDate).toLocaleDateString();
                return orderDate === new Date(searchValue).toLocaleDateString();
            });
            setFilteredSales(filtered);
        } else {
            setFilteredSales(pastSales); // If search is cleared, show all sales
        }
    };

    const handleBack = () => {
        navigate('/admin-welcome/BillShow');
    };

    return (
        <SidebarLayoutFuelManager>
        <div className="past-sales-container">
            <h1 className="past-sales-title">Past Sales</h1>
            
            {/* Search bar for filtering by date */}
            <input
                type="date"
                className="seshan-search-bar"
                value={searchDate}
                onChange={handleSearch}
                placeholder="Search by date"
            />

            {loading ? (
                <p className="loading-message">Loading past sales...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                
                    <table id="Sheshan-sale-table" className="Sheshantable">
                        <thead className="table-header">
                            <tr>
                                <th className="table-header-cell">Item Name</th>
                                <th className="table-header-cell">Quantity</th>
                                <th className="table-header-cell">Total Price</th>
                                <th className="table-header-cell">Date</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {filteredSales.length === 0 ? (
                                <tr className="no-orders-row">
                                    <td colSpan="4" className="no-orders-message">No past orders found.</td>
                                </tr>
                            ) : (
                                filteredSales.map((order, index) => (
                                    <tr key={index} className="sales-row">
                                        <td className="sales-cell">{order.itemName}</td>
                                        <td className="sales-cell">{order.quantity}</td>
                                        <td className="sales-cell">{`Rs. ${order.totalPrice}`}</td>
                                        <td className="sales-cell">{new Date(order.saleDate).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                
            )}
            
            <button className="seshan-back-button" onClick={handleBack}>Back</button>
        </div>
        </SidebarLayoutFuelManager>
    );
};

export default ManagerSale;
