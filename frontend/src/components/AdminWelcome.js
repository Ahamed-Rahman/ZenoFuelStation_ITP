import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import '../styles/AdminWelcome.css'; // Make sure the CSS is imported correctly
import topImage from '../assets/images/admin-top-image.jpg'; // Adjust the image path as needed
import staffImg from '../assets/images/staff.png';
import supplierImg from '../assets/images/supplier.png';
import inventoryImg from '../assets/images/inventory.png';
import salesImg from '../assets/images/sales.png';
import attendanceImg from '../assets/images/attendance.png';
import orderImg from '../assets/images/order.png';
import promotionsImg from '../assets/images/promotion.png';
import salaryImg from '../assets/images/salary.png';

const AdminWelcome = () => {
  const navigate = useNavigate(); // Create a navigate function

  // Function to handle block clicks
  const handleNavigation = (path) => {
    navigate(path); // Use navigate to go to the specified path
  };

  return (
    <div className="admin-welcome-page">
      <div className="admin-welcome-container">
        <div className="image-container">
          <img src={topImage} alt="Admin Welcome" className="admin-welcome-image" />
          <div className="welcome-overlay">
            <div className="welcome-text">
              <h2>WELCOME ADMIN</h2>
              <p>
                Welcome to ZENO FUEL STATION, the all-in-one system designed to streamline and optimize every aspect of fuel station management. As an Admin, you have the power to oversee operations, manage staff, and ensure that every process runs smoothly and efficiently.
              </p>
            </div>
          </div>
        </div>
        <div className="blocks-container">
          <div className="block staff" onClick={() => handleNavigation('/admin-welcome/user-management')}>
            <img src={staffImg} alt="Staff" />
            <div className="block-title">Staff</div>
          </div>
          <div className="block supplier" onClick={() => handleNavigation('/admin-welcome/supplier-management')}>
            <img src={supplierImg} alt="Supplier" />
            <div className="block-title">Supplier</div>
          </div>
          <div className="block inventory" onClick={() => handleNavigation('/admin-welcome/inventory-first')}>
            <img src={inventoryImg} alt="Inventory" />
            <div className="block-title">Inventory</div>
          </div>
          <div className="block sales" onClick={() => handleNavigation('/admin-welcome/sales-first')}>
            <img src={salesImg} alt="Sales" />
            <div className="block-title">Sales</div>
          </div>
          <div className="block attendance" onClick={() => handleNavigation('/admin-welcome/attendance')}>
            <img src={attendanceImg} alt="Attendance" />
            <div className="block-title">Attendance</div>
          </div>
          <div className="block order" onClick={() => handleNavigation('/admin-welcome/OrderNav')}>
            <img src={orderImg} alt="Order" />
            <div className="block-title">Order</div>
          </div>
          <div className="block promotions" onClick={() => handleNavigation('/admin-welcome/addPromo')}>
            <img src={promotionsImg} alt="Promotions and Discounts" />
            <div className="block-title">Promotions and Discount</div>
          </div>
          <div className="block salary" onClick={() => handleNavigation('/salary')}>
            <img src={salaryImg} alt="Salary" />
            <div className="block-title">Salary</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWelcome;
