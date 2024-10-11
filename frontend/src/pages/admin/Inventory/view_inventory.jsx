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
import { Button, Typography, Box } from '@mui/material'; 
import TablePagination from '@mui/material/TablePagination'; 

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

const ViewInventory = () => {
  const classes = useStyles();
  const [inventoryData, setInventoryData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        const response = await axios.get('http://localhost:5000/inventory/get-inventory-items', {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the request header
          }
        });
        setInventoryData(response.data);
      } catch (error) {
        console.error("There was an error fetching the inventory data!", error);
        if (error.response && error.response.status === 401) {
          alert("Unauthorized! Please log in again."); // You can handle this better in your app
          // Optionally redirect to login page
          navigate('/login'); // Adjust the route as needed
        }
      }
    };

    fetchInventoryData();
  }, [navigate]);

  const handleUpdate = (itemId) => {
    navigate(`/admin-welcome/update-inventory/${itemId}`);
  };

  const handleDelete = async (itemId) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      await axios.delete(`http://localhost:5000/inventory/delete-inventory-item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}` // Include the token in the request header
        }
      });
      setInventoryData(inventoryData.filter(inv => inv._id !== itemId));
    } catch (error) {
      console.error("There was an error deleting the inventory item!", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedInventory = inventoryData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              Inventory
            </Typography>
          </Box>

          <TableContainer component={Paper} style={{ width: '100%' }}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: '#d4ac0d', color: 'white' }}>
                  <TableCell style={{ color: 'white' }}>Item ID</TableCell>
                  <TableCell style={{ color: 'white' }}>Item Name</TableCell>
                  <TableCell style={{ color: 'white' }}>Quantity</TableCell>
                  <TableCell style={{ color: 'white' }}>Wholesale Price</TableCell>
                  <TableCell style={{ color: 'white' }}>Value Added Price</TableCell>
                  <TableCell style={{ color: 'white' }}>Update</TableCell>
                  <TableCell style={{ color: 'white' }}>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInventory.map((inv) => (
                  <TableRow key={inv.itemId}>
                    <TableCell>{inv.itemId}</TableCell>
                    <TableCell>{inv.itemName}</TableCell>
                    <TableCell>{inv.quantity}</TableCell>
                    <TableCell>{inv.wholesaleUnitPrice}</TableCell>
                    <TableCell>{inv.valueAddedPrice}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleUpdate(inv._id)}
                      >
                        Update
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleDelete(inv._id)}
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
            rowsPerPageOptions={[8, 25, 50]}
            component="div"
            count={inventoryData.length}
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

export default ViewInventory;
