import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MarkdownViewer from './MarkdownViewer'; // Import the viewer component
import MarkdownWithTimestamps from './MarkdownWithTimestamps'; // Import the timestamp-enabled component

// Props:
// - taskUuid: The UUID of the task whose Markdown file we want to display.
// - apiBaseUrl: The base URL for the API.
// - videoRef: The ref of the video player (optional, for timestamp navigation)

function TaskMarkdownDisplay({ taskUuid, apiBaseUrl, videoRef }) {
  const [markdownContent, setMarkdownContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasTimestamps, setHasTimestamps] = useState(false);

  useEffect(() => {
    // Fetch markdown content when the UUID changes
    if (!taskUuid) {
      setMarkdownContent(''); // Clear content if no UUID
      setError(null);
      return;
    }

    const fetchMarkdown = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // **Assume backend endpoint: GET /api/tasks/{uuid}/markdown**
        // This endpoint should return the markdown content, either as plain text
        // or as JSON like { content: "markdown string" }
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/markdown`);
        
        // Adjust based on how your backend returns the data:
        let content = '';
        if (typeof response.data === 'string') {
          content = response.data; 
        } else if (response.data && typeof response.data.content === 'string') {
          content = response.data.content;
        } else {
           throw new Error('Unexpected response format for markdown content');
        }

        // Check if the markdown contains timestamps [00:00:00] format
        const hasTimeStamps = /\[\d{2}:\d{2}:\d{2}\]/.test(content);
        setHasTimestamps(hasTimeStamps);
        setMarkdownContent(content);

      } catch (err) {
        console.error(`Error fetching markdown for task ${taskUuid}:`, err);
        setError(`Failed to load document for task ${taskUuid}.`);
        setMarkdownContent(''); // Clear content on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkdown();

    // Cleanup function (optional, e.g., for aborting requests)
    return () => {
      // Cleanup logic if needed
    };
  }, [taskUuid, apiBaseUrl]); // Re-run effect if taskUuid or apiBaseUrl changes

  return (
    <div className="markdown-display-container p-4 border border-base-300 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Document View (UUID: {taskUuid || 'None'})</h3>
      {isLoading && (
        <div className="flex justify-center items-center p-4">
           <span className="loading loading-spinner loading-md"></span>
           <p className="ml-2">Loading document...</p>
        </div>
      )}
      {error && (
        <div className="alert alert-error shadow-sm">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}
      {!isLoading && !error && (
        // Use MarkdownWithTimestamps if timestamps are detected, otherwise use regular MarkdownViewer
        hasTimestamps && videoRef ? (
          <MarkdownWithTimestamps 
            markdownContent={markdownContent} 
            videoRef={videoRef} 
          />
        ) : (
          <MarkdownViewer markdownContent={markdownContent} />
        )
      )}
    </div>
  );
}

export default TaskMarkdownDisplay; 