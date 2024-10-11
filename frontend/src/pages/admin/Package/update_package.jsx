import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Swal from 'sweetalert2'; 
import { useParams } from 'react-router-dom';
import { Button, Typography, TextField, Select, MenuItem, Box, IconButton } from '@mui/material'; 
import RemoveIcon from '@mui/icons-material/Remove'; 
import AddIcon from '@mui/icons-material/Add'; 

import Sidebar from '../../../components/sidebar'; 

// Styled component for layout
const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
`;

const UpdatePackage = () => {
  const { id } = useParams(); 
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [services, setServices] = useState(['']);
  const [items, setItems] = useState([{ itemId: '', quantity: '' }]);
  const [itemOptions, setItemOptions] = useState([]);
  const [packagePrice, setPackagePrice] = useState('');
  const [packageImage, setPackageImage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPackageData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5000/packages/get-package/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const packageData = response.data;

        setPackageName(packageData.packageName);
        setPackageDescription(packageData.packageDescription);
        setServices(packageData.services);
        setItems(packageData.items.map(item => ({ itemId: item.itemId, quantity: item.quantity })));
        setPackagePrice(packageData.packagePrice);
        setPackageImage(packageData.packageImage);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Handle unauthorized access (e.g., redirect to login)
          console.error("Unauthorized access - redirecting to login");
          window.location.href = '/login'; // Adjust to your login path
        } else {
          console.error("There was an error fetching the package data!", error);
        }
      }
    };

    const fetchInventoryItems = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/inventory/get-inventory-items', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItemOptions(response.data);
      } catch (error) {
        console.error("There was an error fetching the inventory items!", error);
      }
    };

    fetchPackageData();
    fetchInventoryItems();
  }, [id]);

  const validateFields = () => {
    const newErrors = {};
    if (!packageName) newErrors.packageName = "Package name is required";
    if (!packageDescription) newErrors.packageDescription = "Package description is required";
    if (services.some(service => !service)) newErrors.services = "All included services must be filled";
    if (items.some(item => !item.itemId || !item.quantity)) newErrors.items = "All items and their quantities must be filled";
    if (!packagePrice || isNaN(packagePrice)) newErrors.packagePrice = "Valid package price is required";
    if (!packageImage) newErrors.packageImage = "Package image URL is required";

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedPackage = {
      packageName,
      packageDescription,
      services,
      items: items.map(item => {
        const itemDetails = itemOptions.find(option => option._id === item.itemId);
        return {
          itemName: itemDetails ? itemDetails.itemName : '',
          quantity: item.quantity,
        };
      }),
      packagePrice,
      packageImage,
    };

    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/packages/update-package/${id}`, updatedPackage, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire("Success", "Package updated successfully!", "success"); 
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong. Please try again.", "error"); 
    }
  };

  const handleServiceChange = (index, value) => {
    const newServices = [...services];
    newServices[index] = value;
    setServices(newServices);
    if (value) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.services;
        return newErrors;
      });
    }
  };

  const addService = () => {
    setServices([...services, '']);
  };

  const removeService = (index) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    if (value) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.items;
        return newErrors;
      });
    }
  };

  const addItem = () => {
    setItems([...items, { itemId: '', quantity: '' }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
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
              Update Package
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
                  label="Package Name"
                  variant="outlined"
                  value={packageName}
                  onChange={(e) => {
                    setPackageName(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, packageName: '' }));
                  }}
                  error={!!errors.packageName}
                  helperText={errors.packageName}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Package Description"
                  variant="outlined"
                  value={packageDescription}
                  onChange={(e) => {
                    setPackageDescription(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, packageDescription: '' }));
                  }}
                  error={!!errors.packageDescription}
                  helperText={errors.packageDescription}
                />
                {services.map((service, index) => (
                  <Box key={index} display="flex" alignItems="center" marginBottom="10px">
                    <TextField
                      fullWidth
                      margin="normal"
                      label={`Included Service ${index + 1}`}
                      variant="outlined"
                      value={service}
                      onChange={(e) => handleServiceChange(index, e.target.value)}
                      error={!!errors.services}
                      helperText={errors.services}
                    />
                    <IconButton onClick={() => removeService(index)} disabled={services.length === 1}>
                      <RemoveIcon />
                    </IconButton>
                    {index === services.length - 1 && (
                      <IconButton onClick={addService}>
                        <AddIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {items.map((item, index) => (
                  <Box key={index} display="flex" alignItems="center" marginBottom="10px">
                    <Select
                      fullWidth
                      value={item.itemId}
                      onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Select Item' }}
                      error={!!errors.items}
                      variant="outlined"
                      style={{ marginRight: '15px' }} 
                    >
                      <MenuItem value="" disabled>Select Item</MenuItem>
                      {itemOptions.map((itemOption) => (
                        <MenuItem key={itemOption._id} value={itemOption._id}>{itemOption.itemName}</MenuItem>
                      ))}
                    </Select>
                    <TextField
                      type="number"
                      margin="normal"
                      label="Quantity"
                      variant="outlined"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      error={!!errors.items}
                      helperText={errors.items}
                    />
                    <IconButton onClick={() => removeItem(index)} disabled={items.length === 1}>
                      <RemoveIcon />
                    </IconButton>
                    {index === items.length - 1 && (
                      <IconButton onClick={addItem}>
                        <AddIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Package Price"
                  type="number"
                  variant="outlined"
                  value={packagePrice}
                  onChange={(e) => {
                    setPackagePrice(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, packagePrice: '' }));
                  }}
                  error={!!errors.packagePrice}
                  helperText={errors.packagePrice}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Package Image URL"
                  variant="outlined"
                  value={packageImage}
                  onChange={(e) => {
                    setPackageImage(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, packageImage: '' }));
                  }}
                  error={!!errors.packageImage}
                  helperText={errors.packageImage}
                />
                <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
                  Update Package
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdatePackage;
