import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DisplayPackages.css';

const DisplayPackages = () => {
    const [packages, setPackages] = useState([]);
    const [error, setError] = useState(null); // State to handle error

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                // Assuming you have the auth token stored in localStorage or a similar place
                const token = localStorage.getItem('token'); 
                
                const response = await axios.get('http://localhost:5000/packages/get-packages', {
                    headers: {
                        'Authorization': `Bearer ${token}` // Passing the token in the Authorization header
                    }
                });
                setPackages(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    // Handle 401 Unauthorized error
                    setError('You are not authorized. Please log in.');
                    // Optionally redirect to login page, or refresh the token if available
                } else {
                    setError('Error fetching packages. Please try again later.');
                }
                console.error('Error fetching packages:', error);
            }
        };

        fetchPackages();
    }, []);

    return (
        <div>
            <div className="container">
                <h4 className="heading">Our Packages</h4>
                {error ? ( // Display error if any
                    <p className="error-message">{error}</p>
                ) : (
                    <div className="row">
                        {packages.map((pkg) => (
                            <div className="card" key={pkg._id}>
                                <img src={pkg.packageImage} alt={pkg.packageName} className="card-img" />
                                <div className="card-body">
                                    <h5 className="card-title">{pkg.packageName}</h5>
                                    <p className="card-text">{pkg.packageDescription}</p>
                                    <p className="card-text"><strong>Services:</strong> {pkg.services.join(', ')}</p>
                                    <p className="card-text"><strong>Price:</strong> ${pkg.packagePrice.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayPackages;
