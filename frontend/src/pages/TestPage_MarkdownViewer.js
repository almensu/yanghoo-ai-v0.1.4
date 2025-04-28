import React, { useState, useEffect } from 'react';
import MarkdownViewer from '../components/MarkdownViewer';

// Define constants
const API_BASE_URL = 'http://127.0.0.1:8000';
const TASK_UUID = 'dc7d6006-815c-4a62-a09e-c6233a21219d';
// Removed MARKDOWN_FILENAME constant

const TestPage_MarkdownViewer = () => {
  // State for file list and selection
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

      {/* Markdown Content Display Area - Now uses MarkdownViewer */}
      <div className="flex-grow flex flex-col border border-base-300 rounded-lg overflow-hidden">
          {/* Pass necessary props to MarkdownViewer */}
          {/* MarkdownViewer now handles its own loading/error/content display */} 
          <MarkdownViewer 
            apiBaseUrl={API_BASE_URL} 
            taskUuid={TASK_UUID} 
            fileName={selectedFile} 
          />
      </div>

    </div>
  );
};

export default TestPage_MarkdownViewer; 