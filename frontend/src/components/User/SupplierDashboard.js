import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AcceptOrderForm from './AcceptOrderForm';
import styles from './SupplierDashboard.module.css';

const SupplierDashboard = () => {
  const [fuelOrders, setFuelOrders] = useState([]); // Fuel orders state
  const [shopOrders, setShopOrders] = useState([]); // Shop orders state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderType, setSelectedOrderType] = useState(''); // New state for selected order type

  useEffect(() => {
    const fetchFuelOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/supplierRoutes/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFuelOrders(response.data);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch fuel orders', 'error');
      }
    };

    const fetchShopOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/supplierRoutes/shop-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched shop orders:', response.data);
        setShopOrders(response.data);
      } catch (error) {
        console.error('Error fetching shop orders:', error);
        Swal.fire('Error', 'Failed to fetch shop orders', 'error');
      }
    };

    fetchFuelOrders();
    fetchShopOrders();
  }, []);

  const handleAcceptClick = (order, orderType) => {
    setSelectedOrder(order); // Open form to accept the order
    setSelectedOrderType(orderType); // Set the order type (fuel or shop)
  };

  const handleDenyClick = async (orderId, orderType) => {
    const token = localStorage.getItem('token');
    const apiRoute = orderType === 'fuel' 
      ? `supplierRoutes/orders/${orderId}/reject` 
      : `shop-orders/${orderId}/reject`;

    try {
      await axios.put(`http://localhost:5000/api/${apiRoute}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire('Success', 'Order has been rejected', 'success');

      // Refresh orders after rejection
      const updatedFuelOrders = fuelOrders.map((order) => {
        if (order._id === orderId) {
          return { ...order, status: 'Rejected' };
        }
        return order;
      });

      const updatedShopOrders = shopOrders.map((order) => {
        if (order._id === orderId) {
          return { ...order, status: 'Rejected' };
        }
        return order;
      });

      setFuelOrders(updatedFuelOrders);
      setShopOrders(updatedShopOrders);
    } catch (error) {
      console.error('Error rejecting order:', error);
      Swal.fire('Error', 'Failed to reject order', 'error');
    }
  };

  return (
    <div>
      <div className={styles.AhamedHead}>
        <h3>Fuel Orders</h3>
      </div>
      <div className={styles.scrollableContainer}>
        <table className={styles.Shakeekamanagertable}>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Supplier Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fuelOrders.map((order) => (
              <tr key={order._id}>
                <td>{order.itemName}</td>
                <td>{order.quantity}</td>
                <td>{order.supplierEmail}</td>
                <td>{order.status}</td>
                <td>
                  {order.status === 'Pending' && (
                    <>
                      <button 
                        className={styles.AhamedAccept}  
                        onClick={() => handleAcceptClick(order, 'fuel')}
                      >
                        Accept
                      </button>
                      <button 
                        className={styles.AhamedAccept2} 
                        onClick={() => handleDenyClick(order._id, 'fuel')}
                      >
                        Deny
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.scrollableContainer}>
        <div className={styles.AhamedHead2}>
          <h3>Shop Orders</h3>
        </div>
        <table className={styles.Shakeekamanagertable2}>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Supplier Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shopOrders.map((order) => (
              <tr key={order._id}>
                <td>{order.itemName}</td>
                <td>{order.quantityOrdered}</td>
                <td>{order.supplierEmail}</td>
                <td>{order.status}</td>
                <td>
                  {order.status === 'Pending' && (
                    <>
                      <button 
                        className={styles.AhamedAccept} 
                        onClick={() => handleAcceptClick(order, 'shop')}
                      >
                        Accept
                      </button>
                      <button 
                        className={styles.AhamedAccept2}  
                        onClick={() => handleDenyClick(order._id, 'shop')}
                      >
                        Deny
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Render the AcceptOrderForm when an order is selected */}
      {selectedOrder && (
        <div className={styles.modalOverlayQ}>
          <AcceptOrderForm
            orderId={selectedOrder._id}
            supplierEmail={selectedOrder.supplierEmail}
            orderType={selectedOrderType}
            onOrderAccepted={() => setSelectedOrder(null)}
            onCancel={() => setSelectedOrder(null)} 
          />
        </div>
      )}

    </div>
  );
};

export default SupplierDashboard;
