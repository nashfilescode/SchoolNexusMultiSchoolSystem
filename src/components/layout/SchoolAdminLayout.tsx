import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const SchoolAdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        dashboardType="schoolAdmin"
      />
      <main
        className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default SchoolAdminLayout;
