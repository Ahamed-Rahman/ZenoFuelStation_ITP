import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; 

const ShopInventoryPage = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [supplierEmails, setSupplierEmails] = useState({});
  const [placedOrders, setPlacedOrders] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/ordersShop/low-stock-items', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.data.length === 0) {
          console.log("No low stock items found");
          setLowStockItems([]); // Clear if no low stock items
        } else {
          setLowStockItems(response.data); // Set only low stock items
        }
  
        console.log('Low stock items:', response.data);  // Verify data
      } catch (error) {
        console.error('Error fetching low stock items:', error);
      }
    };
  
    fetchLowStockItems();
  }, []);
  
  

  const handlePlaceOrder = async (item) => {
    const orderQuantity = orderQuantities[item._id];
    const supplierEmail = supplierEmails[item._id];

    if (!orderQuantity || !supplierEmail) {
      Swal.fire('Error!', 'Please fill in all fields before placing the order.', 'error');
      return;
    }

    // Prevent re-ordering the same item
    if (placedOrders.includes(item._id)) {
      Swal.fire('Error!', 'Order for this item has already been placed.', 'error');
      return;
    }

    const orderData = {
      itemId: item._id,
      itemName: item.itemName,
      quantity: orderQuantity,
      supplierEmail,
    };

    const token = localStorage.getItem('token');

    try {
      await axios.post('http://localhost:5000/api/ordersShop/place-order', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire('Order placed!', `Order for ${item.itemName} has been placed.`, 'success');

      setPlacedOrders(prevOrders => [...prevOrders, item._id]);
      setOrderQuantities(prev => ({ ...prev, [item._id]: 1 }));
      setSupplierEmails(prev => ({ ...prev, [item._id]: '' }));
    } catch (err) {
      console.error('Error placing order:', err);
      Swal.fire('Error!', 'Failed to place order.', 'error');
    }
  };

  const handleQuantityChange = (itemId, value) => {
    setOrderQuantities({
      ...orderQuantities,
      [itemId]: value,
    });
  };

  const handleSupplierEmailChange = (itemId, value) => {
    setSupplierEmails({
      ...supplierEmails,
      [itemId]: value,
    });
  };

  return (
    <div>
      <h1>Shop Inventory Management</h1>

      <button onClick={() => navigate('/admin-welcome/orderShop')}>Create Order for New Item</button>

      <table>
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
      <td>{index + 1}</td> {/* Displaying sequential ID */}
      <td>{item.itemName}</td>
      <td style={{ color: 'red' }}>Low Stock</td>
      <td>
        <input
          type="number"
          value={orderQuantities[item._id] || 1}
          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
          min="1"
        />
      </td>
      <td>
        <input
          type="email"
          value={supplierEmails[item._id] || ''}
          onChange={(e) => handleSupplierEmailChange(item._id, e.target.value)}
          placeholder="Supplier Email"
        />
      </td>
      <td>
        <button onClick={() => handlePlaceOrder(item)}>Order</button>
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
};

export default ShopInventoryPage;
