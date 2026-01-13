/**
 * Main App Layout component
 * 
 * Provides consistent layout structure with:
 * - Sidebar navigation
 * - Main content area with router outlet
 * - Toast notifications
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ToastContainer from '../shared/components/Toast';
import { DEFAULT_THEME } from '../core/config/constants';

/**
 * AppLayout - Main application layout wrapper
 * 
 * @component
 * @description Wraps all pages with consistent sidebar navigation and toast notifications
 */
function AppLayout() {
  return (
    <div className="flex h-screen bg-base-100" data-theme={DEFAULT_THEME}>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <main className="flex-grow flex-1 flex flex-col overflow-auto" role="main">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default AppLayout;
