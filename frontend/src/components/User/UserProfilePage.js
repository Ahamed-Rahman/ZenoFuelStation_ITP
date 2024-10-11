import React, { useState } from 'react';
import EditProfileForm from './EditProfileForm'; // Adjust the path as needed

const UserProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);

    const handleProfileUpdated = () => {
        // Logic to handle profile update, e.g., refetching user data
        console.log('Profile has been updated.');
    };

    const handleClose = () => {
        setIsEditing(false); // Close the form
    };

    return (
        <div>
            <h1>User Profile</h1>
            {/* Other profile information display */}
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            
            {isEditing && (
                <EditProfileForm
                    onClose={handleClose}
                    userRole="Admin" // Replace with actual role
                    onProfileUpdated={handleProfileUpdated}
                />
            )}
        </div>
    );
};

export default UserProfilePage;
