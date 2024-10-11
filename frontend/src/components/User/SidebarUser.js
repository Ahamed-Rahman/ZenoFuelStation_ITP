// frontend/src/components/SidebarLayout.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SidebarUser.css'; // Ensure the correct path to CSS
import gif from '../../assets/images/inventory-illustration-unscreen.gif'; // Import the GIF

const SidebarLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleCreateUserClick = () => {
    navigate('/admin-welcome/user-management?create=true'); // Directly navigate with query param
  };

  const handleAddSupplierClick = () => {
    navigate('/admin-welcome/supplier-management?add=true'); // Directly navigate with query param
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <ul>
          <li><Link to="/admin-welcome/Charts">Dashboard</Link></li>
         
          <li><Link to="/admin-welcome/user-management">User Management</Link></li>
          <li><button onClick={handleCreateUserClick}>+ Create User</button></li>
          <li><Link to="/admin-welcome/UserTable">User Details</Link></li>

        </ul>
        <hr className="separator-line" /> {/* Separator line */}
        <ul>
          <li><Link to="/admin-welcome/supplier-management">Supplier Management</Link></li>
          <li><button onClick={handleAddSupplierClick}>+ Add Supplier</button></li>
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
