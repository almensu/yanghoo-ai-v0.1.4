import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import TaskListPage from './pages/TaskListPage';
import StudioPage from './pages/StudioPage';

const API_BASE_URL = 'http://127.0.0.1:8000';
const WS_BASE_URL = 'ws://127.0.0.1:8000';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-base-100" data-theme="yanghoo-workbench">
        <Sidebar />
        <div className="flex-grow flex flex-col overflow-hidden">
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
