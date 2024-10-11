import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Typography, TextField, Select, MenuItem, Box } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import Sidebar from '../../../components/sidebar'; // Adjust the path if needed

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

const AddPackage = () => {
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [services, setServices] = useState(['']);
  const [items, setItems] = useState([{ itemId: '', quantity: '' }]);
  const [itemOptions, setItemOptions] = useState([]);
  const [packagePrice, setPackagePrice] = useState('');
  const [packageImage, setPackageImage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token
        const response = await axios.get('http://localhost:5000/inventory/get-inventory-items', {
          headers: { Authorization: `Bearer ${token}` }, // Include the token in the request header
        });
        setItemOptions(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Redirect to login if unauthorized
          Swal.fire("Error", "Unauthorized! Please log in again.", "error");
          navigate('/login');
        } else {
          console.error("There was an error fetching the inventory items!", error);
        }
      }
    };

    fetchInventoryItems();
  }, [navigate]);

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

    // Transform items to use itemName
    const newPackage = {
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

    try {
      const token = localStorage.getItem('token'); // Retrieve the token for the post request
      await axios.post('http://localhost:5000/packages/add-package', newPackage, {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the request header
      });
      Swal.fire("Success", "New package added successfully!", "success");
      // Reset the form fields after successful submission
      setPackageName('');
      setPackageDescription('');
      setServices(['']);
      setItems([{ itemId: '', quantity: '' }]);
      setPackagePrice('');
      setPackageImage('');
      setErrors({});
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Redirect to login if unauthorized
        Swal.fire("Error", "Unauthorized! Please log in again.", "error");
        navigate('/login');
      } else {
        console.error(error);
        Swal.fire("Error", "Something went wrong. Please try again.", "error");
      }
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
              Add New Package
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
                      renderValue={(value) => value ? itemOptions.find(option => option._id === value)?.itemName : 'Select Item'}
                    >
                      <MenuItem value="" disabled>Select Item</MenuItem>
                      {itemOptions.map(option => (
                        <MenuItem key={option._id} value={option._id}>{option.itemName}</MenuItem>
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
                  variant="outlined"
                  type="number"
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
                <Button variant="contained" color="primary" type="submit">
                  Add Package
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddPackage;
