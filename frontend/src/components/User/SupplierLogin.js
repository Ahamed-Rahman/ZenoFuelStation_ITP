import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './SupplierRegister.css';

const SupplierLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Client-side validation
    if (!email || !password) {
      Swal.fire('Error', 'Please enter both email and password.', 'error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/supplierRoutes/login', { email, password });
      const token = response.data.token;
      localStorage.setItem('token', token); // Store the token here
      Swal.fire('Success', 'Logged in successfully', 'success');
      navigate('/SupplierDashboard'); // Redirect after login
    } catch (error) {
      console.error('Login error:', error); // Log the error for debugging
      Swal.fire('Error', error.response?.data?.message || 'Invalid credentials or server error', 'error');
    }
  };

  return (
    <div>
      <h1>Supplier Login</h1>
      <div className="Supplier">
      <label>Email:</label>
      <input 
        type="email" 
        className="SupplierText"
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      
      <label>Password:</label>
      <input 
        type="password" 
        className="SupplierText"
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      
      <button className="SupplierBtn" onClick={handleLogin}>Login</button>
    </div>
    </div>
  );
};

export default SupplierLogin;
