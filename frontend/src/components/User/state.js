import React, { useState } from 'react';
import Sidebar from './Sidebar';
import UserManagement from './UserManagement';

const MainPage = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="main-page">
      <Sidebar setActiveSection={setActiveSection} />
      
      <div className="content">
        {activeSection === 'dashboard' && <h1>Dashboard</h1>}
        {activeSection === 'createUser' && (
          <UserManagement creatingUser={true} />
        )}
        {activeSection === 'userManagement' && (
          <UserManagement creatingUser={false} />
        )}
      </div>
    </div>
  );
};

export default MainPage;
