/**
 * Main Application Component
 * 
 * Features:
 * - React Router for navigation
 * - Lazy loading for pages with Suspense
 * - Error boundaries for graceful error handling
 * - Centralized configuration
 */
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import './App.css';

// Core imports
import { API_BASE_URL, WS_BASE_URL } from './core/config/constants';

// Layout and shared components
import AppLayout from './layouts/AppLayout';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { PageLoading } from './shared/components/Loading';

// Lazy load main pages for better performance
const TaskListPage = lazy(() => import('./pages/TaskListPage'));
const StudioPage = lazy(() => import('./pages/StudioPage'));
const BlockCollectionPage = lazy(() => import('./pages/BlockCollectionPage'));

// Lazy load test pages (development only)
const TestPage_VideoPlayer = lazy(() => import('./pages/TestPage_VideoPlayer'));
const TestPage_VttPreviewer = lazy(() => import('./pages/TestPage_VttPreviewer'));
const TestPage_MarkdownViewer = lazy(() => import('./pages/TestPage_MarkdownViewer'));
const TestPage_MarkdownList = lazy(() => import('./pages/TestPage_MarkdownList'));
const TestPage_YouTubeTimestamp = lazy(() => import('./pages/TestPage_YouTubeTimestamp'));
const TestPage_AssSubtitle = lazy(() => import('./pages/TestPage_AssSubtitle'));
const TestPage_KeyframeClip = lazy(() => import('./pages/TestPage_KeyframeClip'));
const TestPage_BlockEditor = lazy(() => import('./pages/TestPage_BlockEditor'));
const TestPage_BlockDragToProject = lazy(() => import('./pages/TestPage_BlockDragToProject'));
const TestPage_MarkdownToProject = lazy(() => import('./pages/TestPage_MarkdownToProject'));
const TestPage_BlockCollection = lazy(() => import('./pages/TestPage_BlockCollection'));

/**
 * Wrapper component for lazy-loaded pages
 * Provides Suspense fallback and Error Boundary
 */
function LazyPage({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoading />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Helper wrapper component to extract route params and pass to StudioPage
 */
function StudioPageWrapper() {
  const { taskUuid } = useParams();
  return (
    <LazyPage>
      <StudioPage taskUuid={taskUuid} apiBaseUrl={API_BASE_URL} />
    </LazyPage>
  );
}

/**
 * Main App Component
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Main Routes */}
          <Route
            path="/"
            element={
              <LazyPage>
                <TaskListPage apiBaseUrl={API_BASE_URL} wsBaseUrl={WS_BASE_URL} />
              </LazyPage>
            }
          />
          <Route path="/studio/:taskUuid" element={<StudioPageWrapper />} />
          <Route
            path="/block"
            element={
              <LazyPage>
                <BlockCollectionPage />
              </LazyPage>
            }
          />

          {/* Test/Development Routes */}
          <Route path="/test/video-player" element={<LazyPage><TestPage_VideoPlayer /></LazyPage>} />
          <Route path="/test/vtt-previewer" element={<LazyPage><TestPage_VttPreviewer /></LazyPage>} />
          <Route path="/test/markdown" element={<LazyPage><TestPage_MarkdownViewer /></LazyPage>} />
          <Route path="/test/markdownlist" element={<LazyPage><TestPage_MarkdownList /></LazyPage>} />
          <Route path="/test/youtube-timestamp" element={<LazyPage><TestPage_YouTubeTimestamp /></LazyPage>} />
          <Route path="/test/ass-subtitle" element={<LazyPage><TestPage_AssSubtitle /></LazyPage>} />
          <Route path="/test/keyframe-clip" element={<LazyPage><TestPage_KeyframeClip /></LazyPage>} />
          <Route path="/test/block-editor" element={<LazyPage><TestPage_BlockEditor /></LazyPage>} />
          <Route path="/test/block-drag-to-project" element={<LazyPage><TestPage_BlockDragToProject /></LazyPage>} />
          <Route path="/test/markdown-to-project" element={<LazyPage><TestPage_MarkdownToProject /></LazyPage>} />
          <Route path="/test/block-collection" element={<LazyPage><TestPage_BlockCollection /></LazyPage>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
