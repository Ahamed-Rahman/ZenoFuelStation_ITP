import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SidebarOrderFuel from './SidebarOrderFuel'; // Assuming you're using a sidebar layout

const OrderManagementPage = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [supplierEmails, setSupplierEmails] = useState({});
  const [validSupplierEmails, setValidSupplierEmails] = useState([]);
  const [placedOrders, setPlacedOrders] = useState(() => {
    // Load placed orders from local storage
    const storedOrders = localStorage.getItem('placedOrders');
    return storedOrders ? JSON.parse(storedOrders) : []; // Parse JSON if exists, else return empty array
  });

  useEffect(() => {
    // Fetch low stock items
    const fetchLowStockItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/fuel-inventory', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filteredItems = response.data.filter(item => item.available <= 20000);
        setLowStockItems(filteredItems);
      } catch (error) {
        console.error('Error fetching low stock items:', error);
      }
    };

    // Fetch valid supplier emails
    const fetchValidSupplierEmails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/suppliers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setValidSupplierEmails(response.data.map(supplier => supplier.email)); // Store valid supplier emails
      } catch (error) {
        console.error('Error fetching supplier emails:', error);
      }
    };

    fetchLowStockItems();
    fetchValidSupplierEmails();
  }, []);

  // Handle placing an order
  const handlePlaceOrder = async (item) => {
    const orderQuantity = orderQuantities[item._id];
    const supplierEmail = supplierEmails[item._id];
  
    if (!orderQuantity || !supplierEmail) {
      Swal.fire('Error!', 'Please fill in all fields before placing the order.', 'error');
      return;
    }
  
    if (!validSupplierEmails.includes(supplierEmail)) {
      Swal.fire('Error!', 'Invalid supplier email. Please select a valid supplier.', 'error');
      return;
    }
  
    // Prevent re-ordering the same item
    if (placedOrders.includes(item._id)) {
      Swal.fire('Error!', 'Order for this item has already been placed.', 'error');
      return;
    }
  
    const orderData = {
      itemName: item.itemName,
      quantity: orderQuantity,
      supplierEmail,
      totalAmount: item.wholesalePrice * orderQuantity, // Assuming you have wholesalePrice in the `item`
      orderDate: new Date(), // Automatically set the order date to now
    };
  
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/orders/place-order', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire('Order placed!', `Order for ${item.itemName} has been placed.`, 'success');
  
      // Mark the item as ordered and update local storage
      const updatedPlacedOrders = [...placedOrders, item._id];
      setPlacedOrders(updatedPlacedOrders);
      localStorage.setItem('placedOrders', JSON.stringify(updatedPlacedOrders)); // Save to local storage
    } catch (error) {
      console.error('Error placing order:', error);
      Swal.fire('Error!', 'Failed to place order.', 'error');
    }
  };
  

  // Handle quantity changes for each item
  const handleQuantityChange = (itemId, value) => {
    setOrderQuantities({
      ...orderQuantities,
      [itemId]: value,
    });
  };

  // Handle supplier email changes for each item
  const handleSupplierEmailChange = (itemId, value) => {
    setSupplierEmails({
      ...supplierEmails,
      [itemId]: value,
    });
  };

  return (
    <SidebarOrderFuel>
      <div className="place-new-order-page">
        <h1>Order Management</h1>
        <table className="place-new-order-page__table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Item Name</th>
              <th>Status</th>
              <th>Quantity</th>
              <th>Supplier Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.itemName}</td>
                <td style={{ color: 'red' }}>Low Stock</td>
                <td>
                  <input
                    type="number"
                    className="DananjayaInput"
                    value={orderQuantities[item._id] || 1}
                    onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                    disabled={placedOrders.includes(item._id)} // Disable input if order placed
                  />
                </td>
                <td>
                  <select
                    value={supplierEmails[item._id] || ''}
                    className="DananjayaInput"
                    onChange={(e) => handleSupplierEmailChange(item._id, e.target.value)}
                    disabled={placedOrders.includes(item._id)} // Disable input if order placed
                  >
                    <option value="" disabled>Select Supplier</option>
                    {validSupplierEmails.map(email => (
                      <option key={email} value={email}>
                        {email}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {!placedOrders.includes(item._id) ? (
                    <button className="DananjayaOrder" onClick={() => handlePlaceOrder(item)}>
                      Order
                    </button>
                  ) : (
                    <span>Order Placed</span> // Display message instead of button
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarOrderFuel>
  );
};

export default OrderManagementPage;
