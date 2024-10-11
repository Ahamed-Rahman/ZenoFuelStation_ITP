import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './SupplierRegister.css';


const SupplierSelfRegister = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('/api/supplierRoutes/register-supplier', {
        companyName,
        email,
        password,
      });
  
      Swal.fire('Success', 'Supplier registered successfully', 'success');
      setCompanyName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error registering supplier:', error);
      Swal.fire('Error', error.response.data.error || 'Failed to register supplier', 'error');
    }
  };
  

  return (
    <div>
      <h2>Supplier Self-Registration</h2>
      <form className="Supplier" onSubmit={handleRegister}>
        <label>
          Company Name:
          <input
            type="text"
            className="SupplierText"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            className="SupplierText"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            className="SupplierText"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button   className="SupplierBtn" type="submit">Register</button>
      </form>
    </div>
  );
};

export default SupplierSelfRegister;
