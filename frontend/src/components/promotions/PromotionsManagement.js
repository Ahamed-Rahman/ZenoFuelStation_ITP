import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './PromotionsManagement.css'; // Ensure this path is correct

const PromotionsManagement = () => {
    const [promoCode, setPromoCode] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [discountedAmount, setDiscountedAmount] = useState(0);
    const [error, setError] = useState('');
    const [minimumPurchaseAmount, setMinimumPurchaseAmount] = useState(0);

    useEffect(() => {
        fetchMinimumPurchaseAmount();
    }, []);

    const fetchMinimumPurchaseAmount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get("http://localhost:5000/MinimumPurchase/get", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMinimumPurchaseAmount(response.data.minimumAmount);
        } catch (error) {
            console.error("Error fetching minimum purchase amount:", error);
        }
    };

    const handleApplyPromo = async () => {
        try {
            if (totalAmount < minimumPurchaseAmount) {
                Swal.fire({
                    icon: 'info',
                    title: 'Info',
                    text: `Minimum purchase amount for discount is $${minimumPurchaseAmount}.`,
                });
                return;
            }
            
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/promotions/apply', 
                { promoCode, totalAmount },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const { discountedAmount, message } = response.data;
            setDiscountedAmount(discountedAmount);
            setTotalAmount(discountedAmount); // Update the total amount after discount
            
            Swal.fire({
                icon: 'success',
                title: 'Promo Code Applied',
                text: message,
            });
        } catch (error) {
            console.error("Error applying promo code:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Invalid or expired promo code.',
            });
        }
    };

    return (
        <div>
            <h1>Promotions and Discounts</h1>
            {error && <p>{error}</p>}
            <div className="promo-container">
                <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Enter total amount"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                />
                <button onClick={handleApplyPromo}>Apply Promo Code</button>
                <div className="amount-info">
                    <p>Total Amount: ${totalAmount.toFixed(2)}</p>
                    <p>Discounted Amount: ${discountedAmount.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default PromotionsManagement;
