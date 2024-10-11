import React, { useState } from 'react';
import styles from './ChangePasswordForm.module.css'; // Ensure this path is correct
import { toast } from 'react-toastify'; // Make sure to install and import react-toastify

const ChangePasswordForm = ({ onClose }) => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false); // State to handle loading

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New password and confirmation do not match.');
            return;
        }

        setLoading(true); // Start loading

        try {
            const token = localStorage.getItem('token'); // Ensure this is the correct key for your token

            const response = await fetch('http://localhost:5000/api/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Include token in headers
                },
                body: JSON.stringify({
                    oldPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Password changed successfully!');
                onClose();
            } else {
                toast.error(result.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('An error occurred while changing the password. Please try again.');
        } finally {
            setLoading(false); // End loading
        }
    };

    return (
        <div className={styles.changePasswordFormWrapper}>
            <div className={styles.changePasswordForm}>
                <h2>Change Password</h2>
                <form onSubmit={handleSubmit} className={styles.formHorizontal}>
                    <div className={styles.formRows}>
                        <div className={styles.formGroup}>
                            <label>Current Password:</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.formRows}>
                    <div className={styles.formGroup}>
                            <label>New Password:</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.formRows}>
                    <div className={styles.formGroup}>
                            <label>Confirm Password:</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.formButtons}>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordForm;
