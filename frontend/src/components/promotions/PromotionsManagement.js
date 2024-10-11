import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './PromotionsManagement.css'; // Ensure this path is correct

const PromotionsManagement = () => {
    const [promoCode, setPromoCode] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [discountedAmount, setDiscountedAmount] = useState(0);
    const [error, setError] = useState('');

    const handleApplyPromo = async () => {
        try {
            if (totalAmount < 5000) {
                Swal.fire({
                    icon: 'info',
                    title: 'Info',
                    text: 'Minimum purchase amount for discount is $5000.',
                });
                return;
            }
            
            const response = await axios.post('http://localhost:5000/api/promotions/validate', { promoCode });
            const discount = response.data.discount;
            const finalAmount = totalAmount - (totalAmount * discount / 100);
    
            setDiscountedAmount(finalAmount);
            Swal.fire({
                icon: 'success',
                title: 'Promo Code Applied',
                text: `Discount applied. Final amount: $${finalAmount.toFixed(2)}`,
            });
        } catch (error) {
            console.error("Error applying promo code:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Invalid or expired promo code.',
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
