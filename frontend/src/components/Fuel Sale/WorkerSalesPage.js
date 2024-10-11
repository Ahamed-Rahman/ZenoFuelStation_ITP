import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import jsPDF from 'jspdf';
import './WorkerSalesPage.css';
import logoImage from '../../assets/images/logo.png'; // Import your logo

// Initialize socket connection
const socket = io('http://localhost:5000'); // Connect to your backend WebSocket server

const WorkerSalesPage = () => {
  const [fuelTypes, setFuelTypes] = useState([]);
  const [selectedFuel, setSelectedFuel] = useState('');
  const [litres, setLitres] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showBillForm, setShowBillForm] = useState(false);

  useEffect(() => {
    const fetchFuelTypes = async () => {
      const token = localStorage.getItem('token'); // Get token from local storage
      try {
        const response = await axios.get('http://localhost:5000/api/fuel-sales/inventory-items', {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the headers
          }
        });
        setFuelTypes(response.data);
      } catch (error) {
        console.error('Error fetching fuel types:', error);
        if (error.response && error.response.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You need to log in to access this page.',
          });
        }
      }
    };

    fetchFuelTypes();

    socket.on('inventoryUpdate', (updatedInventory) => {
      setFuelTypes(updatedInventory);
    });

    return () => {
      socket.off('inventoryUpdate');
    };
  }, []);



  const handleFuelChange = async (e) => {
    const fuelType = e.target.value;
    setSelectedFuel(fuelType);
  
    if (fuelType) {
      const token = localStorage.getItem('token'); // Get token from local storage
      try {
        const response = await axios.get(`http://localhost:5000/api/fuel-sales/price/${fuelType}`, {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the headers
          }
        });
  
        if (response.data && response.data.unitPrice) {
          setUnitPrice(Number(response.data.unitPrice)); // Ensure it's a number
        } else {
          console.error('No valid unit price found for this fuel type.');
          setUnitPrice(0);
        }
      } catch (error) {
        console.error('Error fetching fuel price:', error);
        setUnitPrice(0);
      }
    } else {
      setUnitPrice(0);
    }
  };

  const handleSubmitSale = async () => {
    const litresValue = parseFloat(litres);
    const unitPriceValue = parseFloat(unitPrice);
    const calculatedTotalPrice = litresValue * unitPriceValue;

    if (!selectedFuel) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select a fuel type.',
      });
      return;
    }

    if (isNaN(litresValue) || litresValue <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Litres',
        text: 'Please enter a valid number of litres.',
      });
      return;
    }

    if (isNaN(unitPriceValue) || unitPriceValue <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Unit Price',
        text: 'Unit price is not set or is invalid. Please try again.',
      });
      return;
    }

    if (calculatedTotalPrice <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Total Price Error',
        text: 'Total price cannot be zero. Please check your inputs.',
      });
      return;
    }

    const token = localStorage.getItem('token'); // Get token from local storage
    try {
      const response = await axios.post(
        'http://localhost:5000/api/fuel-sales/worker-sales', // Ensure this endpoint is for worker sales
        {
          fuelType: selectedFuel,
          litres: litresValue,
          unitPrice: unitPriceValue,
          totalPrice: calculatedTotalPrice,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // Include the token in the headers
          },
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Sale Recorded',
        text: 'Fuel sale recorded successfully!',
      }).then(() => {
        setTotalPrice(calculatedTotalPrice);
        setShowBillForm(true);
        setSelectedFuel(selectedFuel);
        setLitres(litresValue);
        setUnitPrice(unitPriceValue);
      });
    } catch (error) {
      console.error('Error recording sale:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to record the sale.',
      });
      if (error.response && error.response.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'You need to log in to perform this action.',
        });
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add the logo image at the top-left corner
    const logo = new Image();
    logo.src = logoImage;
    doc.addImage(logo, 'PNG', 10, 10, 30, 30); // Adjust logo position and size

    // Add a title below the logo
    doc.setFontSize(20);
    doc.text("Zeno Fuel Station", 105, 45, null, null, "center"); // Center the title
    doc.setFontSize(14);
    doc.text("Bill Summary", 105, 55, null, null, "center"); // Center the bill heading

    // Draw a rectangle for the bill box
    const margin = 20;
    const boxWidth = 170;
    const boxHeight = 100;
    const startX = (doc.internal.pageSize.width - boxWidth) / 2;
    const startY = 65;

    doc.setDrawColor(0); // Set border color
    doc.setFillColor(240, 240, 240); // Light grey fill
    doc.rect(startX, startY, boxWidth, boxHeight, 'F'); // Fill rectangle
    doc.setLineWidth(1);
    doc.rect(startX, startY, boxWidth, boxHeight); // Draw border

    // Set font size for the details
    doc.setFontSize(14);

    // Add details inside the box
    doc.text(`Fuel Type: ${selectedFuel || 'N/A'}`, 105, startY + 20, null, null, "center");
    doc.text(`Quantity: ${litres || 'N/A'} litres`, 105, startY + 40, null, null, "center");
    doc.text(`Unit Price: $${unitPrice.toFixed(2) || '0.00'}`, 105, startY + 60, null, null, "center");
    doc.text(`Total Price: $${totalPrice.toFixed(2) || '0.00'}`, 105, startY + 80, null, null, "center");

    // Add contact information at the bottom
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("For more information, contact us at: info@zenofuelstation.com", 105, startY + 95, null, null, "center");

    // Save the PDF
    doc.save("bill.pdf");
};


  return (
    <div className='bg'>
    <div className="worker-sales-page">
      <h1>Worker Fuel Sales</h1>
      {!showBillForm ? (
        <form>
          <label>
            Fuel Type:
            <select value={selectedFuel} onChange={handleFuelChange}>
              <option value="">Select Fuel Type</option>
              {fuelTypes.map(fuel => (
                <option key={fuel.itemName} value={fuel.itemName}>
                  {fuel.itemName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Litres:
            <input
              type="number"
              value={litres}
              onChange={(e) => setLitres(e.target.value)}
              min="0"
            />
          </label>
          <button type="button" className="DinukaSubmitWorker" onClick={handleSubmitSale}>Submit Sale</button>
        </form>
      ) : (
        <div className="bill-summary">
          <h2>Bill</h2>
          <p>Fuel Type: {selectedFuel || 'N/A'}</p>
          <p>Quantity: {litres || 'N/A'} litres</p>
          <p>Unit Price: ${unitPrice.toFixed(2) || '0.00'}</p>
          <p>Total Price: ${totalPrice.toFixed(2) || '0.00'}</p>
          <button className="DinukaSubmitWorker" onClick={generatePDF}>Generate Bill</button>
        </div>
      )}
    </div>
    </div>
  );
};

export default WorkerSalesPage;
