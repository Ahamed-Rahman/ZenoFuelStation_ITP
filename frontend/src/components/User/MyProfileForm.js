import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PropTypes from 'prop-types';
import './EditProfileForm.css'; // Import your CSS styles
import logoImage from '../../assets/images/logo.png';

const MyProfile = () => {
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        contact: '',
        accountNo: '',
        bankDetails: '',
        bankName: '',
        profilePhoto: ''
    });
    
    const [isFormVisible, setIsFormVisible] = useState(true); // New state to control visibility


    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/user-profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setProfileData({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    username: response.data.username || '',
                    email: response.data.email || '',
                    contact: response.data.contact || '',
                    accountNo: response.data.accountNo || '',
                    bankDetails: response.data.bankDetails || '',
                    bankName: response.data.bankName || '',
                    profilePhoto: response.data.profilePhoto || '/assets/default-profile.png'
                });
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const generateIDCard = () => {
        const doc = new jsPDF();
        const logoSize = 30;
        const margin = 20;
        const cardWidth = 180; // Adjusted to cover the full width properly
        const cardHeight = 95; // Adjusted height to cover entire content
    
        // Cool blue gradient color palette
        const gradientSteps = 50;
        const startColor = [0, 51, 102];  // Dark cool blue
        const endColor = [102, 144, 205]; // Light cool blue
    
        // Function to interpolate between two colors
        const interpolateColor = (start, end, factor) => {
            return start.map((startVal, index) => Math.round(startVal + (end[index] - startVal) * factor));
        };
    
        // Simulate a gradient background with many steps
        for (let i = 0; i < gradientSteps; i++) {
            const factor = i / gradientSteps;
            const color = interpolateColor(startColor, endColor, factor);
            doc.setFillColor(color[0], color[1], color[2]);
            doc.rect(margin - 5, margin + (i * (cardHeight / gradientSteps)), cardWidth, cardHeight / gradientSteps, 'F');
        }
    
        // Add company logo in the top left corner
        const logoUrl = logoImage; // Assuming logoImage is imported correctly
        doc.addImage(logoUrl, 'JPG', margin, margin, logoSize, logoSize);
    
        // Calculate center position for the profile photo
        const centerX = (doc.internal.pageSize.width - 20) / 2;
    
        // Add profile photo centered above text
        const imageUrl = profileData.profilePhoto.startsWith('http') 
            ? profileData.profilePhoto 
            : `http://localhost:5000${profileData.profilePhoto}`;
        doc.addImage(imageUrl, 'JPG', centerX, 30, 25, 25); // Adjust position and size
    
        // Add profile details below the photo
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(255, 255, 255); // White text color for contrast with dark background
        doc.text(`Name: ${profileData.firstName} ${profileData.lastName}`, margin + 30, 80);
        
        doc.setFontSize(14);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(255, 255, 255); // White text color for username
        doc.text(`${profileData.username}`, margin + 67, 63);
        
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(255, 255, 255); // White text color for contrast
        doc.text(`Email: ${profileData.email}`, margin + 30, 90);
        doc.text(`Contact: ${profileData.contact}`, margin + 30, 100);
        doc.text(`Account No: ${profileData.accountNo}`, margin + 100, 90);
        doc.text(`Bank Details: ${profileData.bankDetails}`, margin + 100, 100);
        doc.text(`Bank Name: ${profileData.bankName}`, margin + 100, 80);
    
        // Adjust the border to match the background properly
        doc.setDrawColor(255, 255, 255); // White border for contrast
        doc.setLineWidth(1.5);
        // Adjusted the starting coordinates and dimensions for the roundedRect to fit the card
        doc.roundedRect(margin - 5, margin - 5, cardWidth + 10, cardHeight + 10, 5, 5); 
    
        // Save the PDF with a meaningful name
        doc.save('personal_id_card.pdf');
    };
    
    const handleCancel = () => {
        setIsFormVisible(false); // Hide the form when cancel is clicked
    };

    if (!isFormVisible) {
        return null; // If the form is hidden, don't render anything
    }

    return (
        <div className="edit-profile-form-wrapper">
            <div className="edit-profile-form">
            <div className="profile-container">
                <img src={profileData.profilePhoto} alt="Profile" className="profile-photo-large" />
                <div className="shakeeka-profile-info">
                    <p><strong>First Name:</strong> {profileData.firstName}</p>
                    <p><strong>Last Name:</strong> {profileData.lastName}</p>
                    <p><strong>Username:</strong> {profileData.username}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>Contact:</strong> {profileData.contact}</p>
                    <p><strong>Account No:</strong> {profileData.accountNo}</p>
                    <p><strong>Bank Details:</strong> {profileData.bankDetails}</p>
                    <p><strong>Bank Name:</strong> {profileData.bankName}</p>
                </div>
            </div>
            <button className="shakeeka-generate-id-card-button" onClick={generateIDCard}>
                Generate ID Card
            </button>
            <button className="shakeeka-cancel-button" onClick={handleCancel}>
                    Cancel
                </button>
        </div>
        </div>
    );
};

MyProfile.propTypes = {
    // Define prop types if needed
};

export default MyProfile;
