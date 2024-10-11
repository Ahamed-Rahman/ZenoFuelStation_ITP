import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2'; // Correct import
import { Box, CircularProgress, Typography, TextField, Button } from '@mui/material'; 

import Sidebar from '../../../components/sidebar'; // Adjust the path if needed

const UpdateInventory = () => {
  const { id } = useParams(); // Assuming 'id' is a unique identifier
  const [inventoryData, setInventoryData] = useState({
    itemId: '',
    itemName: '',
    quantity: '',
    wholesaleUnitPrice: '',
    valueAddedPrice: '',
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        const response = await axios.get(`http://localhost:5000/inventory/get-inventory-item/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        });
        setInventoryData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the inventory data!", error);
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [id]);

  const validateFields = () => {
    const newErrors = {};
    if (!inventoryData.itemId) newErrors.itemId = "Item ID is required";
    if (!inventoryData.itemName) newErrors.itemName = "Item name is required";
    if (!inventoryData.quantity || isNaN(inventoryData.quantity)) newErrors.quantity = "Valid quantity is required";
    if (!inventoryData.wholesaleUnitPrice || isNaN(inventoryData.wholesaleUnitPrice)) newErrors.wholesaleUnitPrice = "Valid wholesale unit price is required";
    if (!inventoryData.valueAddedPrice || isNaN(inventoryData.valueAddedPrice)) newErrors.valueAddedPrice = "Valid value added price is required";

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      await axios.put(`http://localhost:5000/inventory/update-inventory-item/${id}`, inventoryData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });
      Swal.fire("Success", "Inventory item updated successfully!", "success"); // Use Swal instead of swal
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong. Please try again.", "error"); // Use Swal instead of swal
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!inventoryData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5">Inventory item not found.</Typography>
      </Box>
    );
  }

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
          <Typography variant="h4" gutterBottom style={{ fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center', marginTop: '35px' }}>
            Update Inventory Item
          </Typography>

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
                  value={inventoryData.itemId}
                  InputProps={{ readOnly: true }}
                  error={!!errors.itemId}
                  helperText={errors.itemId}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Item Name"
                  variant="outlined"
                  value={inventoryData.itemName}
                  onChange={(e) => {
                    setInventoryData({ ...inventoryData, itemName: e.target.value }); // Fix the key to match your state
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
                  value={inventoryData.quantity}
                  onChange={(e) => {
                    setInventoryData({ ...inventoryData, quantity: e.target.value });
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
                  value={inventoryData.wholesaleUnitPrice}
                  onChange={(e) => {
                    setInventoryData({ ...inventoryData, wholesaleUnitPrice: e.target.value });
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
                  value={inventoryData.valueAddedPrice}
                  onChange={(e) => {
                    setInventoryData({ ...inventoryData, valueAddedPrice: e.target.value });
                    setErrors((prevErrors) => ({ ...prevErrors, valueAddedPrice: '' }));
                  }}
                  error={!!errors.valueAddedPrice}
                  helperText={errors.valueAddedPrice}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '20px' }}
                >
                  Update Inventory Item
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateInventory;
