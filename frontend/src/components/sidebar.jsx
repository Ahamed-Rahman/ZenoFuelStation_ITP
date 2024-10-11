import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBox, FaDollarSign, FaChartBar, FaSignOutAlt, FaPlus, FaList, FaListAlt } from 'react-icons/fa';

// Styled components
const SidebarContainer = styled.div`
  width: 220px;
  height: 150vh;
  background: linear-gradient(135deg, #00bcd4, #ff5722); /* Gradient background */
  padding: 20px;
  display: flex;
  flex-direction: column;
  color: #ecf0f1; /* Light text color */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* Add shadow for depth */
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 180px; /* Adjust width as needed */
  height: auto;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 15px;
  font-size: 18px;
  color: #fff; /* Section title color */
  text-transform: uppercase;
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 5px;
`;

const Menu = styled.div`
  flex-grow: 1;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 18px;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
  
  &:hover {
    background-color: #34495e; /* Darker background on hover */
    color: #fff;
  }
`;

const Icon = styled.div`
  margin-right: 15px;
  font-size: 20px;
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <LogoContainer>
        <LogoImage src="https://marketplace.canva.com/EAF6IJEU9Dk/2/0/1600w/canva-black-and-white-bold-typographic-car-wash-logo-oI-9VHzYZuo.jpg" alt="Fuel Station Logo" />
      </LogoContainer>
      <Menu>
        {/* Package Section */}
        <SectionTitle>Packages</SectionTitle>
        <Link to="/admin-welcome/view-packages" style={{ textDecoration: 'none', color: 'inherit' }}>
        <MenuItem>
          <Icon><FaListAlt /></Icon> {/* Icon for viewing packages */}
          View Packages
        </MenuItem>
      </Link>
      <Link to="/admin-welcome/add-package" style={{ textDecoration: 'none', color: 'inherit' }}>
        <MenuItem>
          <Icon><FaPlus /></Icon> {/* Icon for adding a package */}
          Add Package
        </MenuItem>
      </Link>
      <Link to="/admin-welcome/display-packages" style={{ textDecoration: 'none', color: 'inherit' }}>
        <MenuItem>
          <Icon><FaBox /></Icon> {/* Icon for displaying packages */}
          Display Package
        </MenuItem>
      </Link>

        {/* Bill Section */}
        <SectionTitle>Bills</SectionTitle>
        <Link to="/admin-welcome/add-bill" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem>
            <Icon><FaPlus /></Icon>
            Add Bill
          </MenuItem>
        </Link>
        <Link to="/admin-welcome/view-bills" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem>
            <Icon><FaDollarSign /></Icon>
            View Bills
          </MenuItem>
        </Link>
        <Link to="/admin-welcome/bill-analysis" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem>
            <Icon><FaChartBar /></Icon>
            Bill Analysis
          </MenuItem>
        </Link>
        {/* Inventory Section */}
        <SectionTitle>Inventory</SectionTitle>
        <Link to="/admin-welcome/add-inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem>
            <Icon><FaPlus /></Icon>
            Add Inventory
          </MenuItem>
        </Link>
        <Link to="/admin-welcome/view-inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem>
            <Icon><FaList /></Icon>
            View Inventory
          </MenuItem>
        </Link>
      </Menu>
      <Link to="/admin-welcome/sign-out" style={{ textDecoration: 'none', color: 'inherit' }}>
        <MenuItem>
          <Icon><FaSignOutAlt /></Icon>
          Sign Out
        </MenuItem>
      </Link>
    </SidebarContainer>
  );
};

export default Sidebar;
