import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import TablePagination from '@mui/material/TablePagination';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
}));

const ViewBill = () => {
  const classes = useStyles();
  const [billsData, setBillsData] = useState([]);
  const [searchCriterion, setSearchCriterion] = useState('billId');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [disabledButtons, setDisabledButtons] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBillsData = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        const response = await axios.get('http://localhost:5000/bills/get-bills', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request header
          },
        });
        setBillsData(response.data);
      } catch (error) {
        console.error("There was an error fetching the bills data!", error);
        if (error.response && error.response.status === 401) {
          Swal.fire({
            title: 'Unauthorized',
            text: 'You are not authorized to view this data. Please log in.',
            icon: 'error',
            confirmButtonText: 'Ok',
          }).then(() => {
            navigate('/login'); // Redirect to login if unauthorized
          });
        }
      }
    };

    const savedDisabledButtons = JSON.parse(localStorage.getItem('disabledButtons')) || {};
    setDisabledButtons(savedDisabledButtons);

    fetchBillsData();
  }, [navigate]);

  const handleUpdate = (billId) => {
    navigate(`/admin-welcome/update-bill/${billId}`);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/bills/delete-bill/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBillsData(prevBillsData => prevBillsData.filter(bill => bill._id !== id));
      Swal.fire({
        title: 'Deleted!',
        text: 'The bill has been deleted successfully.',
        icon: 'success',
        confirmButtonText: 'Ok',
      });
    } catch (error) {
      console.error("There was an error deleting the bill!", error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an error deleting the bill.',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
    }
  };

  const handleGenerateBill = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const billResponse = await axios.get(`http://localhost:5000/bills/get-bill/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const billData = billResponse.data;

      const inventoryResponse = await axios.get('http://localhost:5000/inventory/get-inventory-items', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const inventoryData = inventoryResponse.data;

      const inventoryMap = inventoryData.reduce((map, item) => {
        map[item._id] = item;
        return map;
      }, {});

      const insufficientItems = billData.items.filter(item => {
        const inventoryItem = inventoryMap[item.itemId];
        return inventoryItem && inventoryItem.quantity < item.quantity;
      });

      if (insufficientItems.length > 0) {
        Swal.fire({
          title: 'Insufficient Inventory!',
          text: 'There is not enough quantity in the inventory for some items.',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
        return;
      }

      await axios.post(`http://localhost:5000/bills/generate-bill/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDisabledButtons(prevState => {
        const newState = { ...prevState, [id]: true };
        localStorage.setItem('disabledButtons', JSON.stringify(newState));
        return newState;
      });

      Swal.fire({
        title: 'Success!',
        text: 'The bill was generated and inventory was updated successfully.',
        icon: 'success',
        confirmButtonText: 'Ok',
      }).then(() => {
        navigate(`/admin-welcome/bill/${id}`);
      });

    } catch (error) {
      console.error("Error generating bill and updating inventory:", error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an error generating the bill or updating the inventory.',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
    }
  };

  const handleSearchCriterionChange = (event) => {
    setSearchCriterion(event.target.value);
    setSearchQuery('');
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

  const filteredBills = billsData.filter(bill => {
    const query = searchQuery.toLowerCase();
    switch (searchCriterion) {
      case 'billId':
        return bill.billId.toLowerCase().includes(query);
      case 'customerName':
        return bill.customerName.toLowerCase().includes(query);
      case 'customerEmail':
        return bill.customerEmail.toLowerCase().includes(query);
      case 'packageName':
        return bill.packageName.toLowerCase().includes(query);
      case 'createdDate':
        return bill.createdDate.toLowerCase().includes(query);
      default:
        return true;
    }
  });

  // Sort bills in descending order by billId
  const sortedBills = [...filteredBills].sort((a, b) => b.billId.localeCompare(a.billId));

  const paginatedBills = sortedBills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          <Box
            alignItems="center"
            justifyContent="space-between"
            marginTop={"60px"}
            width="100%"
            display="flex"
            flexDirection="row"
          >
            <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center' }}>
              Bills
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
                  <MenuItem value="billId">Bill ID</MenuItem>
                  <MenuItem value="customerName">Customer Name</MenuItem>
                  <MenuItem value="customerEmail">Customer Email</MenuItem>
                  <MenuItem value="packageName">Package Name</MenuItem>
                  <MenuItem value="createdDate">Created Date</MenuItem>
                </Select>
              </FormControl>
              <TextField
                className={classes.searchField}
                variant="outlined"
                placeholder={`Search by ${searchCriterion.replace(/([A-Z])/g, ' $1')}`}
                value={searchQuery}
                onChange={handleSearchQueryChange}
              />
            </Box>
          </Box>

          <TableContainer component={Paper} style={{ maxHeight: '500px', marginTop: '20px' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Bill ID</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Customer Email</TableCell>
                  <TableCell>Package Name</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBills.map((bill, index) => (
                  <TableRow key={bill._id}>
                    <TableCell>{bill.billId}</TableCell>
                    <TableCell>{bill.customerName}</TableCell>
                    <TableCell>{bill.customerEmail}</TableCell>
                    <TableCell>{bill.packageName}</TableCell>
                    <TableCell>{bill.createdDate}</TableCell>

                    <TableCell>
                            <Button variant="contained" color="primary" onClick={() => handleUpdate(bill._id)}>
                                Update
                            </Button>
                        </TableCell>
                    <TableCell>
                            <Button variant="contained" style={{ backgroundColor: 'red', color: 'white' }} onClick={() => handleDelete(bill._id)}>
                                Delete
                            </Button>
                        </TableCell>
                        <TableCell>
                        <Button
                          variant="contained"
                          style={{ backgroundColor: 'lightblue', color: 'black' }}
                          onClick={() => navigate(`/admin-welcome/bill/${bill._id}`)}
                        >
                          View Bill
                        </Button>
                        </TableCell>
                        <TableCell>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleGenerateBill(bill._id)}
                                disabled={disabledButtons[bill._id] || false} // Check if the button should be disabled
                            >
                                Generate Bill
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[8, 10, 25]}
            component="div"
            count={sortedBills.length}
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

export default ViewBill;
