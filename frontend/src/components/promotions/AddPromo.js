import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './AddPromo.css';
import './PromoDetails.css'; // Import PromoDetails.css to use its styles

export default function AddPromo() {
    const [promo_code, setPromoName] = useState("");
    const [promo_type, setPromoType] = useState("Percentage");
    const [promo_value, setPromoValue] = useState("");
    const [promo_startDate, setStartDate] = useState("");
    const [promo_endDate, setEndDate] = useState("");
    const [promo_expire, setExpireNo] = useState("");
    const [startDateError, setStartDateError] = useState("");
    const [endDateError, setEndDateError] = useState("");
    const [isFormValid, setIsFormValid] = useState(false);
    const [startDateTouched, setStartDateTouched] = useState(false);
    const [endDateTouched, setEndDateTouched] = useState(false);
    const [minimumAmount, setMinimumAmount] = useState("");
    const [currentMinimumAmount, setCurrentMinimumAmount] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showMinAmountSuccessPopup, setShowMinAmountSuccessPopup] = useState(false);
    const [promoValueError, setPromoValueError] = useState(""); // State for promo value error
    const [showMinAmountContainer, setShowMinAmountContainer] = useState(false); // New state for showing min amount container
    const [expireError, setExpireError] = useState(""); // State for usage limit error

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

        // Proceed with sending data if valid
        const newPromo = {
            promo_code,
            promo_type,
            promo_value: Number(promo_value),
            promo_startDate,
            promo_endDate,
            promo_expire: Number(promo_expire)
        };
        const token = localStorage.getItem('token'); // Get the token from local storage
        axios.post("http://localhost:5000/Promotions/addPromo", newPromo, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                setShowPopup(true); // Show the popup
                setTimeout(() => setShowPopup(false), 3000); // Hide after 3 seconds
            })
            .catch((err) => {
                alert(err);
            });
    };

    useEffect(() => {
        fetchCurrentAmount();
    }, []);

    useEffect(() => {
        if (startDateTouched || endDateTouched) {
            validateDates();
        }
    }, [promo_startDate, promo_endDate, startDateTouched, endDateTouched]);

    const fetchCurrentAmount = async () => {
        try {
            const token = localStorage.getItem('token'); // Get the token for authorization
            const response = await axios.get("http://localhost:5000/MinimumPurchase/get",{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCurrentMinimumAmount(response.data.minimumAmount);
        } catch (error) {
            console.error("Error fetching minimum purchase amount:", error);
        }
    };

    const handleMinimumAmountSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token'); // Get the token for authorization
            await axios.post("http://localhost:5000/MinimumPurchase/set", { minimumAmount: Number(minimumAmount) },{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setShowMinAmountSuccessPopup(true); // Show success popup
            setTimeout(() => setShowMinAmountSuccessPopup(false), 3000); // Hide after 3 seconds
            fetchCurrentAmount(); // Refresh the current minimum amount
        } catch (error) {
            alert("Error updating minimum purchase amount: " + error.message);
        }
    };

    const handlePromoValueChange = (e) => {
        const value = e.target.value;

        // Check if the input is a number
        if (value === "" || !isNaN(value)) {
            setPromoValue(value);
            setPromoValueError(""); // Clear error if valid number or empty
        } else {
            setPromoValueError("Please enter a valid number."); // Set error for invalid input
        }

        // Additional check for percentage limit
        if (promo_type === "Percentage" && Number(value) > 100) {
            setPromoValueError("Percentage cannot be more than 100.");
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

        checkFormValidity();
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

    return (
        <div className="add-promo-page">
            {showMinAmountSuccessPopup && (
                <div className="popup-overlay">
                    <div className="popup-container">
                        <div className="popup-message">
                            <i className="fas fa-check-circle animated-tick"></i>
                            <span>Minimum Purchase Amount Updated Successfully!</span>
                        </div>
                    </div>
                </div>
            )}
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-container">
                        <div className="popup-message">
                            <i className="fas fa-check-circle animated-tick"></i>
                            <span>New Promo Code Added!</span>
                        </div>
                    </div>
                </div>
            )}
        <div className="add-promo-layout">
            <nav className="promo-details-side-nav"> {/* Use the same class as in PromoDetails */}
                    <div className="nav-header">
                        <h3>Navigation</h3>
                    </div>
                    <ul>
                    <li>
                        <Link to="/admin-welcome/AddPromo" className="active">
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

            <div className="add-promo-container">
            <form onSubmit={sendData} className="Lasitha1">
                <div className="mb-3">
                    <h2>Create a Promo Code</h2><br></br>
                    <label for="PromoName" className="form-label">Promo Code</label>
                    <input type="text" className="form-control" id="promo_code" placeholder="Enter the Promo Name" onChange={(e) => setPromoName(e.target.value)}/>
                </div>
                <div className="mb-3">
                    <label for="PromoType" className="form-label">Promo Type</label>
                    <select id="promo_type" className="form-select" onChange={(e) => setPromoType(e.target.value)}>
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
                        placeholder="Enter the Value"
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
                        onChange={(e) => {
                            setEndDate(e.target.value);
                            setEndDateTouched(true);
                        }}
                        onBlur={() => setEndDateTouched(true)}
                    />
                    {endDateTouched && endDateError && <div className="text-danger">{endDateError}</div>}
                </div>
                <div className="mb-3">
                    <label for="ExpireNo" className="form-label">Usage Limit</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="promo_expire" 
                        placeholder="Set Usage Limit" 
                        value={promo_expire}
                        onChange={handleExpireChange} // Use the new handler
                    />
                    {expireError && <div className="text-danger">{expireError}</div>} {/* Error message */}
                </div>
                <button type="submit" className="btn btn-primary" disabled={!isFormValid}>Add Promo</button>
            </form>
            <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowMinAmountContainer(!showMinAmountContainer)}
            >
                {showMinAmountContainer ? "Hide Minimum Purchase Amount" : "Set Minimum Purchase Amount"}
            </button>

            {/* Minimum Purchase Amount Container */}
            {showMinAmountContainer && (
                <div className="minimum-purchase-container">
                    <h3>Minimum Purchase Amount</h3>
                    <div className="input-group mb-3">
                    <input 
                        type="number" 
                        className="form-control" 
                        id="minimumAmount" 
                        value={minimumAmount}
                        onChange={(e) => setMinimumAmount(e.target.value)}
                        placeholder="Enter amount"
                    />
                    <button 
                        className="btn-secondary1" 
                                type="button" 
                                onClick={handleMinimumAmountSubmit}
                        >
                            Apply
                        </button>
                    </div>
                        {currentMinimumAmount !== null && (
                            <p className="current-amount">Current: ${currentMinimumAmount}</p>
                        )}
                </div>
            )}
            </div>
        </div>
    </div>
    )
}