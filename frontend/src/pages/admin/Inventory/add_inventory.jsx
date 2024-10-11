import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Correct import

import Sidebar from '../../../components/sidebar'; // Adjust the path if needed
import { Box, Typography, TextField, Button } from '@mui/material';

const AddInventory = () => {
  const [itemId, setItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [wholesaleUnitPrice, setWholesaleUnitPrice] = useState('');
  const [valueAddedPrice, setValueAddedPrice] = useState('');
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    if (!itemId) newErrors.itemId = "Item ID is required";
    if (!itemName) newErrors.itemName = "Item name is required";
    if (!quantity || isNaN(quantity)) newErrors.quantity = "Valid quantity is required";
    if (!wholesaleUnitPrice || isNaN(wholesaleUnitPrice)) newErrors.wholesaleUnitPrice = "Valid wholesale unit price is required";
    if (!valueAddedPrice || isNaN(valueAddedPrice)) newErrors.valueAddedPrice = "Valid value added price is required";

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newItem = {
      itemId,
      itemName,
      quantity,
      wholesaleUnitPrice,
      valueAddedPrice,
    };

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Make the POST request with the token in the headers
      await axios.post('http://localhost:5000/inventory/add-inventory-item', newItem, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the headers
        },
      });
      Swal.fire("Success", "New inventory item added successfully!", "success"); // Use Swal instead of swal
      // Reset the form fields after successful submission
      setItemId('');
      setItemName('');
      setQuantity('');
      setWholesaleUnitPrice('');
      setValueAddedPrice('');
      setErrors({});
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        Swal.fire("Error", "Unauthorized. Please log in again.", "error");
      } else {
        Swal.fire("Error", "Something went wrong. Please try again.", "error"); // Use Swal instead of swal
      }
    }
  };

  return (
    <Box>
      <Box display='flex'>
        <Sidebar />
        <Box
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={2}
          style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', flex: 1, margin: '15px' }}
        >
          <Box alignItems="center" justifyContent="center">
            <Typography variant="h4" gutterBottom style={{ fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center', marginTop: '40px' }}>
              Add New Inventory Item
            </Typography>
          </Box>

          <Box display="flex" width="100%">
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              style={{ flex: 1, padding: '20px', margin: '15px' }}
            >
              <Box component="form" width="100%" noValidate autoComplete="off" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Item ID"
                  variant="outlined"
                  value={itemId}
                  onChange={(e) => {
                    setItemId(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, itemId: '' }));
                  }}
                  error={!!errors.itemId}
                  helperText={errors.itemId}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Item Name"
                  variant="outlined"
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, itemName: '' }));
                  }}
                  error={!!errors.itemName}
                  helperText={errors.itemName}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Quantity"
                  variant="outlined"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, quantity: '' }));
                  }}
                  error={!!errors.quantity}
                  helperText={errors.quantity}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Wholesale Unit Price"
                  variant="outlined"
                  type="number"
                  value={wholesaleUnitPrice}
                  onChange={(e) => {
                    setWholesaleUnitPrice(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, wholesaleUnitPrice: '' }));
                  }}
                  error={!!errors.wholesaleUnitPrice}
                  helperText={errors.wholesaleUnitPrice}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Value Added Price"
                  variant="outlined"
                  type="number"
                  value={valueAddedPrice}
                  onChange={(e) => {
                    setValueAddedPrice(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, valueAddedPrice: '' }));
                  }}
                  error={!!errors.valueAddedPrice}
                  helperText={errors.valueAddedPrice}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  style={{ marginTop: 16 }}
                >
                  Add Inventory Item
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddInventory;
