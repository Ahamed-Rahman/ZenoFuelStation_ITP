import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PropTypes from 'prop-types';
import styles from './UserTable.module.css';
import SidebarUser from './SidebarUser';
import html2canvas from 'html2canvas';
import logoImage from '../../assets/images/logo.png';
import bgdImage from '../../assets/images/simple.jpg'; 
import Swal from 'sweetalert2'; // Import SweetAlert
import EditProfileForm from './EditProfileForm';


const UserTable = ({ userRole }) => {
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState(''); // Dropdown for role filter
    const [usernameFilter, setUsernameFilter] = useState(''); // Filter by username
    const [firstNameFilter, setFirstNameFilter] = useState(''); // Filter by first name

    const [selectedUser, setSelectedUser] = useState(null); // Store the selected user for report generation
    const [showForm, setShowForm] = useState(false); // Control form visibility
    const [disabledUsers, setDisabledUsers] = useState(() => {
        const storedDisabledUsers = localStorage.getItem('disabledUsers');
        return storedDisabledUsers ? JSON.parse(storedDisabledUsers) : {};
    });


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const filteredUsers = userRole === 'Manager'
                    ? response.data.filter(user => user.role === 'Worker')
                    : response.data; 

                setUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [userRole]);

    // This useEffect checks if the profile has been updated (via the timestamp) and re-enables the button
    useEffect(() => {
        const profileUpdatedTimestamp = localStorage.getItem('profileUpdatedTimestamp');
        if (profileUpdatedTimestamp) {
            // Re-enable all buttons when the profile has been updated
            const updatedDisabledUsers = {};
            users.forEach(user => {
                updatedDisabledUsers[user._id] = false;
            });
            setDisabledUsers(updatedDisabledUsers);
            localStorage.setItem('disabledUsers', JSON.stringify(updatedDisabledUsers));
        }
    }, [users]); // The effect runs when the users list is updated


    // Apply filters for role, username, and first name
    const filteredUsers = users.filter((user) => {
        const matchesRole = roleFilter ? user.role.toLowerCase() === roleFilter.toLowerCase() : true;
        const matchesUsername = usernameFilter ? user.username.toLowerCase().includes(usernameFilter.toLowerCase()) : true;
        const matchesFirstName = firstNameFilter ? user.firstName.toLowerCase().includes(firstNameFilter.toLowerCase()) : true;
        return matchesRole && matchesUsername && matchesFirstName;
    });

    // Function to generate PDF report excluding the "Actions" column
    const generatePDF = async () => {
        const doc = new jsPDF();
    
        // Add the logo to the PDF
        const logoSize = 30;
        doc.addImage(logoImage, 'PNG', 10, 5, logoSize, logoSize); // Adjust position and size for the logo
    
        // Center the title below the logo
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(40, 116, 166);
        doc.text('User Details Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    
        // Define table columns excluding "Actions"
        const tableColumn = [
            'Profile Photo',
            'First Name',
            'Last Name',
            'Username',
            'Email',
            'Account No',
            'Bank Name',
            'Bank Details',
            'Role',
        ];
    
        // Function to load image and convert to Base64
        const loadImageAsBase64 = (url) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const base64String = canvas.toDataURL('image/jpeg');
                    resolve(base64String);
                };
                img.onerror = (error) => {
                    reject(error);
                };
                img.src = url;
            });
        };
    
        // Preload images and convert to Base64 before generating the table
        const usersWithImages = await Promise.all(
            filteredUsers.map(async (user) => {
                const profilePhotoUrl = user.profilePhoto || '/assets/default-profile.png';
                try {
                    const base64Image = await loadImageAsBase64(profilePhotoUrl);
                    return { ...user, profilePhotoBase64: base64Image };
                } catch (error) {
                    console.error('Error loading profile photo for', user.username, error);
                    return { ...user, profilePhotoBase64: null }; // Fallback in case of error
                }
            })
        );
    
        // Load images and add rows to the table
        const tableRows = usersWithImages.map((user) => {
            return [
                user.profilePhotoBase64 ? 'Yes' : 'No', // Placeholder for the image
                user.firstName,
                user.lastName,
                user.username,
                user.email,
                user.accountNo,
                user.bankName,
                user.bankDetails,
                user.role,
            ];
        });
    
        // Add table to PDF with custom column widths and text alignment
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50, // Adjust startY to accommodate logo and title
            theme: 'grid',
            margin: { left: 20 }, 
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' }, // Profile Photo column (centered)
                1: { cellWidth: 15 }, // First Name
                2: { cellWidth: 15 }, // Last Name
                3: { cellWidth: 20 }, // Username
                4: { cellWidth: 33 }, // Email (wider)
                5: { cellWidth: 25 }, // Account No
                6: { cellWidth: 15 }, // Bank Name
                7: { cellWidth: 15 }, // Bank Details
                8: { cellWidth: 15 }, // Role
            },
            didDrawCell: (data) => {
                if (data.column.index === 0 && data.row.section === 'body') {
                    const userIndex = data.row.index;
                    const user = usersWithImages[userIndex];
                    if (user.profilePhotoBase64) {
                        const imgWidth = 10; // Set image width
                        const imgHeight = 10; // Set image height
                        const xOffset = data.cell.x + (data.cell.width - imgWidth) / 2; // Center horizontally
                        const yOffset = data.cell.y + (data.cell.height - imgHeight) / 2; // Center vertically
    
                        doc.addImage(user.profilePhotoBase64, 'JPEG', xOffset, yOffset, imgWidth, imgHeight); // Add image inside the cell
                    }
                }
            },
            styles: {
                font: 'helvetica',
                fontSize: 5,
                textColor: [40, 40, 40],
                lineColor: [216, 216, 216],
                lineWidth: 0.1,
                cellPadding: 4,
            },
            headStyles: {
                fillColor: [40, 116, 166],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
            },
            bodyStyles: {
                fillColor: [245, 245, 245],
                valign: 'middle',
                halign: 'left', // Align text to the left for readability
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255],
            },
        });
    
        // Save the PDF
        doc.save('user_details_report_with_photos.pdf');
    };
    
    


    const generateIDCard = (user, shouldDownload = true) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const cardWidth = 180;
        const cardHeight = 95;
        const cardX = (pageWidth - cardWidth) / 2;
        const marginTop = 20;
    
        doc.addImage(bgdImage, 'JPG', cardX - 5, marginTop - 5, cardWidth + 10, cardHeight + 10);
        const logoSize = 30;
        const logoX = cardX + 10;
        doc.addImage(logoImage, 'PNG', logoX, marginTop, logoSize, logoSize);
        const textXOffset = 30;
        const textX = cardX + textXOffset;
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Name: ${user.firstName} ${user.lastName}`, textX, marginTop + 60);
        const usernameX = cardX + 79;
        doc.setFontSize(18);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text(`${user.username}`, usernameX, marginTop + 43);
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Email: ${user.email}`, textX, marginTop + 70);
        doc.text(`Contact: ${user.contact}`, textX, marginTop + 80);
        doc.text(`Account No: ${user.accountNo}`, textX + 70, marginTop + 70);
        doc.text(`Bank Details: ${user.bankDetails}`, textX + 70, marginTop + 80);
        doc.text(`Bank Name: ${user.bankName}`, textX + 70, marginTop + 60);
        const centerX = (doc.internal.pageSize.width - 20) / 2;
        const imageUrl = user.profilePhoto.startsWith('http')
            ? user.profilePhoto
            : `http://localhost:5000${user.profilePhoto}`;
        doc.addImage(imageUrl, 'JPG', centerX, marginTop + 10, 25, 25);
    
        if (shouldDownload) {
            doc.save(`${user.username}_ID_Card.pdf`); // Download the PDF if shouldDownload is true
        }
    
        // Return the base64 string for emailing without downloading
        return doc.output('datauristring').split(',')[1]; // Return the base64 string of the PDF

        
    };
    

    const handleDownloadPDF = () => {
        if (selectedUser) {
            generateIDCard(selectedUser);
        }
    };
    const handleSendEmail = async () => {
        if (selectedUser) {
            try {
                // Generate the PDF as base64 without downloading
                const pdfBase64 = generateIDCard(selectedUser, false); // Pass false to prevent downloading
    
                const email = selectedUser.email;
    
                // Retrieve token from localStorage (or wherever it's stored)
                const token = localStorage.getItem('token'); // Ensure token is being stored correctly
    
                // Check if token exists
                if (!token) {
                    alert('Authentication token not found. Please log in.');
                    return;
                }
    
                // Send the base64 PDF to the backend, including the token in the Authorization header
                await axios.post('http://localhost:5000/api/send-pdf-email', {
                    email,
                    pdf: pdfBase64, // Send base64 PDF to backend
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Add the token in the Authorization header
                    },
                });
    
                // SweetAlert for successful email sending
                Swal.fire('Success', 'Email sent successfully!', 'success');
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    Swal.fire('Unauthorized', 'Please log in and try again.', 'warning');
                } else {
                    Swal.fire('Error', 'An error occurred while sending the email. Please try again.', 'error');
                }
                console.error('Error sending email:', error);
            }
        }
    };
    
    
    const handleGenerateReport = (user) => {
        setSelectedUser(user);
        setShowForm(true);

        // Disable the button for this user after generating the report
        const updatedDisabledUsers = { ...disabledUsers, [user._id]: true };
        setDisabledUsers(updatedDisabledUsers);
        localStorage.setItem('disabledUsers', JSON.stringify(updatedDisabledUsers));
    };

    return (
        <SidebarUser>
            <div className="user-detail-container">
                <div className={styles.UserTableHead}>
                    <h2>{userRole === 'Admin' ? 'Admin User Details' : 'User Details'}</h2>
                </div>

                    {/* Filters Section */}
                    <div className={styles.shkfilterSection}>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className={styles.shkfilterSection2}
                    >
                        <option value="">All Roles</option>
                        <option value="Manager">Manager</option>
                        <option value="Worker">Worker</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search by Username"
                        value={usernameFilter}
                        className={styles.shkfilterSection3}
                        onChange={(e) => setUsernameFilter(e.target.value)}
                        
                    />
                    <input
                        type="text"
                        placeholder="Search by First Name"
                        value={firstNameFilter}
                        className={styles.shkfilterSection4}
                        onChange={(e) => setFirstNameFilter(e.target.value)}
                        
                    />
                </div>

                <table className={styles.shakeekaUserTables}>
                    <thead>
                        <tr>
                            <th>Profile Photo</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Account No</th>
                            <th>Bank Name</th>
                            <th>Bank Details</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.map((user)  => (
                            <tr key={user._id}>
                                <td>
                                    <img
                                        src={user.profilePhoto || '/assets/default-profile.png'}
                                        alt="Profile"
                                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                    />
                                </td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.accountNo}</td>
                                <td>{user.bankName}</td>
                                <td>{user.bankDetails}</td>
                                <td>{user.role}</td>
                                <td>
                                <button
                                        className={styles.shakeekaGenerateCardtButton}
                                        onClick={() => handleGenerateReport(user)}
                                        disabled={disabledUsers[user._id]} // Disable if true
                                        style={{
                                            backgroundColor: disabledUsers[user._id] ? 'gray' : 'blue',
                                            cursor: disabledUsers[user._id] ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {disabledUsers[user._id] ? 'Card Generated' : 'Generate Report'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Generate Report Button */}
                <div className={styles.shkgenerateReportContainer}>
                    <button onClick={generatePDF} className={styles.shkgenerateReportButton}>
                        Generate Report
                    </button>
                </div>

                {showForm && (
                    <div className={styles.modalBackground}>
                        <div className={styles.modalForm}>
                            <h3>{selectedUser.username}'s Profile</h3>
                            <img
                                src={selectedUser.profilePhoto || '/assets/default-profile.png'}
                                alt="Profile"
                                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
                            />
                            <div className={styles.shakeehoo}>
                            <button className={styles.ShakeeDownload}  onClick={handleDownloadPDF}>Download as PDF</button>
                            <button className={styles.ShakeeSend}  onClick={handleSendEmail}>Send to Email</button></div>
                          
                <div className={styles.shakeehum}>
                    <button className={styles.ShakeeClose} onClick={() => setShowForm(false)}>Close</button>
                </div>
            </div>
        </div>
                )}
            </div>
        </SidebarUser>
    );
};

UserTable.propTypes = {
    userRole: PropTypes.string.isRequired,
};

export default UserTable;
