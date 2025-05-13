import React from 'react';

// Props:
// - files: Array of markdown filenames (strings)
// - selectedFile: The currently selected filename (string)
// - onSelectFile: Function to call when a file is clicked (passes filename)

function MarkdownList({ files, selectedFile, onSelectFile }) {

  if (!files || files.length === 0) {
    return (
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium mb-1 text-gray-700">Markdown Files</h4>
        <p className="text-gray-500 text-sm italic">No markdown files found for this task.</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-md font-medium mb-2 text-gray-700">Available Markdown Files</h4>
      <ul className="list-none pl-0 space-y-1">
        {files.map(filename => (
          <li key={filename}>
            <button 
              onClick={() => onSelectFile(filename)}
              className={`text-sm text-left w-full px-2 py-1 rounded ${ 
                selectedFile === filename 
                  ? 'bg-primary text-primary-content font-semibold' 
                  : 'hover:bg-base-200'
              }`}
            >
              <div className="truncate max-w-full" title={filename}>
                {filename}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MarkdownList; 