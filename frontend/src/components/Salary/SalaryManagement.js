import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from './SalaryManagement.module.css'; // Assuming you create this CSS file

const SalaryManagement = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalaryData = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:5000/api/salary-management', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching salary data');
        }

        const data = await response.json();
        setSalaryData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryData();
  }, []);

  const handleEditSalary = async (username) => {
    const user = salaryData.find((u) => u.username === username);

    const { value: newFinalSalary } = await Swal.fire({
      title: 'Edit Final Salary',
      input: 'number',
      inputLabel: 'Enter new final salary',
      inputPlaceholder: 'Final salary',
      showCancelButton: true,
    });

    if (newFinalSalary) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/salary-management/update-final-salary/${username}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ finalSalary: newFinalSalary }),
        });

        if (!response.ok) {
          throw new Error('Error updating salary');
        }

        const updatedUser = await response.json();
        setSalaryData(
          salaryData.map((user) =>
            user.username === username
              ? { ...user, finalSalary: updatedUser.finalSalary }
              : user
          )
        );
        Swal.fire('Success!', 'Final salary updated successfully.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to update salary.', 'error');
      }
    }
  };

  const handleDeleteUser = (username) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`http://localhost:5000/api/salary-management/delete-user/${username}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Error deleting user');
          }

          setSalaryData(salaryData.filter((user) => user.username !== username));
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete user.', 'error');
        }
      }
    });
  };

  const calculateFinalSalary = (basicSalary, totalLeaves) => {
    const maxAllowedLeaves = 4;
    const effectiveLeaves = totalLeaves > maxAllowedLeaves ? totalLeaves - maxAllowedLeaves : 0;
    const dailySalary = basicSalary / 30;
    return basicSalary - dailySalary * effectiveLeaves;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.salaryTableContainer}>
      <h2>Salary Management</h2>
      <table className={styles.salaryTable}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Basic Salary</th>
            <th>Total Leaves</th>
            <th>Final Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaryData.map((user) => (
            <tr key={user.username}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{user.basicSalary}</td>
              <td>{user.totalLeaves}</td>
              <td>{user.finalSalary.toFixed(2)}</td>
              <td>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditSalary(user.username)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteUser(user.username)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalaryManagement;
