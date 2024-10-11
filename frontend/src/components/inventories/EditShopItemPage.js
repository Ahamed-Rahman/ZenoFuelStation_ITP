import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './EditShopItempage.css'; // Ensure this path is correct


const EditShopItemPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        const fetchItem = async () => {
            console.log("Fetching item with ID:", id);
            if (!id) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Invalid item ID.',
                });
                navigate('/admin-welcome/shop-inventory');
                return;
            }
            
            try {
                const token = localStorage.getItem('token'); // Get token from local storage
                const response = await axios.get(`http://localhost:5000/api/shop-inventory/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Attach token to request headers
                    }
                });
                console.log("Fetched item data:", response.data);
                setItem(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching item:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch item. Please try again.',
                });
                navigate('/admin-welcome/shop-inventory');
            }
        };
    
        fetchItem();
    }, [id, navigate]);
    
    
    const handleUpdateItem = async () => {
        if (!item.itemName || !item.purchasePrice || !item.retailPrice || !item.dateAdded) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill in all fields.',
            });
            return;
        }

        if (isNaN(item.purchasePrice) || item.purchasePrice <= 0 || isNaN(item.retailPrice) || item.retailPrice <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter positive numbers for prices.',
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

        const formData = new FormData();
        formData.append('itemName', item.itemName);
        formData.append('purchasePrice', item.purchasePrice);
        formData.append('retailPrice', item.retailPrice);
        formData.append('dateAdded', item.dateAdded);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const token = localStorage.getItem('token'); // Get token from local storage
            await axios.put(`http://localhost:5000/api/shop-inventory/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` // Attach token to request headers
                }
            });
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Item updated successfully!',
            });
            navigate('/admin-welcome/shop-inventory');
        } catch (error) {
            console.error("Error updating item:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update item. Please try again.',
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setItem(prevItem => ({
            ...prevItem,
            [name]: value
        }));
    };

    if (loading) return <p>Loading...</p>;
    if (!item) return null;

    return (
        <div className="Ahamed-edit-shop-item-page">
            <h1>Edit Shop Item</h1>
            <button onClick={() => navigate('/admin-welcome/shop-inventory')} className="Ahamed-go-back-button">
                Go Back
            </button>
            <form onSubmit={e => { e.preventDefault(); handleUpdateItem(); }}>
                <label>
                    Item Name:
                    
                    <input 
                        type="text" 
                        name="itemName" 
                        value={item.itemName} 
                        class='Ahamed3'
                        onChange={handleInputChange} 
                        required 
                    />
                
                </label>
                <label>
                    Purchase Price (₹):
                   
                    <input 
                        type="number" 
                        name="purchasePrice" 
                        value={item.purchasePrice} 
                         class='Ahamed3'
                        onChange={handleInputChange} 
                        disabled // Make field non-editable
                    />
                    
                </label>
                <label>
                    Retail Price (₹):
                  
                    <input 
                        type="number" 
                        name="retailPrice" 
                        value={item.retailPrice} 
                         class='Ahamed3'
                        onChange={handleInputChange} 
                        min="0" 
                        step="0.01" 
                        required 
                    />
                   
                </label>
                <label>
                    Date Added:
                 
                    <input 
                        type="date" 
                        name="dateAdded" 
                        value={item.dateAdded.split('T')[0]} // Ensure proper date format for input
                         class='Ahamed3'
                        onChange={handleInputChange} 
                        required 
                    />
                    
                </label>
                <label>
               
                    Upload New Photo (Optional):
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                         class='Ahamed3'
                        onChange={(e) => setPhoto(e.target.files[0])} 
                    />
                    
                </label>
                {error && <p className="error-message">{error}</p>}
                <button className='AhamedUpdate' type="submit">Update Item</button>
            </form>
        </div>
    );
};

export default EditShopItemPage;
