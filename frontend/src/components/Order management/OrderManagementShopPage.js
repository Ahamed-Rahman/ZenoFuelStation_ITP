import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SidebarOrder from './SidebarOrder'; // Adjust this path if needed

const PlaceNewItemOrder = () => {
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [supplierEmail, setSupplierEmail] = useState('');
    const [supplierEmails, setSupplierEmails] = useState([]); // State to store supplier emails

  // Fetch supplier emails when the component mounts
  useEffect(() => {
    const fetchSupplierEmails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/suppliers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSupplierEmails(response.data.map(supplier => supplier.email));
      } catch (err) {
        console.error('Error fetching supplier emails:', err);
      }
    };

    fetchSupplierEmails();
  }, []);
  const handleSubmit = async (e) => {

    e.preventDefault();  // Prevent the form from refreshing the page
    // Log the data being sent to the API for debugging
    console.log('Data being sent:', {
      itemName,
      quantity,
      supplierEmail,
      orderDate: new Date(),
    });
  
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/ordersShop/place-order',
        {
          itemName,
          quantity,
          supplierEmail,
          orderDate: new Date(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      Swal.fire('Success', 'Order placed successfully', 'success');
      // Clear form fields after success
      setItemName('');
      setQuantity('');
      setSupplierEmail('');
    } catch (error) {
      console.error('Order placement error:', error.response ? error.response.data : error);
      Swal.fire('Error', 'Failed to place order. Please check your input or session.', 'error');
    }
  };
  

    return (
        <SidebarOrder>
            <div className="place-new-order-page">
                <h1>Place New Item Order</h1>
                <form onSubmit={handleSubmit}>
                    <table className="place-new-order-page__table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Supplier Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        required
                                        className="DananjayaInput"
                                        placeholder="Enter Item Name"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        required
                                        className="DananjayaInput"
                                        placeholder="Enter Quantity"
                                    />
                                </td>
                                <td>
                <select
                  value={supplierEmail}
                  className="DananjayaInput"
                  onChange={(e) => setSupplierEmail(e.target.value)}
                >
                  <option value="" disabled>Select Supplier</option>
                  {supplierEmails.map((email, index) => (
                    <option key={index} value={email}>{email}</option>
                  ))}
                </select>
              </td>
                                <td>
                                    <button type="submit" className="DananjayaOrder">Place Order</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        </SidebarOrder>
    );
};

export default PlaceNewItemOrder;
