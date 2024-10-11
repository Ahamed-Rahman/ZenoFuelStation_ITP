import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import Sidebar from '../../../components/sidebar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BillAnalysis = () => {
  const [billsData, setBillsData] = useState([]);
  const [searchCriterion, setSearchCriterion] = useState('billId');
  const [searchQuery, setSearchQuery] = useState('');
  const [disabledButtons, setDisabledButtons] = useState({});
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [{
      label: '',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      borderRadius: 5,
    }],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBillsData = async () => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      try {
        const response = await axios.get('http://localhost:5000/bills/get-bills', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
        setBillsData(response.data);
        updateBarChart(response.data);
      } catch (error) {
        console.error("There was an error fetching the bills data!", error);
        if (error.response && error.response.status === 401) {
          // Handle unauthorized access, e.g., redirect to login
          Swal.fire({
            title: 'Unauthorized',
            text: 'Please log in to continue.',
            icon: 'error',
            confirmButtonText: 'Ok',
          }).then(() => {
            navigate('/login'); // Redirect to the login page
          });
        }
      }
    };

    const savedDisabledButtons = JSON.parse(localStorage.getItem('disabledButtons')) || {};
    setDisabledButtons(savedDisabledButtons);
    
    fetchBillsData();
  }, [navigate]);

  const handleGenerateBill = async (billId) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    try {
      setDisabledButtons(prevState => {
        const newState = { ...prevState, [billId]: true };
        localStorage.setItem('disabledButtons', JSON.stringify(newState));
        return newState;
      });

      await axios.post(`http://localhost:5000/bills/generate-bill/${billId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      Swal.fire({
        title: 'Success!',
        text: 'The bill was generated and inventory was updated successfully.',
        icon: 'success',
        confirmButtonText: 'Ok',
      }).then(() => {
        navigate(`/bill/${billId}`);
      });
    } catch (error) {
      console.error("Error generating bill and updating inventory:", error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an error generating the bill and updating inventory.',
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

  const updateBarChart = (bills) => {
    const ranges = [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000];
    const counts = ranges.map(() => 0);
    
    bills.forEach(bill => {
      const price = bill.packagePrice;
      for (let i = 0; i < ranges.length; i++) {
        if (price <= ranges[i]) {
          counts[i]++;
          break;
        }
      }
    });

    const barColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(255, 99, 71, 0.6)',
      'rgba(100, 149, 237, 0.6)',
    ];

    setBarChartData({
      labels: ranges.map(range => `$${range}`),
      datasets: [{
        label: '',
        data: counts,
        backgroundColor: barColors,
        borderColor: barColors.map(color => color.replace('0.6', '1')),
        borderWidth: 2,
        borderRadius: 5,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      }],
    });
  };

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
            justifyContent="center"
            marginTop={"60px"}
            width="100%"
            display="flex"
            flexDirection="row"
            mb={4}
          >
            <Typography variant="h4" gutterBottom style={{ fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center' }}>
              Bill Analysis
            </Typography>
          </Box>

          <Box width="100%" maxWidth="1000px" style={{ padding: '20px' }}>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    bodyColor: '#fff',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += context.parsed.y;
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                      font: {
                        size: 14,
                        weight: 'bold',
                      },
                    },
                    title: {
                      display: true,
                      text: 'Price Range',
                      font: {
                        size: 16,
                        weight: 'bold',
                      },
                      color: 'rgba(0, 0, 0, 0.7)',
                    },
                  },
                  y: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                      font: {
                        size: 14,
                        weight: 'bold',
                      },
                      beginAtZero: true,
                    },
                    title: {
                      display: true,
                      text: 'Number of Bills',
                      font: {
                        size: 16,
                        weight: 'bold',
                      },
                      color: 'rgba(0, 0, 0, 0.7)',
                    },
                  },
                },
              }}
              height={300}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BillAnalysis;
