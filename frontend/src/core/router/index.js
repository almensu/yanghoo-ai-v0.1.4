/**
 * Router configuration with lazy loading
 * @module core/router
 */
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { PageLoading } from '../../shared/components/Loading';
import ErrorBoundary from '../../shared/components/ErrorBoundary';

// Lazy load page components
const TaskListPage = lazy(() => import('../../features/tasks/pages/TaskListPage'));
const StudioPage = lazy(() => import('../../features/studio/pages/StudioPage'));
const BlockCollectionPage = lazy(() => import('../../features/blocks/pages/BlockCollectionPage'));

// Lazy load dev/test pages
const TestPage_VideoPlayer = lazy(() => import('../../dev/pages/TestPage_VideoPlayer'));
const TestPage_VttPreviewer = lazy(() => import('../../dev/pages/TestPage_VttPreviewer'));
const TestPage_MarkdownViewer = lazy(() => import('../../dev/pages/TestPage_MarkdownViewer'));
const TestPage_MarkdownList = lazy(() => import('../../dev/pages/TestPage_MarkdownList'));
const TestPage_YouTubeTimestamp = lazy(() => import('../../dev/pages/TestPage_YouTubeTimestamp'));
const TestPage_AssSubtitle = lazy(() => import('../../dev/pages/TestPage_AssSubtitle'));
const TestPage_KeyframeClip = lazy(() => import('../../dev/pages/TestPage_KeyframeClip'));
const TestPage_BlockEditor = lazy(() => import('../../dev/pages/TestPage_BlockEditor'));
const TestPage_BlockDragToProject = lazy(() => import('../../dev/pages/TestPage_BlockDragToProject'));
const TestPage_MarkdownToProject = lazy(() => import('../../dev/pages/TestPage_MarkdownToProject'));
const TestPage_BlockCollection = lazy(() => import('../../dev/pages/TestPage_BlockCollection'));

// Layout components (not lazy loaded for faster initial render)
import AppLayout from '../../layouts/AppLayout';

/**
 * Wrapper component with Suspense and Error Boundary
 */
const SuspenseWrapper = ({ children }) => (
    <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
            {children}
        </Suspense>
    </ErrorBoundary>
);

/**
 * Route configuration
 * Note: This is for reference. The actual router is created in App.jsx
 */
export const routes = [
    {
        path: '/',
        element: <AppLayout />,
        errorElement: <ErrorBoundary><div>Page not found</div></ErrorBoundary>,
        children: [
            {
                index: true,
                element: <SuspenseWrapper><TaskListPage /></SuspenseWrapper>,
            },
            {
                path: 'studio/:taskUuid',
                element: <SuspenseWrapper><StudioPage /></SuspenseWrapper>,
            },
            {
                path: 'block',
                element: <SuspenseWrapper><BlockCollectionPage /></SuspenseWrapper>,
            },
            // Dev/Test routes
            {
                path: 'test/video-player',
                element: <SuspenseWrapper><TestPage_VideoPlayer /></SuspenseWrapper>,
            },
            {
                path: 'test/vtt-previewer',
                element: <SuspenseWrapper><TestPage_VttPreviewer /></SuspenseWrapper>,
            },
            {
                path: 'test/markdown',
                element: <SuspenseWrapper><TestPage_MarkdownViewer /></SuspenseWrapper>,
            },
            {
                path: 'test/markdownlist',
                element: <SuspenseWrapper><TestPage_MarkdownList /></SuspenseWrapper>,
            },
            {
                path: 'test/youtube-timestamp',
                element: <SuspenseWrapper><TestPage_YouTubeTimestamp /></SuspenseWrapper>,
            },
            {
                path: 'test/ass-subtitle',
                element: <SuspenseWrapper><TestPage_AssSubtitle /></SuspenseWrapper>,
            },
            {
                path: 'test/keyframe-clip',
                element: <SuspenseWrapper><TestPage_KeyframeClip /></SuspenseWrapper>,
            },
            {
                path: 'test/block-editor',
                element: <SuspenseWrapper><TestPage_BlockEditor /></SuspenseWrapper>,
            },
            {
                path: 'test/block-drag-to-project',
                element: <SuspenseWrapper><TestPage_BlockDragToProject /></SuspenseWrapper>,
            },
            {
                path: 'test/markdown-to-project',
                element: <SuspenseWrapper><TestPage_MarkdownToProject /></SuspenseWrapper>,
            },
            {
                path: 'test/block-collection',
                element: <SuspenseWrapper><TestPage_BlockCollection /></SuspenseWrapper>,
            },
        ],
    },
];

export { SuspenseWrapper };
