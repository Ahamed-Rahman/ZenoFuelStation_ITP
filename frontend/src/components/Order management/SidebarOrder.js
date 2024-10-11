// frontend/src/components/SidebarLayout.js

import React from 'react';
import { Link } from 'react-router-dom';
import './SidebarOrder.css'; // Create a CSS file to style the sidebar
import gif from '../../assets/images/inventory-illustration-unscreen.gif'; // Import the GIF


const SidebarOrder = ({ children }) => {
  return (

    <div className="layout">
      <aside className="sidebar">
        <ul>
          <li><Link to="/admin-welcome/OrderBar">Dashboard</Link></li>
          <li><Link to="/admin-welcome/allOrders">All Orders</Link></li>
          <li><Link to="/admin-welcome/low">+ Low stock order</Link></li>
          <li><Link to="/admin-welcome/NeworderShop">+ New item order</Link></li>
          
        </ul>
        <div className="sidebar-gif">
          <img src={gif} alt="Sidebar GIF" />
        </div>

      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default SidebarOrder;
