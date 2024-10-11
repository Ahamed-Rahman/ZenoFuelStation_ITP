// frontend/src/components/UserManagement.js
import SidebarUser from './SidebarUser';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './UserManagement.module.css';
import Swal from 'sweetalert2'; // Import SweetAlert2
import jsPDF from 'jspdf'; // Import jsPDF
import 'jspdf-autotable'; // Import jsPDF autoTable plugin
import logoImage from '../../assets/images/logo.png';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Manager',
    basicSalary: 0, // Add basicSalary to the form state
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // New state for role filter

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('create')) {
      setCreatingUser(true);
    }
  }, [location.search]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Fetched users:', data);
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setUsers([]);
      });
  }, []);

  const handleCreateUser = () => {
    if (validateFormData()) {
      const { username, email, password, role, basicSalary } = formData; // Include basicSalary
      const token = localStorage.getItem('token');

      fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, password, role, basicSalary }), // Include basicSalary
      })
        .then(response => response.json())
        .then(data => {
          console.log('Created user:', data);
          setUsers([...users, data]);
          setCreatingUser(false);
          setFormData({ username: '', email: '', password: '', role: 'Manager', basicSalary: 0 }); // Reset basicSalary
          Swal.fire('Success!', 'Account created successfully', 'success'); // Use SweetAlert
        })
        .catch(error => {
          console.error('Error creating user:', error);
          Swal.fire('Error!', 'There was an error creating the user.', 'error'); // Error alert
        });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      basicSalary: user.basicSalary || 0, // Load basicSalary from user data
    });
    setCreatingUser(true);
  };

  const handleDeleteUser = (userId) => {
    const token = localStorage.getItem('token');

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => response.json())
          .then(() => {
            setUsers(users.filter(user => user._id !== userId));
            Swal.fire('Deleted!', 'User deleted successfully', 'success'); // Success alert
          })
          .catch(error => {
            console.error('Error deleting user:', error);
            Swal.fire('Error!', 'There was an error deleting the user.', 'error'); // Error alert
          });
      }
    });
  };

  const handleUpdateUser = () => {
    if (validateFormData()) {
      const { username, email, password, role, basicSalary } = formData; // Include basicSalary
      const token = localStorage.getItem('token');

      fetch(`http://localhost:5000/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, password, role, basicSalary }), // Include basicSalary
      })
        .then(response => response.json())
        .then((updatedUser) => {
          setUsers(users.map(user => user._id === editingUser._id ? updatedUser : user));
          setCreatingUser(false);
          setEditingUser(null);
          setFormData({ username: '', email: '', password: '', role: 'Manager', basicSalary: 0 }); // Reset basicSalary
          Swal.fire('Updated!', 'User updated successfully', 'success'); // Success alert
        })
        .catch(error => {
          console.error('Error updating user:', error);
          Swal.fire('Error!', 'There was an error updating the user.', 'error'); // Error alert
        });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const closeForm = () => {
    setCreatingUser(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'Manager', basicSalary: 0 }); // Reset basicSalary
  };

  const validateFormData = () => {
    const { username, email, password } = formData;
    const usernameExists = users.some(user => user.username === username && (!editingUser || user._id !== editingUser._id));
    const emailExists = users.some(user => user.email === email && (!editingUser || user._id !== editingUser._id));

    // Basic email validation using regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailPattern.test(email);

    if (usernameExists) {
      Swal.fire('Error!', 'Username already exists. Please choose a different username.', 'error'); // Error alert
      return false;
    }

    if (emailExists) {
      Swal.fire('Error!', 'Email already exists. Please choose a different email.', 'error'); // Error alert
      return false;
    }

    if (!isValidEmail) {
      Swal.fire('Error!', 'Please enter a valid email address.', 'error');
      return false;
    }

    if (password && password.length < 6) {
      Swal.fire('Error!', 'Password must be at least 6 characters long.', 'error'); // Error alert
      return false;
    }

    return true;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Add the logo at the top-left corner
    const logo = new Image();
    logo.src = logoImage; // The imported logo image
    const logoSize = 30;
    doc.addImage(logo, 'PNG', 10, 5, logoSize, logoSize); // Adjust the position and size for the logo
  
    // Center the title below the logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 116, 166);
    doc.text('User Management Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
  
    // Define table columns and rows
    const filteredUsers = users
      .filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()) && (roleFilter === '' || user.role === roleFilter));
  
    const tableColumn = ['ID', 'Username', 'Email', 'Role', 'Basic Salary'];
    const tableRows = [];
  
    filteredUsers.forEach((user, index) => {
      const rowData = [
        index + 1,
        user.username,
        user.email,
        user.role,
        user.basicSalary || 0
      ];
      tableRows.push(rowData);
    });
  
    // Add table to PDF with grid theme for better presentation
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50, // Adjusted to fit logo and title
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        textColor: [40, 40, 40],
        lineColor: [216, 216, 216],
        lineWidth: 0.1,
        cellPadding: 4, // Adds padding for better readability
      },
      headStyles: {
        fillColor: [40, 116, 166],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center', // Center-align headers
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
        valign: 'middle',
        halign: 'center', // Center-align text in the body
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
    });
  
    // Calculate the total number of Manager and Worker accounts
    const managerCount = filteredUsers.filter(user => user.role === 'Manager').length;
    const workerCount = filteredUsers.filter(user => user.role === 'Worker').length;
  
    let lastY = doc.autoTable.previous.finalY || 50;
  
    // Check if a new page is needed for totals
    const pageHeight = doc.internal.pageSize.height;
    if (lastY + 50 > pageHeight) {
      doc.addPage();
      lastY = 20;
    }
  
    lastY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Total number of Manager accounts: ${managerCount}`, 14, lastY);
    doc.text(`Total number of Worker accounts: ${workerCount}`, 14, lastY + 10);
  
    // Add a thank-you message
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for reviewing the user management report. Please contact us if you need further information.', 14, lastY + 30);
  
    // Save the PDF with a meaningful name
    doc.save('user_management_report.pdf');
  };
  
  return (
    <SidebarUser>
      <div className={styles.shakeekafullPage}>
        <div className={styles.shakeekapageContainer}>
          <div className={styles.shakeekabackground}></div>
          <div className={styles.shakeekabackgroundOverlay}></div>
          <div className={styles.shakeekaUserManagement}>
            <div className={styles.shakeekaUserHeader}>
              <h1 className={styles.shakeekainventoryTitle}>User Management</h1>
            </div>

            <div className={styles.shakeekainventoryActionsTop}>
              <div className={styles.shakeekasearchBarContainer}>
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchTerm}
                  className={styles.AhamedSearch}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Add role filter dropdown */}
              <div className={styles.shakeekaroleFilterContainer}>
                <select
                  value={roleFilter}
                  className={styles.AhamedFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All roles</option>
                  <option value="Manager">Manager</option>
                  <option value="Worker">Worker</option>
                </select>
              </div>
            </div>

            {creatingUser && (
              <div className={styles.shakeekabackdrop} onClick={closeForm}></div>
            )}

            {creatingUser && (
              <div className={styles.shakeekaformOverlayUser}>
                <div className={styles.shakeekaformContainerUser}>
                  <h3>{editingUser ? 'Edit User' : 'Create User'}</h3>

                  <div className={styles.first}>
                    <form>
                      <label>
                        Username:
                        <input
                          type="text"
                          name="username"
                          className={styles.shakeekafield}
                          value={formData.username}
                          onChange={handleInputChange}
                        />
                      </label>
                      <label>
                        Email:
                        <input
                          type="email"
                          name="email"
                          className={styles.shakeekafield}
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </label>
                      <label>
                        Password:
                        <input
                          type="password"
                          name="password"
                          className={styles.shakeekafield}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                        />
                      </label>
                      <label>
                        Role:
                        <select
                          name="role"
                          value={formData.role}
                          className={styles.shakeekafield1}
                          onChange={handleInputChange}
                        >
                          <option value="Manager">Manager</option>
                          <option value="Worker">Worker</option>
                        </select>
                      </label>
                      <label>
                        Basic Salary:
                        <input
                          type="number"
                          name="basicSalary"
                          className={styles.shakeekafield}
                          value={formData.basicSalary}
                          onChange={handleInputChange}
                        />
                      </label>
                      <div className={styles.shakeekabuttonContainer}>
                        <button
                          className={styles.shakeekasaveButton}
                          type="button"
                          onClick={editingUser ? handleUpdateUser : handleCreateUser}
                        >
                          {editingUser ? 'Update' : 'Save'}
                        </button>
                        <button className={styles.shakeekacancelButton} type="button" onClick={closeForm}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Render user table */}
            <table className={styles.shakeekainventoryTables}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Basic Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(user => 
                    user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (roleFilter === '' || user.role === roleFilter) // Apply role filter
                  )
                  .map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.basicSalary || 0}</td> {/* Display basicSalary */}
                      <td>
                        <button className={styles.shakeekaeditsbutton} onClick={() => handleEditUser(user)}>Edit</button>
                        <button className={styles.shakeekadeletesbutton} onClick={() => handleDeleteUser(user._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <button onClick={generatePDF} className={styles.shakeekaGenerateReportButton}>
              Generate Report
            </button>
            
          </div>
        </div>
      </div>
    </SidebarUser>
  );
};

export default UserManagement;
