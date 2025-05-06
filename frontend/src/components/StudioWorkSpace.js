import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Needed for fetching
import MarkdownViewer from './MarkdownViewer';
import PlaceholderComponent1 from './PlaceholderComponent1';
import PlaceholderComponent2 from './PlaceholderComponent2';
import MarkdownList from './MarkdownList'; // Import the new list component

// Props:
// - taskUuid: The UUID of the current task
// - apiBaseUrl: The base URL for the backend API
// - markdownContent: Optional fallback markdown content from parent

function StudioWorkSpace({ taskUuid, apiBaseUrl, markdownContent }) {
  const [markdownFiles, setMarkdownFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // Name of the selected file
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState(null);

  // Effect to fetch the list of markdown files for the task
  useEffect(() => {
    if (!taskUuid || !apiBaseUrl) return;

    const fetchFileList = async () => {
      setIsLoadingList(true);
      setError(null);
      setMarkdownFiles([]); // Clear previous list
      setSelectedFile(null); // Reset selection
      setCurrentMarkdownContent(''); // Clear content
      try {
        // Call the backend endpoint to list files with the .md extension
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list`, {
          params: { extension: '.md' } // Add query parameter to filter by extension
        });

        // Expecting ["file1.md", "file2.md"]
        const files = response.data || []; // Directly use the response data array
        setMarkdownFiles(files);
        
        // Automatically select the first file if available (e.g., parallel_summary.md)
        const defaultFile = files.find(f => f.includes('parallel_summary.md')) || files[0];
        if (defaultFile) {
          setSelectedFile(defaultFile);
        }
      } catch (err) {
        console.error("Error fetching markdown file list:", err); // Keep error log
        setError('Failed to load markdown file list.');
        setMarkdownFiles([]);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchFileList();
  }, [taskUuid, apiBaseUrl]); // Re-run if task or API URL changes

  // Effect to fetch the content of the selected markdown file
  useEffect(() => {
    if (!selectedFile || !taskUuid || !apiBaseUrl) {
        setCurrentMarkdownContent(''); // Clear content if no file is selected
        return;
    }

    const fetchFileContent = async () => {
      setIsLoadingContent(true);
      setError(null); 
      try {
        // Use the existing endpoint for fetching file content
        // Make sure the filename is URI encoded if it might contain special characters
        const encodedFilename = encodeURIComponent(selectedFile);
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`, {
             responseType: 'text' // Ensure we get raw text
        });
        setCurrentMarkdownContent(response.data || '');
      } catch (err) {
        console.error(`Error fetching markdown content for ${selectedFile}:`, err); // Keep error log
        setError(`Failed to load content for ${selectedFile}.`);
        setCurrentMarkdownContent(''); // Clear content on error
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchFileContent();
  }, [selectedFile, taskUuid, apiBaseUrl]); // Re-run if selected file, task, or API URL changes

  const handleSelectFile = (filename) => {
    setSelectedFile(filename);
  };

  return (
    <div className="flex flex-col w-1/4 flex-shrink-0 bg-white rounded-lg shadow overflow-hidden">
      <h3 className="text-lg font-semibold p-4 pb-2 border-b border-gray-300 flex-shrink-0">Studio WorkSpace</h3>
      <div className="flex-grow overflow-y-auto p-4 pt-2 space-y-4"> {/* Scrollable content area */}
        
        {/* --- Markdown Section --- */}
        <div> 
          <h4 className="text-md font-medium mb-1 text-gray-700">Markdown Viewer</h4>
          {/* Display Loading/Error States */} 
          {isLoadingList && <p className="text-sm text-gray-500 italic">Loading file list...</p>}
          {error && <p className="text-sm text-red-500">Error: {error}</p>}
          
          {/* Render Markdown List */} 
          {!isLoadingList && (
            <MarkdownList 
              files={markdownFiles} 
              selectedFile={selectedFile}
              onSelectFile={handleSelectFile} 
            />
          )}

          {/* Render Markdown Viewer */} 
          <div className="mt-4 border-t pt-4"> {/* Separator */} 
            {isLoadingContent ? (
               <p className="text-sm text-gray-500 italic">Loading content for {selectedFile}...</p>
            ) : selectedFile ? (
              <MarkdownViewer markdownContent={currentMarkdownContent} />
            ) : !isLoadingList && markdownFiles.length > 0 ? (
               <p className="text-gray-500 text-sm italic">Select a markdown file above to view its content.</p>
            ) : markdownContent ? (
              /* 当没有文件可选择但父组件提供了 markdown 内容时显示 */
              <div>
                <p className="text-xs text-gray-500 mb-2 italic">Displaying default markdown content:</p>
                <MarkdownViewer markdownContent={markdownContent} />
              </div>
            ) : null /* 如果什么都没有，则不显示任何内容 */}
          </div>
        </div>
        
        {/* --- Other Child Components (Placeholders remain) --- */}
        <PlaceholderComponent1 />
        <PlaceholderComponent2 />
        {/* --- End Child Components --- */}
        
      </div>
    </div>
  );
}

export default StudioWorkSpace; 