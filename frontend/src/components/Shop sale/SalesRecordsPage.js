import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './SalesRecordsPage.module.css';// Ensure this path is correct

const SalesRecordsPage = () => {
    const [records, setRecords] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/sale-records');
                setRecords(response.data);
            } catch (error) {
                console.error("Error fetching sale records:", error);
                setError('Failed to fetch sale records. Please try again.');
            }
        };

        fetchRecords();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/sale-records/delete/${id}`);
            setRecords(records.filter(record => record._id !== id));
            Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Sale record deleted successfully.',
            });
        } catch (error) {
            console.error("Error deleting sale record:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete sale record. Please try again.',
            });
        }
    };

    return (
        <div className={styles.salesRecordsPage}>
            <h1>Sales Records</h1>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <table className={styles.recordsTable}>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Unit Price</th>
                        <th>Quantity Sold</th>
                        <th>Total Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {records.length > 0 ? (
                        records.map(record => (
                            <tr key={record._id}>
                                <td>{record.itemId ? record.itemId.itemName : 'N/A'}</td>
                                <td>{record.itemId ? `$${record.itemId.retailPrice.toFixed(2)}` : 'N/A'}</td>
                                <td>{record.itemSold !== undefined ? record.itemSold : 'N/A'}</td>
                                <td>{record.totalPrice !== undefined ? `$${record.totalPrice.toFixed(2)}` : 'N/A'}</td>
                                <td>
                                    <button onClick={() => handleDelete(record._id)} className={styles.deleteButton}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No records available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SalesRecordsPage;
