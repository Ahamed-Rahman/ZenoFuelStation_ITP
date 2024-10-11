import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InventoryFirstPage.css';
import fuelImage from '../../assets/images/fuelInventory.png'; // Update with correct path
import shopImage from '../../assets/images/shop.png'; // Update with correct path
import washImage from '../../assets/images/car.png'; // Update with correct path

function InventoryFirstPage() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="inventory-first-page">
      <h2>Select the Inventory Type</h2>
      <div
        className="inventory-block fuel-inventory"
        onClick={() => handleNavigate('/admin-welcome/dashboard')}
      >
        <div className="inventory-content">
          <h3>Fuel Inventory</h3>
        </div>
        <img src={fuelImage} alt="Fuel Inventory" className="inventory-image" />
      </div>
      <div
        className="inventory-block shop-inventory"
        onClick={() => handleNavigate('/admin-welcome/dashboardS')}
      >
        <div className="inventory-content">
          <h3>Shop Inventory</h3>
        </div>
        <img src={shopImage} alt="Shop Inventory" className="inventory-image" />
      </div>
    
    </div>
  );
}

export default InventoryFirstPage;
