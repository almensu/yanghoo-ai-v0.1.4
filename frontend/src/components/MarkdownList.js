import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { estimateTokenCount, formatTokenCount, getTokenCountColorClass } from '../utils/tokenUtils';

// Props:
// - files: Array of markdown filenames (strings)
// - selectedFile: The currently selected filename (string)
// - onSelectFile: Function to call when a file is clicked (passes filename)
// - taskUuid: UUID of the current task for fetching file contents
// - apiBaseUrl: Base URL for API calls

function MarkdownList({ files, selectedFile, onSelectFile, taskUuid, apiBaseUrl }) {
  const [fileTokenCounts, setFileTokenCounts] = useState({});
  const [loadingTokenCounts, setLoadingTokenCounts] = useState(false);

  // Fetch token counts for all files
  useEffect(() => {
    if (!files || files.length === 0 || !taskUuid || !apiBaseUrl) {
      return;
    }

    const fetchTokenCounts = async () => {
      setLoadingTokenCounts(true);
      const tokenCounts = {};

      try {
        // Fetch content for each file and calculate token count
        const fetchPromises = files.map(async (filename) => {
          try {
            const encodedFilename = encodeURIComponent(filename);
            const response = await axios.get(
              `${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`,
              { responseType: 'text' }
            );
            const content = response.data || '';
            const tokenCount = estimateTokenCount(content);
            tokenCounts[filename] = tokenCount;
          } catch (error) {
            console.error(`Failed to fetch content for ${filename}:`, error);
            tokenCounts[filename] = 0; // Default to 0 on error
          }
        });

        await Promise.all(fetchPromises);
        setFileTokenCounts(tokenCounts);
      } catch (error) {
        console.error('Error fetching token counts:', error);
      } finally {
        setLoadingTokenCounts(false);
      }
    };

    fetchTokenCounts();
  }, [files, taskUuid, apiBaseUrl]);

  if (!files || files.length === 0) {
    return (
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium mb-1 text-gray-700">Markdown Documents</h4>
        <p className="text-gray-500 text-sm italic">没有找到 Markdown 文件</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-md font-medium mb-2 text-gray-700 flex items-center gap-2">
        Markdown Documents
        {loadingTokenCounts && (
          <span className="loading loading-spinner loading-xs"></span>
        )}
      </h4>
      <ul className="list-none pl-0 space-y-1">
        {files.map(filename => {
          const tokenCount = fileTokenCounts[filename];
          const hasTokenCount = tokenCount !== undefined;
          
          return (
            <li key={filename}>
              <button 
                onClick={() => onSelectFile(filename)}
                className={`text-sm text-left w-full px-2 py-2 rounded border transition-colors ${ 
                  selectedFile === filename 
                    ? 'bg-primary text-primary-content font-semibold border-primary' 
                    : 'hover:bg-base-200 border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate flex-1" title={filename}>
                    {filename}
                  </div>
                  {hasTokenCount && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span 
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/20 ${
                          selectedFile === filename 
                            ? 'text-primary-content' 
                            : getTokenCountColorClass(tokenCount)
                        }`}
                        title={`约 ${tokenCount} tokens`}
                      >
                        {formatTokenCount(tokenCount)}
                      </span>
                      <span className="text-xs opacity-70">tokens</span>
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      
      {/* Token count summary */}
      {Object.keys(fileTokenCounts).length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            总计: {formatTokenCount(Object.values(fileTokenCounts).reduce((sum, count) => sum + count, 0))} tokens
            ({files.length} 个文件)
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkdownList; 