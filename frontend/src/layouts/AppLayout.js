import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ToastContainer from '../components/Toast';

function AppLayout() {
  return (
    <div className="flex h-screen bg-base-100" data-theme="cupcake">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <main className="flex-grow flex-1 flex flex-col overflow-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AppLayout;

