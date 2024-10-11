import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './OrderManagementPage.css'; // Adjust the path based on your folder structure
import SidebarOrder from './SidebarOrder';
import logoImage from '../../assets/images/logo.png';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import jsPDF AutoTable plugin

const OrderTablePage = () => {
    const [orders, setOrders] = useState([]);
    const [editOrderId, setEditOrderId] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/ordersShop', {
                headers: {
                    'Authorization': `Bearer ${token}` // Include token in the headers
                }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            Swal.fire('Error', 'Failed to fetch orders', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/ordersShop/delete/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Include token in the headers
                    }
                });
                setOrders(orders.filter(order => order._id !== id));
                Swal.fire('Deleted!', 'Order deleted successfully.', 'success');
            } catch (error) {
                console.error("Error deleting order:", error);
                Swal.fire('Error', 'Failed to delete order', 'error');
            }
        }
    };

    const handleEdit = (id, quantityOrdered) => {
        setEditOrderId(id);
        setEditQuantity(quantityOrdered);
    };

    const handleSaveEdit = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/ordersShop/update/${id}`, {
                quantityOrdered: editQuantity
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            Swal.fire('Updated!', 'Order updated successfully.', 'success');
            setEditOrderId(null); // Exit edit mode
            fetchOrders(); // Refresh the orders
        } catch (error) {
            console.error("Error updating order:", error);
            Swal.fire('Error', 'Failed to update order', 'error');
        }
    };

    const handleAcceptOrder = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/ordersShop/accept/${id}`, {
                status: 'Accepted'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            Swal.fire('Accepted!', 'Order has been accepted.', 'success');
            fetchOrders(); // Refresh the orders
        } catch (error) {
            console.error("Error accepting order:", error);
            Swal.fire('Error', 'Failed to accept order', 'error');
        }
    };

     // Function to generate the PDF report
     const generateReport = () => {
        const doc = new jsPDF();

        // Add the logo at the top-left corner
        const logo = new Image();
        logo.src = logoImage; // The imported logo image
        const logoSize = 30;
        doc.addImage(logo, 'PNG', 10, 5, logoSize, logoSize); // Adjust the position and size for the logo

        // Center the title below the logo
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(40, 116, 166);
        doc.text('Shop Orders Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

        // Table headers
        const headers = [['ID', 'Item Name', 'Quantity', 'Supplier Email', 'Date', 'Status']];

        // Mapping filtered orders for table data
        const tableData = orders.map((order, index) => [
            index + 1, // ID
            order.itemName, // Item Name
            order.quantityOrdered, // Quantity
            order.supplierEmail, // Supplier Email
            new Date(order.orderDate).toLocaleDateString(), // Date
            order.status || 'Pending' // Status
        ]);

        // Generating the table in the PDF with grid theme
        doc.autoTable({
            head: headers,
            body: tableData,
            startY: 50, // Adjust to fit the logo and title
            theme: 'grid',
            styles: {
                font: 'helvetica',
                fontSize: 10,
                textColor: [40, 40, 40],
                lineColor: [216, 216, 216],
                lineWidth: 0.1,
                cellPadding: 4, // Adds padding for better readability
            },
            headStyles: {
                fillColor: [40, 116, 166],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center', // Center-align headers
            },
            bodyStyles: {
                fillColor: [245, 245, 245],
                valign: 'middle',
                halign: 'center', // Center-align text in the body
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255],
            },
        });

        let lastY = doc.autoTable.previous.finalY || 50;

        // Add a thank-you message at the end
        const pageHeight = doc.internal.pageSize.height;
        if (lastY + 50 > pageHeight) {
            doc.addPage();
            lastY = 20;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('Thank you for reviewing the orders report. Please contact us if you have any questions.', 14, lastY + 10);

        // Save the generated PDF
        doc.save('orders_report.pdf');
    };

    return (
        <SidebarOrder>
            <div className="place-new-order-page">
                <h2 className="order-management-title">All Shop Orders</h2>
                
                <table className="place-new-order-page__table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Supplier Email</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={order._id}>
                                <td>{index + 1}</td>
                                <td>{order.itemName}</td>
                                <td>
                                    {editOrderId === order._id ? (
                                        <input
                                            type="number"
                                            className="DananjayaInput"
                                            value={editQuantity}
                                            onChange={(e) => setEditQuantity(e.target.value)}
                                        />
                                    ) : (
                                        order.quantityOrdered
                                    )}
                                </td>
                                <td>{order.supplierEmail}</td>
                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>{order.status || 'Pending'}</td>
                                <td>
                                    {order.status !== 'Accepted' && (
                                        <>
                                            {editOrderId === order._id ? (
                                                <button className="DanSave" onClick={() => handleSaveEdit(order._id)}>
                                                    Save
                                                </button>
                                            ) : (
                                                <button className="DananjayaEdit" onClick={() => handleEdit(order._id, order.quantityOrdered)}>
                                                    Edit
                                                </button>
                                            )}
                                            <button className="DananjayaDelete" onClick={() => handleDelete(order._id)}>
                                                Delete
                                            </button>
                                           
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            
                <button className="Dananjayagenerate" onClick={generateReport}>Generate Report</button>
            </div>
        </SidebarOrder>
    );
};

export default OrderTablePage;
