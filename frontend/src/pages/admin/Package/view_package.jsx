import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Typography, TextField, Select, MenuItem, Box, FormControl, InputLabel } from '@mui/material'; 
import TablePagination from '@mui/material/TablePagination';
import Header from '../../../components/navbar'; 
import Sidebar from '../../../components/sidebar'; 

const useStyles = makeStyles((theme) => ({
  searchField: {
    marginBottom: '20px',
    width: '100%', 
    borderRadius: '25px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '25px',
      padding: '5px 10px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '8px 14px',
      fontSize: '14px',
    },
  },
  criteriaSelect: {
    marginRight: '20px', 
    width: '300px',
    borderRadius: '25px',
    marginBottom: '20px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '25px',
      padding: '5px 10px',
    },
    '& .MuiSelect-select': {
      padding: '8px 14px',
      fontSize: '14px',
    },
  },
  packageImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
}));

const ViewPackages = () => {
  const classes = useStyles();
  const [packageData, setPackageData] = useState([]);
  const [searchCriterion, setSearchCriterion] = useState('packageName'); // Default criterion
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackageData = async () => {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      try {
        const response = await axios.get('http://localhost:5000/packages/get-packages', {
          headers: { Authorization: `Bearer ${token}` } // Add the token to the headers
        });
        setPackageData(response.data);
      } catch (error) {
        console.error("There was an error fetching the package data!", error);
        // Optionally, check for 401 status and handle redirection
        if (error.response && error.response.status === 401) {
          navigate('/login'); // Redirect to login if unauthorized
        }
      }
    };

    fetchPackageData();
  }, [navigate]);

  const handleUpdate = (packageId) => {
    navigate(`/admin-welcome/update-package/${packageId}`);
  };

  const handleDelete = async (packageId) => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    try {
      await axios.delete(`http://localhost:5000/packages/delete-package/${packageId}`, {
        headers: { Authorization: `Bearer ${token}` } // Add the token to the headers
      });
      setPackageData(packageData.filter(pkg => pkg._id !== packageId));
    } catch (error) {
      console.error("There was an error deleting the package data!", error);
    }
  };

  const handleSearchCriterionChange = (event) => {
    setSearchCriterion(event.target.value);
    setSearchQuery(''); // Reset search query when criterion changes
  };

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPackages = packageData.filter(pkg => {
    const query = searchQuery.toLowerCase();
    switch (searchCriterion) {
      case 'packageName':
        return pkg.packageName.toLowerCase().includes(query);
      case 'packageDescription':
        return pkg.packageDescription.toLowerCase().includes(query);
      case 'services':
        return pkg.services.some(service => service.toLowerCase().includes(query));
      case 'items':
        return pkg.items.some(item => item.itemName.toLowerCase().includes(query));
      case 'packagePrice':
        return pkg.packagePrice.toString().includes(query);
      default:
        return true;
    }
  });

  const paginatedPackages = filteredPackages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box display="flex">
        <Sidebar />
        <Box
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={2}
          style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', flex: 1, margin: '15px' }}
        >
          {/* Package List Section */}
          <Box
            alignItems="center"
            justifyContent="space-between"
            marginTop={"60px"}
            width="100%"
            display="flex"
            flexDirection="row"
          >
            <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center' }}>
              Packages
            </Typography>

            <Box display="flex" alignItems="center">
              <FormControl variant="outlined" className={classes.criteriaSelect}>
                <InputLabel id="search-criterion-label">Search By</InputLabel>
                <Select
                  labelId="search-criterion-label"
                  value={searchCriterion}
                  onChange={handleSearchCriterionChange}
                  label="Search By"
                >
                  <MenuItem value="packageName">Package Name</MenuItem>
                  <MenuItem value="packageDescription">Description</MenuItem>
                  <MenuItem value="services">Services</MenuItem>
                  <MenuItem value="items">Items</MenuItem>
                  <MenuItem value="packagePrice">Price</MenuItem>
                </Select>
              </FormControl>

              <TextField
                variant="outlined"
                placeholder={`Search by ${searchCriterion.charAt(0).toUpperCase() + searchCriterion.slice(1)}`}
                value={searchQuery}
                onChange={handleSearchQueryChange}
                className={classes.searchField}
              />
            </Box>
          </Box>

          <TableContainer component={Paper} style={{ width: '100%' }}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: '#d4ac0d', color: 'white' }}>
                  <TableCell style={{ color: 'white' }}>Package Name</TableCell>
                  <TableCell style={{ color: 'white' }}>Description</TableCell>
                  <TableCell style={{ color: 'white' }}>Services</TableCell>
                  <TableCell style={{ color: 'white' }}>Items</TableCell>
                  <TableCell style={{ color: 'white' }}>Price</TableCell>
                  <TableCell style={{ color: 'white' }}>Image</TableCell>
                  <TableCell style={{ color: 'white' }}>Update</TableCell>
                  <TableCell style={{ color: 'white' }}>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPackages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell>{pkg.packageName}</TableCell>
                    <TableCell>{pkg.packageDescription}</TableCell>
                    <TableCell>
                      {pkg.services.map((service, index) => (
                        <div key={index}>{service}</div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {pkg.items.map((item, index) => (
                        <div key={index}>
                          {item.itemName} (x{item.quantity})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>{pkg.packagePrice}</TableCell>
                    <TableCell>
                      {pkg.packageImage && (
                        <img src={pkg.packageImage} alt={pkg.packageName} className={classes.packageImage} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleUpdate(pkg._id)}
                      >
                        Update
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleDelete(pkg._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[8, 16, 32]}
            component="div"
            count={filteredPackages.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ViewPackages;
