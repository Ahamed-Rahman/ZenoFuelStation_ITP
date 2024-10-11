import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../User/EditProfileForm.css';
import Swal from 'sweetalert2'; // Import SweetAlert2

const EditProfileForm = ({ onClose, userRole, onProfileUpdated, currentProfilePhoto, setProfilePhotoUrl }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        contact: '',
        accountNo: '',
        bankDetails: '',
        bankName: '',
    });

    const [previewUrl, setPreviewUrl] = useState(currentProfilePhoto || '/assets/default-profile.png');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/user-profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Corrected here
                    },
                });

                // Set the form data and preview URL
                setFormData({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    username: response.data.username || '',
                    email: response.data.email || '',
                    contact: response.data.contact || '',
                    accountNo: response.data.accountNo || '',
                    bankDetails: response.data.bankDetails || '',
                    bankName: response.data.bankName || '',
                });

                // Set the preview URL to the fetched profile photo
                setPreviewUrl(response.data.profilePhoto || '/assets/default-profile.png');
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl); // Show the file preview immediately
        }
    };

    const validateForm = () => {
        const { email, contact, accountNo } = formData;

        // Email validation (basic regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire("Invalid Email", "Please enter a valid email address.", "error");
            return false;
        }

        // Contact validation (exactly 10 digits)
        if (contact.length !== 10 || isNaN(contact)) {
            Swal.fire("Invalid Phone Number", "Contact number must be exactly 10 digits.", "error");
            return false;
        }

        // Account number validation (exactly 16 digits)
        if (accountNo.length !== 16 || isNaN(accountNo)) {
            Swal.fire("Invalid Account Number", "Account number must be exactly 16 digits.", "error");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form data before proceeding
        if (!validateForm()) {
            return; // Stop submission if validation fails
        }
        const formDataToSend = new FormData();
        formDataToSend.append('firstName', formData.firstName);
        formDataToSend.append('lastName', formData.lastName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('contact', formData.contact);
        formDataToSend.append('accountNo', formData.accountNo);
        formDataToSend.append('bankDetails', formData.bankDetails);
        formDataToSend.append('bankName', formData.bankName);

        // Append the profile photo if available
        const fileInput = document.querySelector('#profile-photo-input');
        if (fileInput.files.length > 0) {
            formDataToSend.append('profilePhoto', fileInput.files[0]);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/api/update-profile', formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Corrected here
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedProfileTimestamp = new Date().getTime(); // Store a new timestamp for profile update
            localStorage.setItem('profileUpdatedTimestamp', updatedProfileTimestamp);
    

            onProfileUpdated(previewUrl); // Pass the updated URL to the Layout
            
            Swal.fire("Success", "Profile updated successfully!", "success");
            onClose(); // Close the form after update
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire("Error", "An error occurred while updating the profile. Please try again.", "error");
        }
    };
    return (
        <div className="edit-profile-form-wrapper">
            <div className="edit-profile-form">
                <h2>Edit Profile</h2>
                <div className="profile-container">
                    <img src={previewUrl} alt="Profile" className="profile-photo-large" />
                    <button className="update-photo-button" type="button" onClick={() => document.querySelector('#profile-photo-input').click()}>
                        Update Profile Photo
                    </button>
                    <input id="profile-photo-input" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
                <form onSubmit={handleSubmit} className="form-horizontal">
                    <div className="form-row">
                        <div className="form-groups">
                            <label>First Name:</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="form-groups">
                            <label>Last Name:</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-groups">
                            <label>Username:</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} disabled={userRole !== 'Admin'} />
                        </div>
                        <div className="form-groups">
                            <label>Email:</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-groups">
                            <label>Contact:</label>
                            <input type="text" name="contact" value={formData.contact} onChange={handleChange} required />
                        </div>
                        <div className="form-groups">
                            <label>Account No:</label>
                            <input type="text" name="accountNo" value={formData.accountNo} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-groups">
                            <label>Bank Details:</label>
                            <input type="text" name="bankDetails" value={formData.bankDetails} onChange={handleChange} required />
                        </div>
                        <div className="form-groups">
                            <label>Bank Name:</label>
                            <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-button">
                        <button type="submit">Save</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditProfileForm.propTypes = {
    onClose: PropTypes.func.isRequired,
    userRole: PropTypes.string.isRequired,
    onProfileUpdated: PropTypes.func.isRequired,
    currentProfilePhoto: PropTypes.string,
    setProfilePhotoUrl: PropTypes.func.isRequired,
};

export default EditProfileForm;
