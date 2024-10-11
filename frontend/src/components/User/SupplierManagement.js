import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './SupplierManagement.module.css'; // Adjust the path as needed
import { Link } from 'react-router-dom';
import SidebarUser from './SidebarUser';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({ companyName: '', email: '' });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const token = localStorage.getItem('token'); // Retrieve token from local storage or state

  // Fetch suppliers only when the component mounts or token changes
  useEffect(() => {
    if (token) {
      setLoading(true); // Trigger loading state
      axios.get('http://localhost:5000/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setSuppliers(response.data);
          setLoading(false); // Set loading to false once data is fetched
        })
        .catch(error => {
          console.error('Error fetching suppliers:', error);
          setLoading(false); // Handle error case
        });
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showAddForm) {
      setNewSupplier({ ...newSupplier, [name]: value });
    } else if (showEditForm && editingSupplier) {
      setEditingSupplier({ ...editingSupplier, [name]: value });
    }
  };

  const handleAddSupplier = () => {
    axios.post('http://localhost:5000/api/suppliers', newSupplier, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setSuppliers([...suppliers, response.data]);
        setNewSupplier({ companyName: '', email: '' });
        setShowAddForm(false);
      })
      .catch(error => console.error('Error adding supplier:', error));
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setShowEditForm(true);
  };

  const handleUpdateSupplier = () => {
    axios.put(`http://localhost:5000/api/suppliers/${editingSupplier._id}`, editingSupplier, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setSuppliers(suppliers.map(supplier => (supplier._id === response.data._id ? response.data : supplier)));
        setEditingSupplier(null);
        setShowEditForm(false);
      })
      .catch(error => console.error('Error updating supplier:', error));
  };

  const handleDeleteSupplier = (id) => {
    axios.delete(`http://localhost:5000/api/suppliers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setSuppliers(suppliers.filter(supplier => supplier._id !== id));
      })
      .catch(error => console.error('Error deleting supplier:', error));
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarUser>
      <div className={styles.shakeekaUserManagement}>
        <div className={styles.shakeekaUserHeader}>
          <h1 className={styles.shakeekainventoryTitle}>Supplier Management</h1>
        </div>

        <div className={styles.shakeekainventoryActionsTop}>
          <div className={styles.shakeekasearchBarContainer}>
            <input
              type="text"
              placeholder="Search by supplier name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.AhamedSearch}
            />
          </div>
        </div>

        <div className={styles.inventoryActions}>
          <button className={styles.Shakbutton} onClick={() => setShowAddForm(true)}>Add Supplier</button>
        </div>

        {showAddForm && (
          <div className={styles.shakeeformOverlayUser}>
            <div className={styles.shakeeformContainerUser}>

            <div className={styles.shakeefirst}>
              <h2>Add Supplier</h2>
              <input
                type="text"
                name="companyName"
                value={newSupplier.companyName}
                className={styles.shakeefield}
                onChange={handleInputChange}
                placeholder="Company Name"
              />
              <input
                type="email"
                name="email"
                value={newSupplier.email}
                onChange={handleInputChange}
                className={styles.shakeefield1}
                placeholder="Email"
              />
              <button className={styles.shakeesaveButton} onClick={handleAddSupplier}>Add Supplier</button>
              <button className={styles.shakeecancelButton} onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </div>
          </div>
        )}

        {showEditForm && editingSupplier && (
          <div className={styles.shakeekaformOverlayUser}>
            <div className={styles.formContainerUser}>
              <h2>Edit Supplier</h2>
              <input
                type="text"
                name="companyName"
                value={editingSupplier.companyName}
                onChange={handleInputChange}
                placeholder="Company Name"
              />
              <input
                type="email"
                name="email"
                value={editingSupplier.email}
                onChange={handleInputChange}
                placeholder="Email"
              />
              <button className={styles.saveButton} onClick={handleUpdateSupplier}>Update Supplier</button>
              <button className={styles.cancelButton} onClick={() => setShowEditForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading suppliers...</p>
        ) : (
          <table className={styles.shakeekainventoryTables}>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td>{supplier.companyName}</td>
                  <td>{supplier.email}</td>
                  <td>
                    <button
                      className={styles.shakeekaeditsbutton}
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.shakeekadeletesbutton}
                      onClick={() => handleDeleteSupplier(supplier._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.generateReportContainer}>
        <Link to="/generate-report" className={styles.generateReportButton}>
          Generate Report
        </Link>
      </div>
    </SidebarUser>
  );
};

export default SupplierManagement;
