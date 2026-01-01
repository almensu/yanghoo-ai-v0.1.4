import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import './App.css';
import AppLayout from './layouts/AppLayout';
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
import BlockCollectionPage from './pages/BlockCollectionPage'; // Import Block Collection page
import TestPage_BlockCollection from './pages/TestPage_BlockCollection'; // Import Block Collection test page

const API_BASE_URL = 'http://127.0.0.1:8000';
const WS_BASE_URL = 'ws://127.0.0.1:8000';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<TaskListPage apiBaseUrl={API_BASE_URL} wsBaseUrl={WS_BASE_URL} />}
          />
          <Route
            path="/studio/:taskUuid"
            element={<StudioPageWrapper apiBaseUrl={API_BASE_URL} />}
          />
          <Route path="/test/video-player" element={<TestPage_VideoPlayer />} />
          <Route path="/test/vtt-previewer" element={<TestPage_VttPreviewer />} />
          <Route path="/test/markdown" element={<TestPage_MarkdownViewer />} />
          <Route path="/test/markdownlist" element={<TestPage_MarkdownList />} />
          <Route path="/test/youtube-timestamp" element={<TestPage_YouTubeTimestamp />} />
          <Route path="/test/ass-subtitle" element={<TestPage_AssSubtitle />} />
          <Route path="/test/keyframe-clip" element={<TestPage_KeyframeClip />} />
          <Route path="/test/block-editor" element={<TestPage_BlockEditor />} />
          <Route path="/test/block-drag-to-project" element={<TestPage_BlockDragToProject />} />
          <Route path="/test/markdown-to-project" element={<TestPage_MarkdownToProject />} />
          <Route path="/block" element={<BlockCollectionPage />} />
          <Route path="/test/block-collection" element={<TestPage_BlockCollection />} />
        </Route>
      </Routes>
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
