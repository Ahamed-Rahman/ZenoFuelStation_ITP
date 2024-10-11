
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../SalesFirstPage.css';
import fuelImage from '../../assets/images/fuelInventory.png'; // Update with correct path
import shopImage from '../../assets/images/shop.png'; // Update with correct path
import washImage from '../../assets/images/car.png'; // Update with correct path

function SalesFirstPage() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="sales-first-page">
      <h2>Select the Order Type</h2>
      <div
        className="sale-block fuel-sales"
        onClick={() => handleNavigate('/admin-welcome/allOrdersFuel')}
      >
        <div className="sale-content">
          <h3>Fuel Order</h3>
        </div>
        <img src={fuelImage} alt="Fuel-sale" className="sale-image" />
      </div>
      <div
        className="sale-block shop-sales"
        onClick={() => handleNavigate('/admin-welcome/low')}
      >
        <div className="sale-content">
          <h3>Shop Order</h3>
        </div>
        <img src={shopImage} alt="Shop order" className="sale-image" />
      </div>
     
       
    </div>
  );
}

export default SalesFirstPage;
