import React, { useState } from 'react';
import styles from './Login.module.css'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';



  const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // New state to toggle password visibility
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
    
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
    
        const data = await response.json();
        console.log('Login response:', data); // Log the response
    
        if (response.ok) {
          localStorage.setItem('token', data.token);
          console.log('Token stored:', data.token); // Log the token
    
          const decodedToken = jwtDecode(data.token);
          console.log('Decoded token:', decodedToken); // Log the decoded token
          const userRole = decodedToken.role;
    
          switch (userRole) {
            case 'Admin':
              navigate('/admin-welcome');
              break;
            case 'Manager':
              navigate('/manager-welcome');
              break;
            case 'Worker':
              navigate('/worker-welcome');
              break;
            default:
              setError('Unknown role. Please contact support.');
          }
        } else {
          setError(data.error || 'Login failed. Please try again.');
        }
      } catch (error) {
        setError('An error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
  
    return (
      <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.ImageWrapper}>
          <div className={styles.loginImage}></div>
        </div>
        <div className={styles.shakeekaformWrapper}>
          <div className={styles.loginFormContainer}>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <h2 className={styles.loginTitle}>Login</h2>
              <div className={styles.shakeekaformGroup}>
                <input
                  type="text"
                  id="username"
                  className={styles.shakeeLogin1}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <input
                type={showPassword ? 'text' : 'password'} // Toggle input type based on showPassword state
               
                  id="password"
                  placeholder="Password"
                  className={styles.shakeeLogin1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
                >
                  {showPassword ? '🙈' : '👁️'} {/* Emoji for the eye icon */}
                </span>
              </div>
              {error && <p className={styles.errorMessage}>{error}</p>}
              <div className={styles.forgotPassword}>
                <span onClick={() => navigate('/forgot-password')}>
                  Forgot your password?
                </span>
              </div>
              
              <button type="submit" className={styles.loginButton} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
        <div className={styles.separator}></div>
      </div>
      </div>
    );
    
    
  };
  
  export default Login;