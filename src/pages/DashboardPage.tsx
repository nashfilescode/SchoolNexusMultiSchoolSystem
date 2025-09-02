import React from 'react';
import { useLocation } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const title = location.pathname
    .split('/')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">{title || 'Dashboard'}</h1>
      <div className="bg-card p-6 shadow-md">
        <p>This is the placeholder page for {title || 'Dashboard'}.</p>
        <p>Content for this page will be built out later.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
