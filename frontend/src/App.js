import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import TaskListPage from './pages/TaskListPage';
import StudioPage from './pages/StudioPage';
import { useResponsive } from './hooks/useResponsive';
import { Menu } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';
const WS_BASE_URL = 'ws://127.0.0.1:8000';

function App() {
  const { isMobile } = useResponsive();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-base-100 overflow-hidden" data-theme="yanghoo-workbench">
        {/* Desktop Sidebar / Mobile Drawer */}
        {!isMobile ? (
          <Sidebar />
        ) : (
          <>
            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in duration-200"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}
            {/* Mobile Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 z-[101] transition-transform duration-300 ease-in-out transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
            </div>
          </>
        )}

        <div className="flex-grow flex flex-col overflow-hidden relative">
          {/* Mobile Header Toggle */}
          {isMobile && (
            <div className="h-12 border-b border-base-300 bg-base-100 flex items-center px-4 flex-shrink-0 z-50">
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="btn btn-ghost btn-sm btn-square"
              >
                <Menu size={20} />
              </button>
              <span className="ml-3 font-bold text-sm">YangHoo AI</span>
            </div>
          )}

          <main className="flex-grow flex-1 flex flex-col overflow-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <TaskListPage apiBaseUrl={API_BASE_URL} wsBaseUrl={WS_BASE_URL} />
                }
              />
              <Route
                path="/studio/:taskUuid"
                element={
                  <StudioPageWrapper apiBaseUrl={API_BASE_URL} />
                }
              />
              <Route path="*" element={<div className="p-8 text-center text-base-content/60">页面不存在</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

function StudioPageWrapper({ apiBaseUrl }) {
  const { taskUuid } = useParams();
  return <StudioPage taskUuid={taskUuid} apiBaseUrl={apiBaseUrl} />;
}

export default App;
