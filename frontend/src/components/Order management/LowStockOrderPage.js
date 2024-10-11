import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; 
import SidebarOrder from './SidebarOrder';

const ShopInventoryPage = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [validSupplierEmails, setValidSupplierEmails] = useState([]);
  const [supplierEmails, setSupplierEmails] = useState({});
  const [placedOrders, setPlacedOrders] = useState(() => {
    // Load placed orders from local storage
    const storedOrders = localStorage.getItem('shopPlacedOrders');
    return storedOrders ? JSON.parse(storedOrders) : []; // Parse JSON if exists, else return empty array
  });
  

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


    const fetchSupplierEmails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/suppliers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setValidSupplierEmails(response.data.map(supplier => supplier.email)); // Store supplier emails
      } catch (err) {
        console.error('Error fetching supplier emails:', err);
      }
    };
  
    fetchLowStockItems();
    fetchSupplierEmails();

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
      orderDate: new Date(), 
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
    <SidebarOrder>
    <div className="place-new-order-page">
      <h1>Shop Inventory Management</h1>

    

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
      <td>{index + 1}</td> {/* Displaying sequential ID */}
      <td>{item.itemName}</td>
      <td style={{ color: 'red' }}>Low Stock</td>
      <td>
        <input
          type="number"
          value={orderQuantities[item._id] || 1}
          className="DananjayaInput"
          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
          
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
        <button  className="DananjayaOrder" onClick={() => handlePlaceOrder(item)}>Order</button>
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
    </SidebarOrder>
  );
};

export default ShopInventoryPage;
