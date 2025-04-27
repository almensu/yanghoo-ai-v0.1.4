import React, { useState, useEffect } from 'react';
import MarkdownViewer from '../components/MarkdownViewer';

// Define constants
const API_BASE_URL = 'http://127.0.0.1:8000';
const TASK_UUID = 'dc7d6006-815c-4a62-a09e-c6233a21219d';
// Removed MARKDOWN_FILENAME constant

const TestPage_MarkdownViewer = () => {
  // State for fetched content, loading, error, file list, and selected file
  const [markdownContent, setMarkdownContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false); // Renamed for clarity
  const [contentError, setContentError] = useState(null);      // Renamed for clarity
  const [markdownFiles, setMarkdownFiles] = useState([]);     // List of available .md files
  const [selectedFile, setSelectedFile] = useState('');       // Currently selected file
  const [isLoadingList, setIsLoadingList] = useState(true);     // Loading state for the file list
  const [listError, setListError] = useState(null);           // Error state for the file list

  // Effect 1: Fetch the list of markdown files on component mount
  useEffect(() => {
    const fetchFileList = async () => {
      setIsLoadingList(true);
      setListError(null);
      const listUrl = `${API_BASE_URL}/api/tasks/${TASK_UUID}/files/list?extension=.md`;
      try {
        const response = await fetch(listUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
        const files = await response.json();
        if (!Array.isArray(files)) {
           throw new Error("Invalid response format: Expected an array of filenames.");
        }
        setMarkdownFiles(files);
        // Automatically select the first file if the list is not empty
        if (files.length > 0) {
          setSelectedFile(files[0]);
        }
      } catch (err) {
        console.error("Failed to fetch markdown file list:", err);
        setListError(`Failed to load file list: ${err.message}`);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchFileList();
  }, []); // Runs only once on mount

  // Effect 2: Fetch markdown content when selectedFile changes
  useEffect(() => {
    // Don't fetch if no file is selected
    if (!selectedFile) {
      setMarkdownContent(''); // Clear content if no file selected
      return;
    }

    // --- REMOVED TEMPORARY DIAGNOSTIC STEP --- 
    // console.warn("TEMPORARY: Loading hardcoded simple Markdown for testing purposes.");
    // setMarkdownContent('# Simple Header\n\nThis is a **simple** paragraph to test rendering without fetching the actual file content.\n\n- Item 1\n- Item 2');
    // setIsLoadingContent(false); // Mark as loaded
    // setContentError(null);    // Clear any previous error
    // return; // Skip the actual fetch below
    // --- END TEMPORARY STEP --- 

    // --- Original Fetch Logic (Re-enabled) ---
    const fetchMarkdownContent = async () => {
      setIsLoadingContent(true);
      setContentError(null);
      const contentUrl = `${API_BASE_URL}/api/tasks/${TASK_UUID}/files/${selectedFile}`;
      try {
        const response = await fetch(contentUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
        const text = await response.text();
        setMarkdownContent(text);
      } catch (err) {
        console.error(`Failed to fetch markdown content for ${selectedFile}:`, err);
        setContentError(`Failed to load ${selectedFile}: ${err.message}`);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchMarkdownContent();
    // 
  }, [selectedFile]); // Runs whenever selectedFile changes

  // Handler for dropdown change
  const handleFileSelect = (event) => {
    setSelectedFile(event.target.value);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">Markdown Viewer Test (Task: {TASK_UUID})</h1>

      {/* File List Loading/Error/Select */}
      <div className="mb-4">
        {isLoadingList && <p>Loading file list...</p>}
        {listError && <div className="alert alert-warning shadow-sm"><p>{listError}</p></div>}
        {!isLoadingList && !listError && (
          markdownFiles.length > 0 ? (
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Select Markdown File:</span>
              </label>
              <select 
                className="select select-bordered"
                value={selectedFile}
                onChange={handleFileSelect}
              >
                {markdownFiles.map(file => (
                  <option key={file} value={file}>{file}</option>
                ))}
              </select>
            </div>
          ) : (
            <p>No Markdown files found for this task.</p>
          )
        )}
      </div>

      {/* Markdown Content Loading/Error/Display */}
      <div className="flex-grow flex flex-col border border-base-300 rounded-lg overflow-hidden">
          {/* Content Loading State */}
          {isLoadingContent && (
            <div className="flex items-center justify-center flex-grow">
              <span className="loading loading-spinner loading-lg"></span>
              <span className="ml-2">Loading {selectedFile}...</span>
            </div>
          )}

          {/* Content Error State */}
          {contentError && (
            <div className="alert alert-error shadow-lg m-4">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Error! {contentError}</span>
              </div>
            </div>
          )}

          {/* Display Markdown Content when loaded and no error */}
          {!isLoadingContent && !contentError && selectedFile && (
            <div className="overflow-auto flex-grow"> {/* Added flex-grow here as well */}
              <MarkdownViewer markdownContent={markdownContent} />
            </div>
          )}
          
          {/* Placeholder if no file is selected */}
           {!selectedFile && !isLoadingList && !listError && (
              <div className="p-4 text-gray-500 italic flex items-center justify-center flex-grow">
                 Please select a Markdown file to view.
               </div>
            )}
      </div>

    </div>
  );
};

export default TestPage_MarkdownViewer; 