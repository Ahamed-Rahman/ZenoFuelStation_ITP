import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Sidebar from '../../../components/sidebar';
import Swal from 'sweetalert2';

const BillPage = () => {
  const { billId } = useParams(); // Extract billId from the route parameters
  const [bill, setBill] = useState(null); // State to hold the bill details
  const [packagePrice, setPackagePrice] = useState(0); // State to hold the package price

  useEffect(() => {
    if (!billId) {
      console.error("Bill ID is undefined");
      return;
    }
    console.log("Bill ID from route:", billId);

    // Fetch the bill details from the backend using the object ID
    const fetchBill = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`http://localhost:5000/bills/get-bill/${billId}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Include the token in the headers
          }
        });
        setBill(response.data);

        // Fetch package details to get the package price
        const packageResponse = await axios.get(`http://localhost:5000/packages/get-package/${response.data.packageId}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Include the token in the headers
          }
        });
        setPackagePrice(packageResponse.data.price);
      } catch (error) {
        console.error("There was an error fetching the bill or package details!", error);
        // Handle 401 error
        if (error.response && error.response.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You are not authorized to view this bill. Please log in again.',
            confirmButtonText: 'OK',
          });
        }
      }
    };

    fetchBill();
  }, [billId]); // Dependency array to trigger the effect when billId changes

  if (!bill || packagePrice === null) {
    return <Typography variant="h6">Loading bill details...</Typography>;
  }

  // Calculate the total price based on the package price and extra services
  const calculateTotalPrice = () => {
    const extraServicesTotal = bill.extraServices.reduce((acc, service) => acc + parseFloat(service.servicePrice), 0);
    return (parseFloat(bill.packagePrice) + extraServicesTotal).toFixed(2);
  };

  // Function to generate and download the bill as a PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('WASH STATION BILL', 14, 22);
    
    // Add a table with bill details
    doc.autoTable({
      startY: 30,
      head: [['Field', 'Value']],
      body: [
        ['Bill ID', bill.billId],
        ['Date', new Date(bill.createdDate).toLocaleDateString()],
        ['Customer Name', bill.customerName],
        ['Customer Email', bill.customerEmail],
        ['Package Name', bill.packageName],
        ['Package Price', `$${bill.packagePrice.toFixed(2)}`],
        ...bill.extraServices.map((service, index) => [
          `Extra Service ${index + 1}`,
          `${service.serviceName} - $${service.servicePrice.toFixed(2)}`,
        ]),
        ['Total Price', `$${calculateTotalPrice()}`],
      ],
    });

    doc.text('Thank you for using our services!', 14, doc.autoTable.previous.finalY + 20);
    doc.save(`Bill_${bill.billId}.pdf`);
  };

  // Function to send the bill via email
  const handleSendEmail = async () => {
    try {
      // Ensure that bill._id and bill.customerEmail are correctly defined
      if (!bill._id || !bill.customerEmail) {
        throw new Error('Bill ID or customer email is missing');
      }

      // Get the token from localStorage
      const token = localStorage.getItem('token');

      await axios.post('http://localhost:5000/bills/send-bill-email', {
        billId: bill._id, // Ensure the correct _id is being passed
        customerEmail: bill.customerEmail,
        billDetails: {
          billId: bill.billId,
          date: bill.createdDate ? bill.createdDate.substring(0, 10) : '', // Validate date field
          customerName: bill.customerName || '', // Ensure fallback value
          packageName: bill.packageName || '', // Ensure fallback value
          packagePrice: bill.packagePrice || 0, // Ensure fallback value for price
          extraServices: bill.extraServices || [], // Ensure array of services
          totalPrice: calculateTotalPrice() || 0, // Fallback to 0 if undefined
        },
      }, {
        headers: {
          'Authorization': `Bearer ${token}` // Include the token in the headers
        }
      });

      // Show success message with SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Email Sent',
        text: 'The email with the bill details has been sent successfully!',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('There was an error sending the email!', error);

      // Show error message with SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Failed to Send Email',
        text: 'There was an error sending the email. Please try again later.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <Box>
      <Box display="flex">
        <Sidebar />
        <Box
          flex={1}
          p={2}
          style={{ 
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
            margin: '15px',
            backgroundImage: 'url(https://detailxperts.com/wp-content/uploads/2020/04/Gas-Station-Car-Wash-Business-for-You.jpg)', // Add your image path here
            backgroundSize: 'cover', // Cover the entire container
            backgroundPosition: 'center', // Center the image
          }}
        >
          <Paper
            style={{
              padding: '30px',
              maxWidth: '600px',
              margin: '0 auto',
              border: '1px solid #e0e0e0', // Slightly darker border for a more refined look
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)', // Subtle shadow for depth
              fontFamily: 'Arial, sans-serif', // Clean, modern font
            }}
          >
            {/* Header */}
            <Typography
              variant="h4"
              gutterBottom
              style={{
                marginBottom: '20px',
                fontWeight: 'bold',
                color: '#333', // Darker color for better readability
                textAlign: 'center',
                fontSize: '24px',
              }}
            >
              Wash Station
            </Typography>

            {/* Bill Information */}
            <Box display="flex" flexDirection="column" marginBottom={2}>
              <Typography variant="body1" style={{ fontWeight: 'bold', fontSize: '14px' }}>
                <strong>Bill ID:</strong> {bill.billId} &nbsp;&nbsp; | &nbsp;&nbsp;
                <strong>Date:</strong> {new Date(bill.createdDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" style={{ fontWeight: 'bold', fontSize: '14px' }}>
                <strong>Customer Name:</strong> {bill.customerName}
              </Typography>
              <Typography variant="body1" style={{ fontWeight: 'bold', fontSize: '14px' }}>
                <strong>Customer Email:</strong> {bill.customerEmail}
              </Typography>
            </Box>

            {/* Package Information */}
            <Box marginBottom={2}>
              <Typography variant="body1" style={{ fontSize: '16px', marginBottom: '10px' }}>
                <strong>Package Name:</strong> {bill.packageName}
                <span style={{ float: 'right' }}>${bill.packagePrice.toFixed(2)}</span>
              </Typography>

              {/* Extra Services */}
              <Typography variant="body1" style={{ fontWeight: 'bold', marginTop: '10px', fontSize: '16px' }}>
                Extra Services:
              </Typography>
              {bill.extraServices.map((service, index) => (
                <Typography key={index} variant="body1" style={{ marginLeft: '10px', fontSize: '14px' }}>
                  {service.serviceName} - ${service.servicePrice.toFixed(2)}
                </Typography>
              ))}
            </Box>

            {/* Total Price */}
            <Typography variant="h6" style={{ fontWeight: 'bold', fontSize: '18px', textAlign: 'right' }}>
              Total: ${calculateTotalPrice()}
            </Typography>

            {/* Action Buttons */}
            <Box display="flex" justifyContent="space-between" marginTop={3}>
              <Button variant="contained" color="primary" onClick={handleDownloadPDF}>
                Download PDF
              </Button>
              <Button variant="contained" color="success" onClick={handleSendEmail}>
                Send Email
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default BillPage;
