import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-warmBg dark:bg-darkBg text-darkText dark:text-darkTextPrimary flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar collapsed={collapsed} setMobileOpen={setMobileOpen} />

        {/* Page Content Container */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all duration-300 ${
            collapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
