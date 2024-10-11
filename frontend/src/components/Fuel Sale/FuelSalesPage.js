import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import styles from './FuelSalesPage.module.css';
import SidebarLayoutFuel from './SidebarLayoutFuel'

const AdminFuelSalesPage = () => {
  const [fuelTypes, setFuelTypes] = useState([]);
  const [selectedFuel, setSelectedFuel] = useState('');
  const [litres, setLitres] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFuelTypes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fuel-inventory', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token in headers
          }
        });
        setFuelTypes(response.data);
      } catch (error) {
        console.error('Error fetching fuel types:', error);
      }
    };
    fetchFuelTypes();
  }, []);

  const handleFuelChange = (e) => {
    setSelectedFuel(e.target.value);
  };

  const handleCalculate = () => {
    if (unitPrice > 0 && litres > 0) {
      setTotalPrice(litres * unitPrice);  // Calculate the total price
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter valid litres and unit price.',
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFuel || unitPrice <= 0 || litres <= 0 || totalPrice <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please complete all fields and calculate the total price.',
      });
      return;
    }

    try {
      // Send data to the backend
      await axios.post('http://localhost:5000/api/fuel-sales/admin-sales', {
        fuelType: selectedFuel,
        unitPrice: parseFloat(unitPrice),
        litres: parseFloat(litres),
        totalPrice: parseFloat(totalPrice),
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token in headers
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Fuel sale recorded successfully!',
      });

      // Reset form after submission
      setSelectedFuel('');
      setLitres('');
      setUnitPrice('');
      setTotalPrice('');
    } catch (error) {
      console.error('Error saving record:', error);

      // Check for specific error message
      if (error.response && error.response.data.message === 'Item already exists') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Item already exists.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to record fuel sale.',
        });
      }
    }
  };


  const handleViewRecords = () => {
    navigate('/admin-welcome/price-records');  // Navigate to the records page
  };

  return (
    <SidebarLayoutFuel>
    <div className={styles.DinukacontainerPage}>
    <div className={styles.DinukabackgroundPage}></div>
    <div className={styles.DinukafuelSalesMainpage}>
      <div className={styles.DinukafuelSalesPage}>
      <h1 className="NameHii">Admin Fuel Sales - Set Prices</h1>
        <form onSubmit={handleSubmit}>
          
          <label>
           <div className={styles.DinukaSelect}>
            Fuel Type:
            <select value={selectedFuel} onChange={handleFuelChange}>
              <option value="">Select Fuel Type</option>
              {fuelTypes.map(fuel => (
                <option key={fuel.itemName} value={fuel.itemName}>
                  {fuel.itemName}
                </option>
              ))}
            </select>
            </div> 
          </label>
         
          
          <label>
          <div className={styles.DinukaInput}>
            Unit Price:
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              min="0"
            />
            </div>
          </label>

          <label>
            <div className={styles.DinukaNumber}>
            Quantity (Litres):
            <input
              type="number"
              value={litres}
              onChange={(e) => setLitres(e.target.value)}
              min="0"
            />
            </div>
          </label>

          <label>
          <div className={styles.DinukaPrice}>
            Total Price:
            <input
              type="number"
              value={totalPrice}
              readOnly
            />
            </div>
          </label>
          
          <div className={styles.DinukaBtn}>
          <button type="button" onClick={handleCalculate}>Calculate Total Price</button>
          
          <button type="submit">Set Price</button>
          </div>
        </form>
      </div>
      <button className={styles.DinukaViewRecordsBtn} onClick={handleViewRecords}>View Records</button>
    </div>
    </div>
    </SidebarLayoutFuel>
    
  );
}

export default AdminFuelSalesPage;
