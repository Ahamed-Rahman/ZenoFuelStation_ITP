import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import forgotPasswordImg from '../../assets/images/forgot-password.png'; // Import the image

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Clear any existing error message
        try {
            const response = await axios.post('http://localhost:5000/api/forgot-password/request-code', { email });
            console.log('Response:', response.data); 
            
            // Navigate to the verification page with the provided email
            navigate(`/verification?email=${email}`);
        } catch (err) {
            // Log the entire error object for debugging
            console.error('Error occurred during the request:', err);
            
            // Set error message based on the available information
            setError(err.response?.data?.message || 'An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='forgot-password-page'>
        <div className="forgot-password-container">
            <h1>Forgot Password</h1>
            <div className="forgot-password-content">
                <div className="forgot-password-image" style={{ backgroundImage: `url(${forgotPasswordImg})` }}></div>
                <p>Enter your email address to receive a verification code</p>
                <div className="forgot-password-form">
                    <form onSubmit={handleSubmit}>
                        <div className="shakee-form-group">
                            <input
                                type="email"
                                value={email}
                                class='forgot1'
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="shakee-form-group">
                            <button type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                        </div>
                        {error && <p className="error">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
        </div>
    );
};

export default ForgotPassword;