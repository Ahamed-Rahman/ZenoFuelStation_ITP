// src/hooks/useFetchUserData.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchUserData = () => {
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        contact: '',
        accountNo: '',
        bankDetails: '',
        bankName: '',
        profilePhoto: '',
    });

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User not authenticated');
            }

            const response = await axios.get('http://localhost:5000/api/user-profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            setProfileData({
                ...response.data,
                profilePhoto: response.data.profilePhoto
                    ? `http://localhost:5000${response.data.profilePhoto}?t=${new Date().getTime()}`
                    : '/assets/images/default-profile.png',
            });
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return profileData; // Return the profile data to the component
};

export default useFetchUserData;
