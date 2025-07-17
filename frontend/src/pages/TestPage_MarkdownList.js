import React, { useState } from 'react';
import MarkdownList from '../components/MarkdownList'; // Adjust path as needed

function TestPage_MarkdownList() {
  // Mock data for testing
  const [mockFiles, setMockFiles] = useState([
    'parallel_summary.md',
    'analysis_notes.md',
    'meeting_minutes_2024-01-15.md',
    'important_findings.markdown', // Test different extension casing
    'draft_report.md',
  ]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [draggedFile, setDraggedFile] = useState(null);

  const handleSelectFile = (filename) => {
    console.log(`TestPage: File selected - ${filename}`);
    setSelectedFile(filename);
  };

  const handleFileDeleted = (filename) => {
    console.log(`TestPage: File deleted - ${filename}`);
    setMockFiles(prev => prev.filter(f => f !== filename));
    if (selectedFile === filename) {
      setSelectedFile(null);
    }
  };

  const handleFileRenamed = (oldFilename, newFilename) => {
    console.log(`TestPage: File renamed - ${oldFilename} -> ${newFilename}`);
    setMockFiles(prev => prev.map(f => f === oldFilename ? newFilename : f));
    if (selectedFile === oldFilename) {
      setSelectedFile(newFilename);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const filename = e.dataTransfer.getData('text/plain');
    console.log(`TestPage: File dropped - ${filename}`);
    setDraggedFile(filename);
    setTimeout(() => setDraggedFile(null), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MarkdownList Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MarkdownList Component */}
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">MarkdownList Component</h2>
          <MarkdownList 
            files={mockFiles} 
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            onFileDeleted={handleFileDeleted}
            onFileRenamed={handleFileRenamed}
            taskUuid="test-uuid"
            apiBaseUrl="http://localhost:8000"
          />
        </div>

        {/* Drag Test Area */}
        <div className="space-y-4">
          <div 
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center min-h-32 flex items-center justify-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {draggedFile ? (
              <div className="text-green-600">
                <div className="text-lg font-semibold">文件已拖拽到此处!</div>
                <div className="text-sm">文件名: {draggedFile}</div>
              </div>
            ) : (
              <div className="text-gray-500">
                <div className="text-lg font-semibold">拖拽测试区域</div>
                <div className="text-sm">将文件拖拽到这里测试拖拽功能</div>
              </div>
            )}
          </div>

          <div className="p-4 border rounded bg-gray-100">
            <h2 className="text-lg font-semibold mb-2">Selected File:</h2>
            {selectedFile ? (
              <p className="text-blue-600 font-mono">{selectedFile}</p>
            ) : (
              <p className="text-gray-500 italic">No file selected yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <h2 className="text-xl font-bold">Empty List Test</h2>
        <div className="p-4 border rounded bg-white shadow">
          <MarkdownList 
            files={[]} 
            selectedFile={null}
            onSelectFile={handleSelectFile}
            onFileDeleted={handleFileDeleted}
            onFileRenamed={handleFileRenamed}
            taskUuid="test-uuid"
            apiBaseUrl="http://localhost:8000"
          />
        </div>
        
        <h2 className="text-xl font-bold">Null List Test</h2>
        <div className="p-4 border rounded bg-white shadow">
          <MarkdownList 
            files={null} 
            selectedFile={null}
            onSelectFile={handleSelectFile}
            onFileDeleted={handleFileDeleted}
            onFileRenamed={handleFileRenamed}
            taskUuid="test-uuid"
            apiBaseUrl="http://localhost:8000"
          />
        </div>
      </div>
    </div>
  );
}

export default TestPage_MarkdownList; 