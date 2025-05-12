import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Needed for fetching
import MarkdownViewer from './MarkdownViewer';
import MarkdownEditor from './MarkdownEditor'; // Import the editor component
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);
  const selectedFileRef = useRef(selectedFile);

  const handleExpandToggle = () => {
    const scrollPosition = contentRef.current?.scrollTop || 0;
    
    setIsExpanded(prev => !prev);
    
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = scrollPosition;
      }
    }, 10);
  };

  const handleSelectFile = (filename) => {
    if (selectedFile === filename) return;
    
    const scrollPosition = contentRef.current?.scrollTop || 0;
    
    selectedFileRef.current = filename;
    setSelectedFile(filename);
    setIsEditing(false);
    setIsCreatingNew(false);
    
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, 10);
  };

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
  }, [taskUuid, apiBaseUrl]);

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

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setIsEditing(true);
    setSelectedFile(null);
    setCurrentMarkdownContent('');
    setNewFileName('');
  };

  const handleSaveNew = async () => {
    if (!newFileName || !taskUuid || !apiBaseUrl) return;
    
    // Add .md extension if not already present
    const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;
    
    setIsSaving(true);
    try {
      // Save the new markdown file
      await axios.post(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodeURIComponent(fileName)}`, 
        currentMarkdownContent,
        { headers: { 'Content-Type': 'text/plain' } }
      );
      
      // Refresh the file list
      const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list`, {
        params: { extension: '.md' }
      });
      
      const files = response.data || [];
      setMarkdownFiles(files);
      
      // Select the newly created file
      setSelectedFile(fileName);
      setIsCreatingNew(false);
      setIsEditing(false);
      
    } catch (err) {
      console.error("Error saving new markdown file:", err);
      setError('Failed to save new markdown file.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedFile || !taskUuid || !apiBaseUrl) return;
    
    setIsSaving(true);
    try {
      // Save the edited markdown file
      await axios.post(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodeURIComponent(selectedFile)}`, 
        currentMarkdownContent,
        { headers: { 'Content-Type': 'text/plain' } }
      );
      
      setIsEditing(false);
    } catch (err) {
      console.error(`Error saving markdown content for ${selectedFile}:`, err);
      setError(`Failed to save content for ${selectedFile}.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (newContent) => {
    setCurrentMarkdownContent(newContent);
  };

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow overflow-hidden ${isExpanded ? 'w-full' : 'w-80'} transition-all duration-300 ease-in-out`}>
      <div className="flex justify-between items-center border-b border-gray-300 flex-shrink-0">
        <h3 className="text-lg font-semibold p-4 pb-2">Studio WorkSpace</h3>
        <button 
          onClick={handleExpandToggle}
          className="mr-4 text-gray-600 hover:text-primary focus:outline-none p-1 rounded-full hover:bg-gray-100"
          title={isExpanded ? "收缩面板" : "扩展面板"}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      <div ref={contentRef} className="flex-grow overflow-y-auto p-4 pt-2 space-y-4">
        
        <div> 
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-md font-medium text-gray-700">Markdown Documents</h4>
            <button 
              onClick={handleCreateNew}
              className="text-gray-600 hover:text-primary focus:outline-none p-1 rounded-full hover:bg-gray-100"
              title="Create new markdown document"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {isLoadingList && <p className="text-sm text-gray-500 italic">Loading file list...</p>}
          {error && <p className="text-sm text-red-500">Error: {error}</p>}
          
          {!isLoadingList && !isCreatingNew && (
            <MarkdownList 
              files={markdownFiles} 
              selectedFile={selectedFile}
              onSelectFile={handleSelectFile} 
            />
          )}

          {isCreatingNew && (
            <div className="mt-3 border rounded p-3 bg-base-100">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter file name (e.g. notes.md)"
                  className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1 text-xs rounded bg-base-200 hover:bg-base-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNew}
                  disabled={!newFileName || isSaving}
                  className={`px-3 py-1 text-xs rounded ${!newFileName || isSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-primary-content hover:bg-primary-focus'}`}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 border-t pt-4">
            {isLoadingContent ? (
              <p className="text-sm text-gray-500 italic">Loading content for {selectedFile}...</p>
            ) : isEditing ? (
              <div>
                <MarkdownEditor 
                  key={`editor-${selectedFile || 'new'}`}
                  value={currentMarkdownContent}
                  onChange={handleContentChange}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => isCreatingNew ? setIsCreatingNew(false) : setIsEditing(false)}
                    className="px-3 py-1 text-xs rounded bg-base-200 hover:bg-base-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isCreatingNew ? handleSaveNew : handleSaveEdit}
                    disabled={isSaving}
                    className={`px-3 py-1 text-xs rounded ${isSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-primary-content hover:bg-primary-focus'}`}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : selectedFile ? (
              <div>
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 text-xs rounded bg-base-200 hover:bg-base-300 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                </div>
                <MarkdownViewer 
                  key={`viewer-${selectedFile}`}
                  markdownContent={currentMarkdownContent} 
                />
              </div>
            ) : !isLoadingList && markdownFiles.length > 0 ? (
              <p className="text-gray-500 text-sm italic">Select a markdown file above to view its content.</p>
            ) : markdownContent ? (
              <div>
                <p className="text-xs text-gray-500 mb-2 italic">Displaying default markdown content:</p>
                <MarkdownViewer 
                  key="default-content"
                  markdownContent={markdownContent} 
                />
              </div>
            ) : null}
          </div>
        </div>
        
        <PlaceholderComponent1 />
        <PlaceholderComponent2 />
        
      </div>
    </div>
  );
}

export default StudioWorkSpace; 