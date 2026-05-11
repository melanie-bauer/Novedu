import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Topbar from './Topbar';
import SidebarNav from './SidebarNav';

const AppLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // First-time setup check
  if (user?.isFirstLogin) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Topbar />
      <div className="flex-1 flex overflow-hidden">
        <SidebarNav 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
