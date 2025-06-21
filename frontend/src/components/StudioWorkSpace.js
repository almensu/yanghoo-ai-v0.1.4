import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Needed for fetching
import MarkdownViewer from './MarkdownViewer';
import MarkdownWithTimestamps from './MarkdownWithTimestamps'; // Import timestamp component
import MarkdownEditor from './MarkdownEditor'; // Import the editor component
import PlaceholderComponent1 from './PlaceholderComponent1';
import PlaceholderComponent2 from './PlaceholderComponent2';
import MarkdownList from './MarkdownList'; // Import the new list component
import TimestampFormatTest from './TimestampFormatTest'; // 导入时间戳格式测试组件

// Props:
// - taskUuid: The UUID of the current task
// - apiBaseUrl: The base URL for the backend API
// - markdownContent: Optional fallback markdown content from parent
// - videoRef: Reference to the video element for timestamp navigation

function StudioWorkSpace({ taskUuid, apiBaseUrl, markdownContent, videoRef }) {
  const [markdownFiles, setMarkdownFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // Name of the selected file
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState(markdownContent || '');
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

  // New state to track if content has timestamps
  const [hasTimestamps, setHasTimestamps] = useState(false);

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

    // setCurrentMarkdownContent is initialized with prop, or by file selection effect.
    // This effect focuses on the file list and default selection if needed.

    const fetchFileList = async () => {
      setIsLoadingList(true);
      setError(null);
      setMarkdownFiles([]); 
      // Don't reset selectedFile here if we want to respect a direct prop content display initially.
      // setSelectedFile(null); // Let prop content persist if no default file is chosen
      // setCurrentMarkdownContent(''); // Already initialized from prop
      try {
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list`, {
          params: { extension: '.md' } 
        });

        const files = response.data || []; 
        setMarkdownFiles(files);
        
        // If markdownContent prop was NOT provided (or was empty), then try to select a default file from the list.
        // Otherwise, if markdownContent prop WAS provided, selectedFile remains null (or its current value)
        // so that the prop-derived currentMarkdownContent is displayed until the user picks a file.
        if (!markdownContent) {
          const defaultFileToLoad = files.find(f => f.includes('parallel_summary.md')) || files[0];
          if (defaultFileToLoad) {
            setSelectedFile(defaultFileToLoad); // This will trigger the content fetching useEffect
          } else {
            setSelectedFile(null); // No default file found, ensure selectedFile is null
            setCurrentMarkdownContent(''); // No prop, no default file, so no content.
          }
        } else {
          // markdownContent prop IS available. We've initialized currentMarkdownContent with it.
          // We do NOT auto-select a file from the list here, to let the prop content show.
          // If a file was ALREADY selected (e.g. user clicked one), we don't want to nullify it here either.
          // So, selectedFile remains as is (could be null, could be user-selected).
          // If selectedFile is null, the rendering logic will use the prop-based currentMarkdownContent.
          if (!selectedFile) { // Only ensure it's null if it wasn't already set by user interaction somehow before this runs
             // If no file is selected AND we are using prop content, ensure selectedFile is null.
             // This helps the rendering logic pick the prop content via the `markdownContent ?` branch.
             setSelectedFile(null);
          }
        }
      } catch (err) {
        console.error("Error fetching markdown file list:", err);
        setError('Failed to load markdown file list.');
        setMarkdownFiles([]);
        setSelectedFile(null);
        setCurrentMarkdownContent(markdownContent || ''); // Fallback to prop content on list fetch error
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchFileList();
  // Let's keep the dependencies simple, this effect is about the file list primarily.
  // markdownContent dependency was causing re-runs that might not be desired for just file list.
  // }, [taskUuid, apiBaseUrl, markdownContent, selectedFile]); 
  }, [taskUuid, apiBaseUrl]); // Simpler dependencies

  // Effect to fetch the content of the selected markdown file
  useEffect(() => {
    // This effect should ONLY run if a file is EXPLICITLY selected.
    // If selectedFile is null, we rely on currentMarkdownContent being set (or not) by the prop or list fetch logic.
    if (!selectedFile || !taskUuid || !apiBaseUrl) {
      // If no file is selected, currentMarkdownContent should reflect the prop's value (or be empty).
      // The initialization of currentMarkdownContent and the list-fetching useEffect handle this.
      // So, we don't necessarily clear currentMarkdownContent here unless selectedFile was just cleared.
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
        const content = response.data || '';
        setCurrentMarkdownContent(content);
        
        // Check for timestamps in the content
        // Looking for patterns like [00:00:00] or [hh:mm:ss]
        setHasTimestamps(/\[\d{2}:\d{2}:\d{2}\]/.test(content));
      } catch (err) {
        console.error(`Error fetching markdown content for ${selectedFile}:`, err); // Keep error log
        setError(`Failed to load content for ${selectedFile}.`);
        setCurrentMarkdownContent(''); // Clear content on error
        setHasTimestamps(false);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchFileContent();
  }, [selectedFile, taskUuid, apiBaseUrl, markdownContent]); // Re-run if selected file, task, or API URL changes

  // Check for timestamps in markdownContent when it changes
  useEffect(() => {
    if (markdownContent && !selectedFile) {
      setHasTimestamps(/\[\d{2}:\d{2}:\d{2}\]/.test(markdownContent));
    }
  }, [markdownContent, selectedFile]);

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
      
      // Reload the file content to ensure we're displaying the latest version
      try {
        const encodedFilename = encodeURIComponent(selectedFile);
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`, {
          responseType: 'text'
        });
        setCurrentMarkdownContent(response.data || '');
      } catch (fetchErr) {
        console.error(`Error reloading content after save for ${selectedFile}:`, fetchErr);
        // Continue with existing content if reload fails
      }
      
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
    <div className={`flex flex-col bg-white rounded-lg shadow overflow-hidden ${isExpanded ? 'absolute right-0 z-10 w-[50%] h-full top-0 left-[50%]' : 'flex-1 min-w-0'} transition-all duration-300 ease-in-out`}>
      <div className={`flex justify-between items-center border-b border-gray-300 flex-shrink-0 sticky top-0 bg-white z-20 ${isExpanded ? 'p-2' : 'p-4 pb-2'}`}>
        <h3 className="text-lg font-semibold">Studio WorkSpace</h3>
        <button 
          onClick={handleExpandToggle}
          className={`${isExpanded ? 'p-2 bg-primary text-white' : 'mr-4 text-gray-600 hover:text-primary p-1'} rounded-full hover:bg-opacity-90 focus:outline-none`}
          title={isExpanded ? "收缩面板" : "扩展面板"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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
            taskUuid={taskUuid}
            apiBaseUrl={apiBaseUrl}
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
                {hasTimestamps && videoRef ? (
                  <MarkdownWithTimestamps
                    key={`viewer-timestamps-${selectedFile}`}
                    markdownContent={currentMarkdownContent}
                    videoRef={videoRef}
                  />
                ) : (
                  <MarkdownViewer 
                    key={`viewer-${selectedFile}`}
                    markdownContent={currentMarkdownContent} 
                  />
                )}
              </div>
            ) : !isLoadingList && markdownFiles.length > 0 ? (
              <p className="text-gray-500 text-sm italic">Select a markdown file above to view its content.</p>
            ) : markdownContent ? (
              <div>
                <p className="text-xs text-gray-500 mb-2 italic">Displaying default markdown content:</p>
                {hasTimestamps && videoRef ? (
                  <MarkdownWithTimestamps
                    key="default-content-timestamps"
                    markdownContent={markdownContent}
                    videoRef={videoRef}
                  />
                ) : (
                  <MarkdownViewer 
                    key="default-content"
                    markdownContent={markdownContent} 
                  />
                )}
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