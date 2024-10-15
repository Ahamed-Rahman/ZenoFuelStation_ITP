import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import './ExpiredPromo.css';
import { useNavigate, Link } from 'react-router-dom';

export default function ExpiredPromo() {
  const [expiredPromo, setExpiredPromo] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [promoToUpdate, setPromoToUpdate] = useState(null);
  const [newEndDate, setNewEndDate] = useState('');
  const [newUsageLimit, setNewUsageLimit] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [dateError, setDateError] = useState(''); // State for date validation error
  const [usageLimitError, setUsageLimitError] = useState(''); // State for usage limit validation error
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5000/Promotions/expiredPromos", {
        headers: { // Updated to include headers
          Authorization: `Bearer ${token}`, // Add the authorization token
        },
    })
      .then(response => setExpiredPromo(response.data))
      .catch(err => alert(err));
  }, []);

  const handleUpdateClick = (promoCode) => {
    setPromoToUpdate(promoCode);
    setNewEndDate(promoCode.promo_endDate);
    setNewUsageLimit(promoCode.promo_expire);
    setShowUpdateModal(true);
    setDateError(''); // Reset error when opening modal
    setUsageLimitError(''); // Reset usage limit error when opening modal
  };

  const handleDeleteClick = (promoCode) => {
    setPromoToDelete(promoCode);
    setShowConfirmDelete(true);
  };

  const handleUpdateSubmit = async () => {
    const today = moment().startOf('day'); // Get today's date

    // Validate the new end date
    if (moment(newEndDate).isBefore(today)) {
      setDateError('End date cannot be in the past.'); // Set error message
      return; // Prevent submission
    } else {
      setDateError(''); // Clear error if valid
    }

    // Validate the new usage limit
    if (isNaN(newUsageLimit) || Number(newUsageLimit) <= 0) {
      setUsageLimitError('Usage limit must be a positive number.'); // Set error message
      return; // Prevent submission
    } else {
      setUsageLimitError(''); // Clear error if valid
    }

    try {
      await axios.put(`http://localhost:5000/Promotions/updatePromo/${promoToUpdate._id}`, {
        promo_endDate: newEndDate,
        promo_expire: newUsageLimit,
      }, {
        headers: { // Added headers for authorization
          Authorization: `Bearer ${token}`, // Add the authorization token
        },
      });
      setExpiredPromo(expiredPromo.map(p => (p._id === promoToUpdate._id ? { ...p, promo_endDate: newEndDate, promo_expire: newUsageLimit } : p)));
      setShowUpdateModal(false);
    } catch (error) {
      alert('Error updating promo: ' + error.message);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/Promotions/deletePromo/${promoToDelete._id}`, {
        headers: { // Added headers for authorization
          Authorization: `Bearer ${token}`, // Add the authorization token
        },
      });
      setExpiredPromo(expiredPromo.filter(p => p._id !== promoToDelete._id));
      setShowConfirmDelete(false);
    } catch (error) {
      alert('Error deleting promo: ' + error.message);
    }
  };

  // Check if the update button should be enabled
  const isUpdateButtonDisabled = () => {
    const today = moment().startOf('day');
    return moment(newEndDate).isBefore(today) || isNaN(newUsageLimit) || Number(newUsageLimit) <= 0;
  };

  // Handle date change and validation
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setNewEndDate(selectedDate);

    // Validate the new end date
    const today = moment().startOf('day');
    if (moment(selectedDate).isBefore(today)) {
      setDateError('End date cannot be in the past.'); // Set error message
    } else {
      setDateError(''); // Clear error if valid
    }
  };

  // Handle usage limit change and validation
  const handleUsageLimitChange = (e) => {
    const value = e.target.value;
    setNewUsageLimit(value);

    // Validate the new usage limit
    if (isNaN(value) || Number(value) <= 0) {
      setUsageLimitError('Usage limit must be a positive number.'); // Set error message
    } else {
      setUsageLimitError(''); // Clear error if valid
    }
  };

  return (
    <div className="promo-details-layout">
      <nav className="promo-details-side-nav">
        <div className="nav-header">
          <h3>Navigation</h3>
        </div>
        <ul>
          <li>
            <Link to="/admin-welcome/AddPromo">
              <i className="fas fa-plus-circle"></i>
              <span>Add Promo</span>
            </Link>
          </li>
          <li>
            <Link to="/admin-welcome/PromoDetails">
              <i className="fas fa-list"></i>
              <span>Promo Details</span>
            </Link>
          </li>
          <li>
            <Link to="/admin-welcome/ExpiredPromo" className="active">
              <i className="fas fa-clock"></i>
              <span>Expired Promos</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="expired-promo-page">
        <div className="expired-promo-container">
          <h1>Expired Promo Codes</h1>
          <div className="table-container">
            <table className="promo-table">
              <thead>
                <tr>
                  <th>Name</th> {/* New column for promo code's name */}
                  <th>Type</th>
                  <th>Value</th>
                  <th>End Date</th>
                  <th>Usage Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expiredPromo.map(promoCode => (
                  <tr key={promoCode._id}>
                    <td>{promoCode.promo_code}</td> {/* Display promo code's name */}
                    <td>{promoCode.promo_type}</td>
                    <td>{promoCode.promo_value}</td>
                    <td>{moment(promoCode.promo_endDate).format('YYYY-MM-DD')}</td>
                    <td>{promoCode.promo_expire}</td>
                    <td>
                      <button className="update-btn" onClick={() => handleUpdateClick(promoCode)}>Update</button>
                      <button className="delete-btn" onClick={() => handleDeleteClick(promoCode)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Update Modal */}
          {showUpdateModal && (
            <div className="modal">
              <div className="modal-content">
                <h2>Update Promo Code</h2>
                <label>End Date:</label>
                <input 
                  type="date" 
                  value={newEndDate} 
                  onChange={handleDateChange} // Use the new date change handler
                />
                {dateError && <div style={{ color: 'red' }}>{dateError}</div>} {/* Display error message */}
                <label>Usage Limit:</label>
                <input 
                  type="number" 
                  value={newUsageLimit} 
                  onChange={handleUsageLimitChange} // Use the new usage limit change handler
                />
                {usageLimitError && <div style={{ color: 'red' }}>{usageLimitError}</div>} {/* Display usage limit error message */}
                <div className="modal-actions">
                  <button onClick={handleUpdateSubmit} disabled={isUpdateButtonDisabled()}>Submit</button> {/* Disable button based on validation */}
                  <button onClick={() => setShowUpdateModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {showConfirmDelete && (
            <div className="modal">
              <div className="modal-content">
                <h2>Are you sure you want to delete this promo?</h2>
                <div className="modal-actions">
                  <button onClick={handleDeleteConfirm}>Yes, Delete</button>
                  <button onClick={() => setShowConfirmDelete(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}