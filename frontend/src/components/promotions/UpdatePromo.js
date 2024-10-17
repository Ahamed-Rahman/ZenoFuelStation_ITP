import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import moment from 'moment';
import './UpdatePromo.css'; // Assuming you have some CSS styles for the component
import './PromoDetails.css';

export default function UpdatePromo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [promo_code, setPromoName] = useState("");
  const [promo_type, setPromoType] = useState("Percentage");
  const [promo_value, setPromoValue] = useState("");
  const [promo_startDate, setStartDate] = useState("");
  const [promo_endDate, setEndDate] = useState("");
  const [promo_expire, setExpireNo] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false); // Change initial state to false
  const [startDateTouched, setStartDateTouched] = useState(false);
  const [endDateTouched, setEndDateTouched] = useState(false);
  const [promoValueError, setPromoValueError] = useState(""); // State for promo value error
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [expireError, setExpireError] = useState(""); // State for usage limit error

  useEffect(() => {
    const token = localStorage.getItem("token"); // Ensure you have stored the token in localStorage
    axios.get(`http://localhost:5000/Promotions/getPromo/${id}`,{
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((response) => {
        const promoData = response.data.Promotions || {};
        setPromoName(promoData.promo_code || "");
        setPromoType(promoData.promo_type || "Percentage");
        setPromoValue(promoData.promo_value ? promoData.promo_value.toString() : "");
        setStartDate(promoData.promo_startDate ? moment(promoData.promo_startDate).format("YYYY-MM-DD") : "");
        setEndDate(promoData.promo_endDate ? moment(promoData.promo_endDate).format("YYYY-MM-DD") : "");
        setExpireNo(promoData.promo_expire ? promoData.promo_expire.toString() : "");
      })
      .catch((err) => {
        alert("Error loading promo data: " + err);
      });
  }, [id]);

  useEffect(() => {
    validateDates();
  }, [promo_startDate, promo_endDate, startDateTouched, endDateTouched]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    checkFormValidity();
  };

  const handlePromoValueChange = (e) => {
    const value = e.target.value;

    // Check if the input is a number
    if (value === "" || !isNaN(value)) {
      setPromoValue(value);
      setPromoValueError(""); // Clear error if valid number or empty

      // Additional check for percentage limit
      if (promo_type === "Percentage" && Number(value) > 100) {
        setPromoValueError("Percentage cannot be more than 100.");
      } else {
        setPromoValueError(""); // Clear error if valid
      }
    } else {
      setPromoValueError("Please enter a valid number."); // Set error for invalid input
    }
    checkFormValidity();
  };

  const handleExpireChange = (e) => {
    const value = e.target.value;

    // Check if the input is a number
    if (value === "" || !isNaN(value)) {
      setExpireNo(value);
      if (Number(value) <= 0) {
        setExpireError("Enter a number greater than 0");
      } else {
        setExpireError(""); // Clear error if valid number
      }
    } else {
      setExpireError("Enter a valid number"); // Set error for invalid input
    }
    checkFormValidity();
  };

  function validateDates() {
    const today = new Date().toISOString().split('T')[0];
    let isValid = true;

    if (startDateTouched && promo_startDate < today) {
      setStartDateError("Start date cannot be in the past");
      isValid = false;
    } else {
      setStartDateError("");
    }

    if (endDateTouched && (promo_endDate < today || promo_endDate < promo_startDate)) {
      setEndDateError("End date must be today or later, and after the start date");
      isValid = false;
    } else {
      setEndDateError("");
    }

    setIsFormValid(isValid);
  }

  const checkFormValidity = () => {
    const isValid = 
      promo_code.trim() !== "" &&
      promo_value.trim() !== "" &&
      !promoValueError &&
      !startDateError &&
      !endDateError &&
      !expireError &&
      promo_startDate &&
      promo_endDate &&
      promo_expire.trim() !== "";
    
    setIsFormValid(isValid);
  };

  const sendData = (e) => {
    e.preventDefault();
    // Validate promo value based on promo type
    if (promo_type === "Percentage" && Number(promo_value) > 100) {
      setPromoValueError("Percentage cannot be more than 100.");
      return; // Prevent form submission
    } else {
      setPromoValueError(""); // Clear error if valid
    }

    if (!isFormValid) {
      alert("Please correct the date errors before submitting.");
      return;
    }

    const updatedPromo = {
      promo_code,
      promo_type,
      promo_value: Number(promo_value),
      promo_startDate,
      promo_endDate,
      promo_expire: Number(promo_expire)
    };

    const token = localStorage.getItem("token"); // Retrieve the token for the PUT request
    axios.put(`http://localhost:5000/Promotions/updatePromo/${id}`, updatedPromo,{
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(() => {
        setShowSuccessPopup(true); // Show success popup
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate("/admin-welcome/PromoDetails"); // Navigate only after showing the popup
        }, 3000); // Hide after 3 seconds
      })
      .catch((err) => {
        alert("Error updating promo: " + err);
      });
  };

  return (
    <div className="update-promo-layout">
      <nav className="side-nav">
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
              <Link to="/admin-welcome/ExpiredPromo">
                <i className="fas fa-clock"></i>
                <span>Expired Promos</span>
              </Link>
          </li>
        </ul>
      </nav>

      <div className="update-promo-container">
        <div className="promocontainer">
          <div className="promo-box" style={{ backgroundColor: "#ffffcc", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h3>Promo Code: {promo_code || "N/A"}</h3>
            <p>Type: {promo_type || "N/A"}</p>
            <p>Value: {promo_value || "N/A"}</p>
            <p>Start Date: {promo_startDate || "N/A"}</p>
            <p>End Date: {promo_endDate || "N/A"}</p>
            <p>Usage Limit: {promo_expire || "N/A"}</p>
          </div>

          {/* Update form */}
          <form onSubmit={sendData} className="Lasitha1">
            <div className="mb-3">
              <label htmlFor="PromoName" className="form-label">Promo Code</label>
              <input 
                type="text" 
                className="form-control" 
                id="promo_code" 
                value={promo_code} 
                onChange={handleInputChange(setPromoName)} 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="PromoType" className="form-label">Promo Type</label>
              <select 
                id="promo_type" 
                className="form-select" 
                value={promo_type} 
                onChange={handleInputChange(setPromoType)}>
                <option value="Percentage">Percentage</option>
                <option value="Fixed">Fixed</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="PromoValue" className="form-label">Promo Code Amount</label>
              <input 
                type="text" // Keep as text to allow validation
                className="form-control" 
                id="promo_value" 
                value={promo_value} 
                onChange={handlePromoValueChange} // Use the new handler
              />
              {promoValueError && <div className="text-danger">{promoValueError}</div>} {/* Error message */}
            </div>
            <div className="mb-3">
              <label htmlFor="StartDate" className="form-label">Start Date</label>
              <input 
                type="date" 
                className={`form-control ${startDateTouched && startDateError ? 'is-invalid' : ''}`} 
                id="promo_startDate" 
                value={promo_startDate} 
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setStartDateTouched(true);
                }}
                onBlur={() => setStartDateTouched(true)}
              />
              {startDateTouched && startDateError && <div className="text-danger">{startDateError}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="EndDate" className="form-label">End Date</label>
              <input 
                type="date" 
                className={`form-control ${endDateTouched && endDateError ? 'is-invalid' : ''}`} 
                id="promo_endDate" 
                value={promo_endDate} 
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setEndDateTouched(true);
                }}
                onBlur={() => setEndDateTouched(true)}
              />
              {endDateTouched && endDateError && <div className="text-danger">{endDateError}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="ExpireNo" className="form-label">Usage Limit</label>
              <input 
                type="text" 
                className="form-control" 
                id="promo_expire" 
                value={promo_expire} 
                onChange={handleExpireChange} // Use the new handler
              />
              {expireError && <div className="text-danger">{expireError}</div>} {/* Error message */}
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={!isFormValid}>Update Promo</button>
          </form>
          {/* Success Popup for Update */}
          {showSuccessPopup && (
            <div className="popup-overlay">
              <div className="popup-container">
                <div className="popup-message">
                  <i className="fas fa-check-circle animated-tick"></i>
                  <span>Promo Code Updated Successfully!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}