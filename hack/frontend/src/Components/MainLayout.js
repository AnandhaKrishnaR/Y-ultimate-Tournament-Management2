import React from 'react';
import { Outlet } from 'react-router-dom'; 
import Sidebar from './Sidebar';

function MainLayout({ user, onLogout }) {
  return (
    <div className="flex h-screen w-full bg-gray-100">
      
      <Sidebar userRole={user.role} onLogout={onLogout} />
      
      
      <div className="flex-1 overflow-y-auto p-8">
        
        <Outlet /> 
      </div>
    </div>
  );
}

export default MainLayout;