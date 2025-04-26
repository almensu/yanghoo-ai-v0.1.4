import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
// Import the page components
import TaskListPage from './pages/TaskListPage'; 
import StudioPage from './pages/StudioPage';   
import TestPage_VideoPlayer from './pages/TestPage_VideoPlayer'; // Updated import

const API_BASE_URL = 'http://127.0.0.1:8000';
const WS_BASE_URL = 'ws://127.0.0.1:8000';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-base-100" data-theme="cupcake">
        <Sidebar /> {/* Sidebar persistent across pages */}
        
        {/* Main content area wrapper */}
        <div className="flex-grow flex flex-col overflow-hidden"> {/* Changed overflow-auto to overflow-hidden */} 
           {/* Main content area changes based on route */}
           {/* Removed container/padding, apply in pages if needed */}
           {/* Added flex-1 to make sure Routes container grows */}
           <main className="flex-grow flex-1 flex flex-col overflow-auto"> {/* Allow main content to scroll */} 
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
                   // Use the wrapper component to extract params
                   <StudioPageWrapper apiBaseUrl={API_BASE_URL} />
                 }
                />
               {/* Define a fallback route or a 404 page if needed */}
               {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
               {/* Add route for VideoPlayer Test Page */}
               <Route path="/test/video-player" element={<TestPage_VideoPlayer />} /> 
             </Routes>
           </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

// Helper wrapper component to extract route param and pass to StudioPage
function StudioPageWrapper({ apiBaseUrl }) {
  // useParams hook extracts dynamic parameters from the URL
  const { taskUuid } = useParams(); 
  
  // Render the actual StudioPage, passing the extracted uuid and apiBaseUrl
  return <StudioPage taskUuid={taskUuid} apiBaseUrl={apiBaseUrl} />;
}

export default App;
