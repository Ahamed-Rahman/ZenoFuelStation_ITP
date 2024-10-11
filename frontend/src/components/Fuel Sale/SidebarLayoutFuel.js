// frontend/src/components/SidebarLayout.js

import React from 'react';
import { Link } from 'react-router-dom';
import './SidebarLayoutFuel.css'; // Create a CSS file to style the sidebar
import gif from '../../assets/images/inventory-illustration-unscreen.gif'; // Import the GIF


const SidebarLayout = ({ children }) => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <ul>
          <li><Link to="/admin-welcome/price-records">Dashboard</Link></li>
          <li><Link to="/admin-welcome/fuel-sale">+ Add Price</Link></li>
          <li><Link to="/admin-welcome/fuel-sales-records">Sales record</Link></li>
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
