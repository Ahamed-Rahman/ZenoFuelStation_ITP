import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Box, Typography, CircularProgress, IconButton, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';
import Swal from 'sweetalert2';

import Sidebar from '../../../components/sidebar';

const UpdateBill = () => {
  const { id } = useParams(); // Assuming 'billId' is a unique identifier
  const [billData, setBillData] = useState({
    customerName: '',
    customerEmail: '',
    packageName: '',
    packagePrice: '',
    extraServices: [{ serviceName: '', servicePrice: '' }],
    items: []
  });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchBillData = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await axios.get(`http://localhost:5000/bills/get-bill/${id}`, {
          headers: { Authorization: `Bearer ${token}` } // Include token in headers
        });
        setBillData({
          customerName: response.data.customerName,
          customerEmail: response.data.customerEmail,
          packageName: response.data.packageId,
          packagePrice: response.data.packagePrice,
          extraServices: response.data.extraServices,
          items: response.data.items
        });
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the bill data!", error);
        setLoading(false);
      }
    };

    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await axios.get('http://localhost:5000/packages/get-packages', {
          headers: { Authorization: `Bearer ${token}` } // Include token in headers
        });
        setPackages(response.data);
      } catch (error) {
        console.error("There was an error fetching the packages!", error);
      }
    };

    fetchBillData();
    fetchPackages();
  }, [id]);

  const validateFields = () => {
    const newErrors = {};
    if (!billData.packageName) newErrors.packageName = "Package selection is required";
    if (!billData.customerName) newErrors.customerName = "Customer name is required";
    if (!billData.customerEmail) newErrors.customerEmail = "Customer email is required";
    if (billData.extraServices.some(service => !service.serviceName || !service.servicePrice)) newErrors.extraServices = "All extra services and their prices must be filled";

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedPackageName = packages.find(pkg => pkg._id === billData.packageName)?.packageName;

    const updatedBill = {
      id,
      customerName: billData.customerName,
      customerEmail: billData.customerEmail,
      packageName: selectedPackageName,
      packagePrice: billData.packagePrice,
      extraServices: billData.extraServices,
      items: billData.items,
      updatedDate: new Date().toISOString().split('T')[0], // Automatically set today's date
    };

    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      await axios.put(`http://localhost:5000/bills/update-bill/${id}`, updatedBill, {
        headers: { Authorization: `Bearer ${token}` } // Include token in headers
      });
      Swal.fire("Success", "Bill updated successfully!", "success");

      setErrors({});
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
    }
  };

  const handlePackageChange = (event) => {
    const pkgId = event.target.value;
    const pkg = packages.find(pkg => pkg._id === pkgId);
    if (pkg) {
      setBillData(prevState => ({
        ...prevState,
        packageName: pkgId,
        packagePrice: pkg.packagePrice,
        items: pkg.items || []
      }));
    } else {
      setBillData(prevState => ({
        ...prevState,
        packageName: '',
        packagePrice: '',
        items: []
      }));
    }
    
    setErrors(prevErrors => ({ ...prevErrors, packageName: '' }));
  };

  const handleServiceChange = (index, field, value) => {
    const newExtraServices = [...billData.extraServices];
    newExtraServices[index][field] = value;
    setBillData(prevState => ({ ...prevState, extraServices: newExtraServices }));
    if (value) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.extraServices;
        return newErrors;
      });
    }
  };

  const addService = () => {
    setBillData(prevState => ({
      ...prevState,
      extraServices: [...prevState.extraServices, { serviceName: '', servicePrice: '' }]
    }));
  };

  const removeService = (index) => {
    const newExtraServices = billData.extraServices.filter((_, i) => i !== index);
    setBillData(prevState => ({ ...prevState, extraServices: newExtraServices }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!billData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5">Bill not found.</Typography>
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
          <Box alignItems="center" justifyContent="center">
            <Typography variant="h4" gutterBottom style={{ fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center', marginTop: '40px' }}>
              Update Bill
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
                  value={billData.customerName}
                  onChange={(e) => {
                    setBillData(prevState => ({ ...prevState, customerName: e.target.value }));
                    setErrors(prevErrors => ({ ...prevErrors, customerName: '' }));
                  }}
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Customer Email"
                  variant="outlined"
                  value={billData.customerEmail}
                  onChange={(e) => {
                    setBillData(prevState => ({ ...prevState, customerEmail: e.target.value }));
                    setErrors(prevErrors => ({ ...prevErrors, customerEmail: '' }));
                  }}
                  error={!!errors.customerEmail}
                  helperText={errors.customerEmail}
                />

                <Select
                  fullWidth
                  margin="normal"
                  value={billData.packageName}
                  onChange={handlePackageChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Select Package' }}
                  error={!!errors.packageName}
                  variant="outlined"
                >
                  <MenuItem value="" disabled>Select Package</MenuItem>
                  {packages.map(pkg => (
                    <MenuItem key={pkg._id} value={pkg._id}>{pkg.packageName}</MenuItem>
                  ))}
                </Select>
                {errors.packageName && <Typography color="error">{errors.packageName}</Typography>}

                <TextField
                  fullWidth
                  margin="normal"
                  label="Package Price"
                  variant="outlined"
                  value={billData.packagePrice}
                  InputProps={{
                    readOnly: true,
                  }}
                />

                {billData.items.map((item, index) => (
                  <Box key={index} display="flex" alignItems="center" marginBottom="10px">
                    <TextField
                      fullWidth
                      margin="normal"
                      label={`Item ${index + 1}`}
                      variant="outlined"
                      value={item.name}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Box>
                ))}

                {billData.extraServices.map((service, index) => (
                  <Box key={index} display="flex" alignItems="center" marginBottom="10px">
                    <TextField
                      label="Service Name"
                      variant="outlined"
                      value={service.serviceName}
                      onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                      error={!!errors.extraServices}
                      helperText={errors.extraServices}
                    />
                    <TextField
                      label="Service Price"
                      variant="outlined"
                      value={service.servicePrice}
                      onChange={(e) => handleServiceChange(index, 'servicePrice', e.target.value)}
                      error={!!errors.extraServices}
                      helperText={errors.extraServices}
                    />
                    <IconButton onClick={() => removeService(index)} color="error">
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  onClick={addService}
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                >
                  Add Extra Service
                </Button>

                <Box display="flex" justifyContent="flex-end" marginTop="20px">
                  <Button type="submit" variant="contained" color="primary">Update Bill</Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateBill;
