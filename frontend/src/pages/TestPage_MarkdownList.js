import React, { useState } from 'react';
import MarkdownList from '../components/MarkdownList'; // Adjust path as needed

function TestPage_MarkdownList() {
  // Mock data for testing
  const mockFiles = [
    'parallel_summary.md',
    'analysis_notes.md',
    'meeting_minutes_2024-01-15.md',
    'important_findings.markdown', // Test different extension casing
    'draft_report.md',
  ];

  const [selectedFile, setSelectedFile] = useState(null);

  const handleSelectFile = (filename) => {
    console.log(`TestPage: File selected - ${filename}`);
    setSelectedFile(filename);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">MarkdownList Test Page</h1>

      <div className="mb-6 p-4 border rounded bg-white shadow">
        <MarkdownList 
          files={mockFiles} 
          selectedFile={selectedFile}
          onSelectFile={handleSelectFile}
        />
      </div>
      
      <div className="mt-4 p-4 border rounded bg-gray-100">
        <h2 className="text-lg font-semibold mb-2">Selected File:</h2>
        {selectedFile ? (
          <p className="text-blue-600 font-mono">{selectedFile}</p>
        ) : (
          <p className="text-gray-500 italic">No file selected yet.</p>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4 mt-8">Empty List Test</h2>
       <div className="mb-6 p-4 border rounded bg-white shadow">
        <MarkdownList 
          files={[]} 
          selectedFile={null}
          onSelectFile={handleSelectFile}
        />
      </div>
       <h2 className="text-xl font-bold mb-4 mt-8">Null List Test</h2>
       <div className="mb-6 p-4 border rounded bg-white shadow">
        <MarkdownList 
          files={null} 
          selectedFile={null}
          onSelectFile={handleSelectFile}
        />
      </div>
    </div>
  );
}

export default TestPage_MarkdownList; 