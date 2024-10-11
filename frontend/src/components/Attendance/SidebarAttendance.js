// frontend/src/components/SidebarLayout.js

import React from 'react';
import { Link } from 'react-router-dom';
import './SidebarAttendance.css'; // Create a CSS file to style the sidebar
import gif from '../../assets/images/inventory-illustration-unscreen.gif'; // Import the GIF


const SidebarAttendance = ({ children }) => {
  return (

    <div className="layout">
      <aside className="sidebar">
        <ul>
        <li><Link to="/admin-welcome/APie">Dashboard</Link></li>
          <li><Link to="/admin-welcome/attendance">Attendance Table</Link></li>
          <li><Link to="/admin-welcome/leaveTable">+ Leave Table</Link></li>
          
          
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

export default SidebarAttendance;
