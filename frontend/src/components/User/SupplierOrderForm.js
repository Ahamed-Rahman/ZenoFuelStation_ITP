import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AcceptOrderForm = ({ orderId, supplierEmail, onOrderAccepted }) => {
    const [quantity, setQuantity] = useState(1);
    const [wholesalePrice, setWholesalePrice] = useState(0);

    const handleAcceptOrder = async () => {
        const token = localStorage.getItem('token');
        try {
            // Send a POST request to accept the order
            const response = await axios.post(`http://localhost:5000/api/supplierRoutes/orders/${orderId}/accept`, {
                quantity,
                wholesalePrice,
            }, {
                headers: { Authorization: `Bearer ${token}` }, // Include the token for authentication
            });

            // Show success message
            Swal.fire('Success', response.data.message, 'success');
            onOrderAccepted(); // Callback to refresh the order list in SupplierDashboard
        } catch (error) {
            // Log and show error message
            console.error('Error accepting order:', error.response ? error.response.data : error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to accept the order', 'error');
        }
    };

    return (
        <div>
            <h3>Accept Order</h3>
            <label>Quantity:</label>
            <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(e.target.value)}
            />

            <label>Wholesale Price:</label>
            <input
                type="number"
                value={wholesalePrice}
                min="0"
                onChange={(e) => setWholesalePrice(e.target.value)}
            />

            <button onClick={handleAcceptOrder}>Submit</button>
        </div>
    );
};

export default AcceptOrderForm;
