import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import './viewBill.css';
import logoImage from '../../assets/images/logo.png'; // Adjust the path as needed


const BillPage = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]); // Ensure this is initialized as an array
    const [promoCode, setPromoCode] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [promoDetails, setPromoDetails] = useState(null);
    const [discountedPrice, setDiscountedPrice] = useState(0);
    const [discountedAmount, setDiscountedAmount] = useState(0); // New state variable

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/shop-sales/view-bill', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("Response data:", response.data); // Log the response data

                // Access the sales data correctly
                const salesData = Array.isArray(response.data.sales) ? response.data.sales : [];
                setSales(salesData);
                calculateTotal(salesData); // Pass the salesData to calculate total
            } catch (error) {
                console.error('Error fetching sales:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/');
                }
            }
        };

        fetchSales();
    }, [navigate]);

    const calculateTotal = (salesData) => {
        if (!Array.isArray(salesData)) {
            console.error('salesData is not an array');
            return;
        }

        const total = salesData.reduce((acc, sale) => acc + (sale.quantity * sale.unitPrice), 0);
        setTotalPrice(total);
    };

    const handlePromoCodeChange = (e) => {
        setPromoCode(e.target.value);
    };

    const handleApplyPromo = async () => {
        // Check if promo code is provided
        if (!promoCode) {
            alert('Please enter a promo code.');
            return;
        }
    
        // Check if total price meets the minimum requirement for the promo
        if (totalPrice < 2000) {
            alert('Promotion applies to bills over 2000.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:5000/Promotions/apply-promo`, {
                promoCode,
                totalPrice
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            const { discountedPrice, message, updatedPromo } = response.data;
    
            // If promo is valid, set promo details and apply the discount
            setPromoDetails(updatedPromo);
            setDiscountedPrice(discountedPrice);
            setDiscountedAmount(totalPrice - discountedPrice);
            alert(message); // Show success message
        } catch (error) {
            console.error('Error applying promo code:', error);
            alert(error.response?.data?.message || 'An error occurred while applying the promo code.');
        }
    };

    const applyDiscount = (promo) => {
        let discountAmount = 0;

        // Calculate discount based on promo type
        if (promo.promo_type === 'Percentage') {
            discountAmount = (promo.promo_value / 100) * totalPrice;
        } else if (promo.promo_type === 'Fixed') {
            discountAmount = promo.promo_value;
        }

        const newTotal = totalPrice - discountAmount;
        setDiscountedPrice(newTotal); // Set the discounted price
        setDiscountedAmount(discountAmount); // Store the discount amount
    };

    const handleDelete = async (itemId) => {
        try {
            const token = localStorage.getItem('token'); // Get token for authorization
            await axios.delete(`http://localhost:5000/api/shop-sales/sales/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Filter out the deleted sale from the state
            setSales(prevSales => {
                const updatedSales = prevSales.filter(sale => sale.itemId !== itemId);
                calculateTotal(updatedSales); // Recalculate total after deletion
                return updatedSales;
            });
        } catch (error) {
            console.error('Error deleting sale:', error);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token'); // Get token for authorization
            
            // Create the payload
            const payload = {
                sales,
                totalPrice: discountedPrice > 0 ? discountedPrice : totalPrice, // Use discounted price if available
                promoCode: promoCode || null, // Send promo code if applied
                date
            };
    
            // Log the payload
            console.log('Checkout Payload:', payload);
    
            // Send the checkout request
            const response = await axios.post('http://localhost:5000/api/shop-sales/checkout', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            // Clear displayed sales
            setSales([]);
            // Navigate to the checkout confirmation page with sales, final price, and date
            navigate('/admin-welcome/checkout', {
                state: { sales, totalPrice: response.data.finalPrice, date } // Use finalPrice from response
            });
        } catch (error) {
            console.error('Error during checkout:', error.response ? error.response.data : error.message);
        }
    };
    
    const downloadBill = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
    
        // Add the logo in the top left corner
        const logoSize = 30;
        const logoImageSrc = logoImage; // Ensure this points to the correct path of your logo
        doc.addImage(logoImageSrc, 'PNG', margin, margin, logoSize, logoSize);
    
        // Add the title below the logo
        doc.setFontSize(16);
        doc.setFont('Helvetica', 'bold');
        doc.text('Zeno Shop Bill', margin + 70, margin + 20); // Adjust the position for the title
    
        // Define the table data for the sales
        const tableData = sales.map(sale => [
            sale.itemName, 
            sale.quantity, 
            `Rs. ${sale.unitPrice}`, 
            `Rs. ${sale.quantity * sale.unitPrice}`
        ]);
    
        // Add the table with headers
        doc.autoTable({
            head: [['Item Name', 'Quantity', 'Unit Price', 'Total Price']],
            body: tableData,
            startY: margin + 40, // Adjust the starting Y position to leave space for the logo and title
            theme: 'grid',
            styles: {
                font: 'Helvetica',
                fontSize: 10,
                textColor: [40, 40, 40],
                lineColor: [216, 216, 216],
                lineWidth: 0.1,
                cellPadding: 4, // Adds padding for better readability
            },
            headStyles: {
                fillColor: [40, 116, 166],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center', // Center-align headers
            },
            bodyStyles: {
                fillColor: [245, 245, 245],
                valign: 'middle',
                halign: 'center', // Center-align text in the body
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255],
            },
        });
    
        // Get the position for the next text block
        let lastY = doc.autoTable.previous.finalY || 40;
    
        // Add the total price below the table
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'normal');
        doc.text(`Total Price: Rs. ${totalPrice}`, margin, lastY + 10);
    
        // Include discounted amount and discounted price if applicable
        if (discountedAmount > 0) {
            doc.text(`Discount Amount: Rs. ${discountedAmount}`, margin, lastY + 20);
            doc.text(`Discounted Price: Rs. ${discountedPrice}`, margin, lastY + 30);
        }
    
        // Add a thank-you message at the bottom
        const thankYouMessage = "Thank you for your purchase!";
        const textWidth = doc.getTextWidth(thankYouMessage);
        const textXPosition = (pageWidth - textWidth) / 2;
        doc.text(thankYouMessage, textXPosition, doc.lastAutoTable.finalY + 50);
    
        // Save the PDF with a meaningful name
        doc.save('sales_bill.pdf');
    };
    

    const handleViewOrders = async () => {
        try {
            const token = localStorage.getItem('token'); // Get token for authorization
            const response = await axios.get('http://localhost:5000/api/shop-sales/view-orders', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const allSales = response.data;
            calculateTotal(allSales); // Calculate total for all past orders
            navigate('/admin-welcome/checkout', { state: { sales: allSales, totalPrice: totalPrice, date } });
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    return (
        <div className="seshan-sales-bill-container">
            <h1 className="SeshanTitle">Your Sales Bill</h1>
            <table id="Sheshan-records-table" className="Sheshantable">
                <thead>
                    <tr>
                        <th>Item Photo</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                {Array.isArray(sales) && sales.map((sale) => (
                        <tr key={`${sale.itemId}-${sale.quantity}`}> {/* Updated key for uniqueness */}
                            <td><img src={`http://localhost:5000/uploads/${sale.photo}`} alt={sale.itemName} /></td>
                            <td>{sale.itemName}</td>
                            <td>{sale.quantity}</td>
                            <td>{sale.unitPrice}</td>
                            <td>
                                <button className="seshanRemove" onClick={() => handleDelete(sale.itemId)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className='seshan-form-contain'>
                <form onSubmit={handleCheckout}>
                    <label>
                    <div className="seshanLabel">
                        Date:
                        </div>
                        <input type="date" className="seshanDate" value={date} onChange={(e) => setDate(e.target.value)} />
                       
                    </label>
                    <div className="seshanTotal" >Total Price: {totalPrice} Rs</div>
                    {discountedPrice > 0 && <div className="seshanTotal1">Discounted Price: {discountedPrice} Rs</div>}

                    <div>
                        <label > <div className="seshanCode">Promo Code:</div>
                        <input type="text" className="seshanPromo" value={promoCode} onChange={handlePromoCodeChange} /> </label>
                        <button type="button"  className="seshanbtn" onClick={handleApplyPromo}>Apply Promo Code</button>
                    </div>

                    <button type="submit" className="seshanbtn">Checkout</button>
                </form>
            </div>
            <div className='seshan-btns'>
                <button className='seshan-dbb' onClick={downloadBill}>Download Bill</button>
                <button className='seshan-view-orders' onClick={handleViewOrders}>View Past Orders</button>
            </div>
        </div>
    );
};

export default BillPage;
