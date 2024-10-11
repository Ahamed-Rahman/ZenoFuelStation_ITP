import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './shopSalesPage.module.css'; 
import shopImage from '../../assets/images/shop-image.jpg'; 

const ShopSalesManagement = () => {
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState({});
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/shop-inventory', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setItems(response.data);
            } catch (error) {
                console.error('Error fetching items:', error);
                alert('Failed to fetch items: ' + (error.response?.data?.message || 'Unknown error.'));
            }
        };
        fetchItems();
    }, []);

    const handleQuantityChange = (itemId, quantity) => {
        const quantityValue = Number(quantity);
        setCart(prevCart => ({
            ...prevCart,
            [itemId]: quantityValue,
        }));
    };

    const handleAddToCart = async (itemId) => {
        const quantity = cart[itemId] || 0;
        if (quantity > 0) {
            try {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:5000/api/shop-sales/sales', 
                    { itemId, quantity }, 
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                alert('Item added to cart successfully!');
                setCart(prevCart => ({ ...prevCart, [itemId]: 0 }));
            } catch (error) {
                console.error('Error adding to cart:', error.response?.data);
                alert('Failed to add item to cart: ' + (error.response?.data?.message || 'Unknown error.'));
            }
        } else {
            alert('Please enter a valid quantity.');
        }
    };

    const handleViewBill = () => {
        navigate('/admin-welcome/BillShow'); 
    };

    return (
        <div className={styles.SeshansalesPageContainer}> 
            <img src={shopImage} alt="Shop" className={styles.SeshanshopImage} />
            <div className={styles.SeshansalesPage}> 
            {items.map(item => (
    <div key={item._id} className={styles.SeshanitemBlock}>
        <img 
            src={item.photo ? item.photo.startsWith('http') ? item.photo : `http://localhost:5000/uploads/${item.photo}` : shopImage} 
            alt={item.itemName} 
            className={styles.SeshanitemPhoto} 
        />
        <h2>{item.itemName}</h2>
        <p>Unit Price: {item.retailPrice} Rs</p>
        <div className={styles.Seshanqty}>
            <input
                type="number"
                min="1"
                value={cart[item._id] || 0}
                onChange={(e) => handleQuantityChange(item._id, Math.max(0, parseInt(e.target.value) || 0))}
                className={styles.SeshanquantityInput}
            />
        </div>
        <div className={styles.Seshancart}>
            <button onClick={() => handleAddToCart(item._id)}>Add to Cart</button>
        </div>
    </div>
))}

            </div>
            <div className={styles.Seshanview}>
                <button onClick={handleViewBill} className={styles.SeshanviewBillButton}>View Bill</button>
            </div>
        </div>
    );
};

export default ShopSalesManagement;
