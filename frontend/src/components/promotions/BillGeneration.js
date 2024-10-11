import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './BillGeneration.css'; // Ensure this path is correct

const BillGeneration = () => {
    const [items, setItems] = useState([]);
    const [quantity, setQuantity] = useState({});
    const [promoCode, setPromoCode] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [discountedAmount, setDiscountedAmount] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [billDate, setBillDate] = useState(''); // New state for bill date
    const [error, setError] = useState('');

    const handleCalculate = async () => {
        try {
            const total = items.reduce((sum, item) => sum + item.retailPrice * (quantity[item._id] || 0), 0);
            const response = await axios.post('http://localhost:5000/api/promotions/apply', { code: promoCode, totalAmount: total });

            setDiscountedAmount(response.data.discountedAmount);
            setTotalAmount(total);
        } catch (error) {
            console.error("Error applying promotion:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to apply promotion. Please try again.',
            });
        }
    };

    const handleGenerateBill = async () => {
        // Ensure all necessary details are present
        if (!customerName || !customerContact || !billDate) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter customer details and select a date.',
            });
            return;
        }

        try {
            // You can post the bill details to the server or process it locally
            await axios.post('http://localhost:5000/api/bills', {
                customerName,
                customerContact,
                billDate, // Include bill date
                items: items.map(item => ({ ...item, quantity: quantity[item._id] })),
                totalAmount: discountedAmount || totalAmount
            });

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Bill generated successfully! Total amount: $${discountedAmount || totalAmount}`,
            });
        } catch (error) {
            console.error("Error generating bill:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to generate bill. Please try again.',
            });
        }
    };

    return (
        <div>
            <h1>Bill Generation</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="item-container">
                {items.map(item => (
                    <div key={item._id} className="item-block">
                        <img src={item.photo} alt={item.itemName} />
                        <h2>{item.itemName}</h2>
                        <p>Retail Price: ${item.retailPrice}</p>
                        <input
                            type="number"
                            min="1"
                            value={quantity[item._id] || ''}
                            onChange={(e) => setQuantity(prev => ({ ...prev, [item._id]: e.target.value }))}
                        />
                    </div>
                ))}
            </div>
            <input
                type="text"
                placeholder="Enter Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
            />
            <button onClick={handleCalculate}>Apply Promo Code</button>
            <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Customer Contact"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
            />
            <input
                type="date" // New input field for date
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
            />
            <button onClick={handleGenerateBill}>Generate Bill</button>
            <div>
                <p>Total Amount: ${totalAmount.toFixed(2)}</p>
                {discountedAmount !== null && <p>Discounted Amount: ${discountedAmount.toFixed(2)}</p>}
            </div>
        </div>
    );
};

export default BillGeneration;
