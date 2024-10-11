import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Layout.css';
import EditProfileForm from './User/EditProfileForm';
import ChangePasswordForm from './User/ChangePasswordForm';
import MyProfileForm from './User/MyProfileForm'; 
import logo from '../assets/images/logo1.png';
import axios from 'axios';

const Layout = () => {
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
    const userRole = 'admin';


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
            <div className="management-header">
                <ul>
                    <li><Link to="/admin-welcome" className={location.pathname === '/admin-welcome' ? 'active' : ''}>Home</Link></li>
                
                    <li className="dropdown">
                        <Link
                            to="#"
                            onClick={handleAttendanceDropdownToggle}
                            className={location.pathname.includes('attendance') ? 'active' : ''}>
                            Attendance & Leave
                        </Link>
                        {attendanceDropdownOpen && (
                            <div className="dropdown-content">
                                <Link to="attendance" onClick={closeDropdown} className={location.pathname.includes('attendance') ? 'active' : ''}>Attendance Management</Link>
                                <Link to="leaveTable" onClick={closeDropdown} className={location.pathname.includes('leaveTable') ? 'active' : ''}>Leave Management</Link>
                            </div>
                        )}
                    </li>
                    <li><Link to="/admin-welcome/user-management" className={location.pathname.includes('user-management') ? 'active' : ''}>User Management</Link></li>
                    <li><Link to="/admin-welcome/inventory-first" className={location.pathname.includes('inventory-management') ? 'active' : ''}>Inventory Management</Link></li>
                    <li><Link to="/admin-welcome/sales-first" className={location.pathname.includes('sales-management') ? 'active' : ''}>Sales Management</Link></li>
                    <li><Link to="/admin-welcome/addPromo" className={location.pathname.includes('promotions-and-discounts') ? 'active' : ''}>Promotions and Discounts</Link></li>
                    <li><Link to="/admin-welcome/Salary" className={location.pathname.includes('salary-management') ? 'active' : ''}>Salary Management</Link></li>
                    <li><Link to="/admin-welcome/OrderNav" className={location.pathname.includes('order-management') ? 'active' : ''}>Order Management</Link></li>
                    
                    <li><Link to="/admin-welcome/view" className={location.pathname.includes('attendance-management') ? 'active' : ''}>Washstation Management</Link></li>
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

export default Layout;
