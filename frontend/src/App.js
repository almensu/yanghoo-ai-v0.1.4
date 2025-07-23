import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
// Import the page components
import TaskListPage from './pages/TaskListPage'; 
import StudioPage from './pages/StudioPage';   
import TestPage_VideoPlayer from './pages/TestPage_VideoPlayer'; // Updated import
import TestPage_VttPreviewer from './pages/TestPage_VttPreviewer'; // Import new test page
import TestPage_MarkdownViewer from './pages/TestPage_MarkdownViewer'; // Import Markdown test page
import TestPage_MarkdownList from './pages/TestPage_MarkdownList'; // Import MarkdownList test page
import TestPage_YouTubeTimestamp from './pages/TestPage_YouTubeTimestamp'; // Import YouTube timestamp test page
import TestPage_AssSubtitle from './pages/TestPage_AssSubtitle'; // Import ASS subtitle test page
import TestPage_KeyframeClip from './pages/TestPage_KeyframeClip'; // Import Keyframe Clip test page
import TestPage_BlockEditor from './pages/TestPage_BlockEditor'; // Import Block Editor test page
import TestPage_BlockDragToProject from './pages/TestPage_BlockDragToProject';
import TestPage_MarkdownToProject from './pages/TestPage_MarkdownToProject'; // Import Block Drag to Project test page

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
               {/* Add route for VttPreviewer Test Page */}
               <Route path="/test/vtt-previewer" element={<TestPage_VttPreviewer />} />
               {/* Add route for MarkdownViewer Test Page */}
               <Route path="/test/markdown" element={<TestPage_MarkdownViewer />} />
               {/* Add route for MarkdownList Test Page */}
               <Route path="/test/markdownlist" element={<TestPage_MarkdownList />} />
               {/* Add route for YouTube Timestamp Test Page */}
               <Route path="/test/youtube-timestamp" element={<TestPage_YouTubeTimestamp />} />
               {/* Add route for ASS Subtitle Test Page */}
               <Route path="/test/ass-subtitle" element={<TestPage_AssSubtitle />} />
               {/* Add route for Keyframe Clip Test Page */}
               <Route path="/test/keyframe-clip" element={<TestPage_KeyframeClip />} />
               {/* Add route for Block Editor Test Page */}
               <Route path="/test/block-editor" element={<TestPage_BlockEditor />} />
            <Route path="/test/block-drag-to-project" element={<TestPage_BlockDragToProject />} />
            <Route path="/test/markdown-to-project" element={<TestPage_MarkdownToProject />} />
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
