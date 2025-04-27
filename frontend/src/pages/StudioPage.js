import React from 'react';
import Studio from '../components/Studio'; // Import the main Studio component

function StudioPage({ taskUuid, apiBaseUrl }) {
  // This component primarily acts as a container for the Studio component
  // It receives the necessary props (taskUuid, apiBaseUrl) from the router setup

  return (
    // Studio component manages its own layout (flex-1 h-full etc.)
    <Studio taskUuid={taskUuid} apiBaseUrl={apiBaseUrl} />
  );
}

export default StudioPage; 