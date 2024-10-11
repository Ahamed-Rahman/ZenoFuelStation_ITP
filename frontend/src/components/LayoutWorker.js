import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../styles/LayoutWorker.css';
import EditProfileForm from './User/EditProfileForm';
import ChangePasswordForm from './User/ChangePasswordForm';
import MyProfileForm from './User/MyProfileForm'; 
import logo from '../assets/images/logo1.png';
import axios from 'axios';

const LayoutWorker = () => {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [myProfileOpen, setMyProfileOpen] = useState(false); 
    const [managementDropdownOpen, setManagementDropdownOpen] = useState(false);
    const [signOutConfirmationOpen, setSignOutConfirmationOpen] = useState(false);
    const [attendanceDropdownOpen, setAttendanceDropdownOpen] = useState(false);
    
    const [profilePhotoUrl, setProfilePhotoUrl] = useState('/assets/default-profile.png'); // Default profile photo

    const location = useLocation();
    const navigate = useNavigate(); 
    const userRole = 'worker';


    // Fetch user profile data including profile photo
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/user-profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
        
                // Ensure the profile photo URL is constructed correctly
                const photoPath = response.data.profilePhoto ? response.data.profilePhoto : '/assets/default-profile.png';
                const photoUrl = photoPath.startsWith('http') ? photoPath : `http://localhost:5000${photoPath}`;
                setProfilePhotoUrl(photoUrl); // Set the profile photo URL
                console.log('Fetched profile photo URL:', photoUrl); // For debugging
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };
        

        fetchUserProfile();
    }, []); // Ensure this runs on component mount
 // Ensure this runs on component mount

 const handleProfileUpdated = (newProfilePhotoUrl) => {
    setProfilePhotoUrl(newProfilePhotoUrl); // Update the profile photo URL in the header
    console.log('Profile updated in layout:', newProfilePhotoUrl); // Log for confirmation
};


    const handleProfileMenuToggle = () => {
        setProfileMenuOpen(!profileMenuOpen);
    };

    const handleMyProfileClick = () => {
        setMyProfileOpen(true);
        setProfileMenuOpen(false);
    };

    const handleEditProfileClick = () => {
        setEditProfileOpen(true);
        setProfileMenuOpen(false);
    };

    const handleChangePasswordClick = () => {
        setChangePasswordOpen(true);
        setProfileMenuOpen(false);
    };

    const handleSignOutClick = () => {
        setSignOutConfirmationOpen(true);
        setProfileMenuOpen(false);
    };

    const handleConfirmSignOut = () => {
        navigate('/'); 
    };

    const handleCloseSignOutConfirmation = () => {
        setSignOutConfirmationOpen(false);
    };

    const handleCloseEditProfile = () => {
        setEditProfileOpen(false);
    };

    const handleCloseChangePassword = () => {
        setChangePasswordOpen(false);
    };

    const handleCloseMyProfile = () => {
        setMyProfileOpen(false);
    };

    const handleManagementDropdownToggle = () => {
        setManagementDropdownOpen(!managementDropdownOpen);
    };

    const handleAttendanceDropdownToggle = () => {
        setAttendanceDropdownOpen(!attendanceDropdownOpen);
    };

    const closeDropdown = () => {
        setManagementDropdownOpen(false);
        setAttendanceDropdownOpen(false);
    };

 
    return (
        <div className="layout">
            <div className="top-header">
                <div className="header-left">
                    <img src={logo} alt="Zeno Fuel Station Logo" className="logo" />
                </div>
                <h1 className="company-name">ZENO FUEL STATION</h1>
                <div className="header-right">
                    <img src={profilePhotoUrl} alt="Profile" className="profile-photo" onClick={handleProfileMenuToggle} />
                    {profileMenuOpen && (
                        <div className="profile-menu">
                            <button onClick={handleMyProfileClick}>My Profile</button>
                            <button onClick={handleEditProfileClick}>Edit Profile</button>
                            <button onClick={handleChangePasswordClick}>Change Password</button>
                            <button onClick={handleSignOutClick}>Sign Out</button>
                        </div>
                    )}
                </div>
            </div>
      <div className="management-headers">
        <ul>
        <li><Link to="/worker-welcome" className={location.pathname === '/worker-welcome' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/worker-welcome/attendance-management" className={location.pathname === '/attendance-marking' ? 'active' : ''}>Attendance Marking</Link></li>
          <li><Link to="/worker-welcome/leave" className={location.pathname === '/leave-request' ? 'active' : ''}>Leave Requesting</Link></li>
          <li><Link to="/worker-welcome/worker-sales" className={location.pathname === '/worker-sales' ? 'active' : ''}>Fuel Sales</Link></li>
        </ul>
      </div>
      <div className="main-content">
                <Outlet /> 
                {editProfileOpen && (
                    <EditProfileForm 
                        onClose={handleCloseEditProfile} 
                        onProfileUpdated={handleProfileUpdated} 
                        userRole={userRole} // Pass user role
                        currentProfilePhoto={profilePhotoUrl} // Pass the current profile photo
                        setProfilePhotoUrl={setProfilePhotoUrl} // Pass the function to update the photo
                    />
                    
                )}
                {changePasswordOpen && (
                    <ChangePasswordForm onClose={handleCloseChangePassword} />
                )}
                {myProfileOpen && (
                    <MyProfileForm onClose={handleCloseMyProfile} />
                )}
                {signOutConfirmationOpen && (
                    <div className="signout-confirmation">
                        <p>Are you sure you want to sign out?</p>
                        <button onClick={handleConfirmSignOut}>Yes</button>
                        <button onClick={handleCloseSignOutConfirmation}>No</button>
                    </div>
                )}
            </div>
        </div>
    );
};


export default LayoutWorker;
