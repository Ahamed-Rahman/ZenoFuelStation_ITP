import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Verification.module.css';
import verificationImg from '../../assets/images/verification.png'; // Import the image

const Verification = () => {
    const [code, setCode] = useState(['', '', '', '']); // State for four separate input boxes
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailFromParams = queryParams.get('email');

        if (emailFromParams) {
            setEmail(emailFromParams);
        } else {
            navigate('/forgot-password');
        }
    }, [location.search, navigate]);

    const handleChange = (e, index) => {
        const { value } = e.target;
        const newCode = [...code];
        newCode[index] = value.slice(0, 1); // Ensure only one character per box
        setCode(newCode);

        // Move to the next input field if not at the last field
        if (index < 3 && value) {
            const nextField = document.getElementById(`code-${index + 1}`);
            if (nextField) nextField.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join('');
        try {
            const response = await axios.post('http://localhost:5000/api/forgot-password/verify-code', { email, code: verificationCode });
            
            const { token } = response.data; // Backend returns the token
            navigate(`/reset-password/${token}`); // Navigate to reset password with the token
            
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className={styles.verificationPage}>
        <div className={styles.verificationContainer}>
            <h1>Verification</h1>
            <div className={styles.verificationContent}>
                <div className={styles.verificationImage} style={{ backgroundImage: `url(${verificationImg})` }}></div>
                <p>Enter the verification code sent to your email</p>
                <form onSubmit={handleSubmit} className={styles.verificationForm}>
                    <div className={styles.codeInputs}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                id={`code-${index}`}
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                maxLength="1"
                                placeholder=" "
                            />
                        ))}
                    </div>
                    <button type="submit">Submit</button>
                    <p>If you didn't receive a code, <button type="button" onClick={() => navigate('/forgot-password')}>Resend</button></p>
                    {error && <p className={styles.serror}>{error}</p>}
                </form>
            </div>
        </div>
        </div>
    );
};

export default Verification;
