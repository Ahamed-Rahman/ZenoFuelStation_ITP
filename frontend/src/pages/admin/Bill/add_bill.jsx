import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, TextField, Select, MenuItem, Box, IconButton } from '@mui/material'; 
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';

import Sidebar from '../../../components/sidebar'; 

// Styled component for layout
const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const AddBill = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [items, setItems] = useState([]);
  const [extraServices, setExtraServices] = useState([{ serviceName: '', servicePrice: '' }]);
  const [errors, setErrors] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [billId, setBillId] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        const response = await axios.get('http://localhost:5000/packages/get-packages', {
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the headers
          }
        });
        setPackages(response.data);
      } catch (error) {
        console.error("There was an error fetching the packages!", error);
      }
    };

    fetchPackages();

    const lastBillId = localStorage.getItem('lastBillId');
    const nextBillId = lastBillId ? parseInt(lastBillId, 10) + 1 : 1;
    setBillId(nextBillId);
  }, []);

  const validateFields = () => {
    const newErrors = {};
    if (!selectedPackage) newErrors.selectedPackage = "Package selection is required";
    if (!customerName) newErrors.customerName = "Customer name is required";
    if (!customerEmail) newErrors.customerEmail = "Customer email is required";
    if (extraServices.some(service => !service.serviceName || !service.servicePrice)) {
      newErrors.extraServices = "All extra services and their prices must be filled";
    }
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedPackageName = packages.find(pkg => pkg._id === selectedPackage)?.packageName;

    const newBill = {
      billId,
      customerName,
      customerEmail,
      packageName: selectedPackageName,
      packagePrice: parseFloat(packagePrice),
      extraServices,
      items,
      createdDate: new Date().toISOString().split('T')[0],
    };

    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      await axios.post('http://localhost:5000/bills/add-bill', newBill, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the headers
        }
      });
      Swal.fire({
        title: "Success",
        text: "New bill added successfully!",
        icon: "success",
      }).then(() => {
        navigate('/admin-welcome/view-bills');
      });

      localStorage.setItem('lastBillId', billId);

      setSelectedPackage('');
      setPackagePrice('');
      setItems([]);
      setExtraServices([{ serviceName: '', servicePrice: '' }]);
      setCustomerName('');
      setCustomerEmail('');
      setErrors({});
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again.",
        icon: "error",
      });
    }
  };

  const handlePackageChange = (event) => {
    const pkgId = event.target.value;
    setSelectedPackage(pkgId);

    const pkg = packages.find(pkg => pkg._id === pkgId);
    if (pkg) {
      setPackagePrice(pkg.packagePrice);
      setItems(pkg.items || []);
    } else {
      setPackagePrice('');
      setItems([]);
    }
    
    setErrors(prevErrors => ({ ...prevErrors, selectedPackage: '' }));
  };

  const handleServiceChange = (index, field, value) => {
    const newExtraServices = [...extraServices];
    if (field === 'servicePrice') {
      newExtraServices[index][field] = value ? parseFloat(value) : '';
    } else {
      newExtraServices[index][field] = value;
    }
    setExtraServices(newExtraServices);
    if (value) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.extraServices;
        return newErrors;
      });
    }
  };

  const addService = () => {
    setExtraServices([...extraServices, { serviceName: '', servicePrice: '' }]);
  };

  const removeService = (index) => {
    const newExtraServices = extraServices.filter((_, i) => i !== index);
    setExtraServices(newExtraServices);
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
              Add New Bill
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
                  label="Customer Name"
                  variant="outlined"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, customerName: '' }));
                  }}
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Customer Email"
                  variant="outlined"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, customerEmail: '' }));
                  }}
                  error={!!errors.customerEmail}
                  helperText={errors.customerEmail}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Bill ID"
                  variant="outlined"
                  value={billId}
                  disabled
                />

                <Select
                  fullWidth
                  margin="normal"
                  value={selectedPackage}
                  onChange={handlePackageChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Select Package' }}
                  error={!!errors.selectedPackage}
                  variant="outlined"
                >
                  <MenuItem value="" disabled>Select Package</MenuItem>
                  {packages.map(pkg => (
                    <MenuItem key={pkg._id} value={pkg._id}>{pkg.packageName}</MenuItem>
                  ))}
                </Select>
                {errors.selectedPackage && <Typography color="error">{errors.selectedPackage}</Typography>}

                <TextField
                  fullWidth
                  margin="normal"
                  label="Package Price"
                  variant="outlined"
                  value={packagePrice}
                  InputProps={{
                    readOnly: true,
                  }}
                />

                {items.map((item, index) => (
                  <Box key={index} display="flex" alignItems="center" marginBottom="10px">
                    <TextField
                      fullWidth
                      margin="normal"
                      label={`Item ${index + 1}`}
                      variant="outlined"
                      value={item.itemName}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Item Quantity"
                      variant="outlined"
                      value={item.quantity} // Display quantity instead of price
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Box>
                ))}

                {extraServices.map((service, index) => (
                  <Box key={index} display="flex" alignItems="center" marginBottom="10px">
                    <TextField
                      fullWidth
                      margin="normal"
                      label={`Service Name ${index + 1}`}
                      variant="outlined"
                      value={service.serviceName}
                      onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                      error={!!errors.extraServices}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Service Price"
                      variant="outlined"
                      type="number"
                      value={service.servicePrice}
                      onChange={(e) => handleServiceChange(index, 'servicePrice', e.target.value)}
                      error={!!errors.extraServices}
                    />
                    <IconButton onClick={() => removeService(index)}>
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button onClick={addService} variant="outlined" color="primary" startIcon={<AddIcon />}>
                  Add Extra Service
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '20px' }}
                >
                  Add Bill
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddBill;
