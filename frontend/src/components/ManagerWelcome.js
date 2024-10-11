import React from 'react';
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

const ManagerWelcome = () => {
  return (
    <div className="admin-welcome-page">
      <div className="admin-welcome-container">
        <div className="image-container">
          <img src={topImage} alt="Admin Welcome" className="admin-welcome-image" />
          <div className="welcome-overlay">
            <div className="welcome-text">
              <h2>WELCOME MANAGER</h2>
              <p>
                Welcome to ZENO FUEL STATION, the all-in-one system designed to streamline and optimize every aspect of fuel station management. As a Manager, you have the power to oversee operations, manage staff, and ensure that every process runs smoothly and efficiently.
              </p>
            </div>
          </div>
        </div>
        <div className="blocks-container">
          <div className="block staff">
            <img src={staffImg} alt="Staff" />
            <div className="block-title">Staff</div>
          </div>
          <div className="block supplier">
            <img src={supplierImg} alt="Supplier" />
            <div className="block-title">Supplier</div>
          </div>
          <div className="block inventory">
            <img src={inventoryImg} alt="Inventory" />
            <div className="block-title">Inventory</div>
          </div>
          <div className="block sales">
            <img src={salesImg} alt="Sales" />
            <div className="block-title">Sales</div>
          </div>
          <div className="block attendance">
            <img src={attendanceImg} alt="Attendance" />
            <div className="block-title">Attendance</div>
          </div>
          <div className="block order">
            <img src={orderImg} alt="Order" />
            <div className="block-title">Order</div>
          </div>
          <div className="block promotions">
            <img src={promotionsImg} alt="Promotions and Discounts" />
            <div className="block-title">Promotions and Discount</div>
          </div>
          <div className="block salary">
            <img src={salaryImg} alt="Salary" />
            <div className="block-title">Salary</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerWelcome;