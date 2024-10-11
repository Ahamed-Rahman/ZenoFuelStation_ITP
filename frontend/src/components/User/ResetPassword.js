import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ResetPassword.module.css';// Ensure to import the CSS file
import resetImg from '../../assets/images/reset.png'; // Import the image

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams(); // Extract token from URL parameters

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/forgot-password/reset-password', {
                token,
                newPassword,
            });
            navigate('/'); // Redirect to login after successful reset
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    
       
    return (
        <div className={styles.resetPage}>
            <div className={styles.resetPasswordContainer}>
                <h1>Reset Password</h1>
                <div className={styles.resetPasswordContent}>
                    <div
                        className={styles.resetPasswordImage}
                        style={{ backgroundImage: `url(${resetImg})` }}
                    ></div>
                    <p>Enter your new password below</p>
                    <form onSubmit={handleSubmit} className={styles.resetPasswordForm}>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="New Password"
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm Password"
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        {error && <p className={styles.error}>{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};
export default ResetPassword;
