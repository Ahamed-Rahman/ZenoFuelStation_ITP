// frontend/src/components/SidebarLayout.js

import React from 'react';
import { Link } from 'react-router-dom';
import './SidebarLayout.css'; // Create a CSS file to style the sidebar
import gif from '../../assets/images/inventory-illustration-unscreen.gif'; // Import the GIF


const SidebarLayout = ({ children }) => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <ul>
          <li><Link to="/admin-welcome/dashboard">Dashboard</Link></li>
          <li><Link to="/admin-welcome/add-item">+ Add Item</Link></li>
          <li><Link to="/admin-welcome/fuel-inventory"> Inventory Management</Link></li>
          <li><Link to="/admin-welcome/ReceivedOrder">Received orders for inventory</Link></li>
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

export default SidebarLayout;
