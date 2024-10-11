// frontend/src/components/SidebarLayout.js

import React from 'react';
import { Link } from 'react-router-dom';
import './SidebarLayoutFuel.css'; // Create a CSS file to style the sidebar
import gif from '../../assets/images/inventory-illustration-unscreen.gif'; // Import the GIF


const SidebarLayoutFuelManager = ({ children }) => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <ul>
          <li><Link to="/manager-welcome/MFS">Fuel Sales</Link></li>
          <li><Link to="/manager-welcome/ManSale">Shop Sales</Link></li>
         
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

export default SidebarLayoutFuelManager;
