import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import CardView from './CardView'; // Assuming CardView is in the same directory
import TableView from './TableView'; // Assuming TableView is in the same directory

// Destructure all the props passed from App.js
function TaskList({ 
  tasks = [], // Default to empty array
  isLoading, 
  error, 
  onDelete, 
  onArchive, 
  onRestoreArchived, // Pass this handler
  onDownloadRequest, 
  onDownloadAudio,
  onExtractAudio, 
  onDeleteVideo, 
  onDeleteAudio,
  onDownloadVtt,
  onDeleteVtt,
  onNaturalSegmentVtt,
  onMergeVtt,
  onProcessSrt,
  onDeleteSrt,
  onDeleteAss,
  onTranscribeWhisperX,
  onDeleteWhisperX,
  onSplitTranscribeWhisperX,
  onCreateVideo,
  onOpenFolder,
  onGoToStudio, // Add the new prop here
  // Sorting props from TaskListPage
  sortField,
  sortOrder,
  handleSort,
  SortIndicator 
}) {
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [searchTerm, setSearchTerm] = useState(''); // State for search term (if you add search input later)

  // Filter tasks based on search term. Archive filtering is now handled by the parent.
  const processedTasks = tasks.filter(task => {
    // Example filtering logic (can be expanded)
    const matchesSearch = searchTerm === '' || 
                          (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (task.url && task.url.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="p-6 bg-base-100 rounded-box shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ingested Tasks ({tasks.length})</h2>
        
        {/* Conditional Restore Button - uses props passed from App.js */}
        {!isLoading && !error && tasks.length === 0 && (
          <button 
            className="btn btn-sm btn-outline btn-accent flex items-center gap-1"
            onClick={onRestoreArchived} // Use the passed handler
          >
            <Undo2 className="w-4 h-4"/> Restore Archived
          </button>
        )}
         
        {/* View Mode Toggle */}
        <div className="tabs tabs-boxed">
          <a className={`tab ${viewMode === 'card' ? 'tab-active' : ''}`} onClick={() => setViewMode('card')}>Card View</a> 
          <a className={`tab ${viewMode === 'table' ? 'tab-active' : ''}`} onClick={() => setViewMode('table')}>Table View</a>
        </div>
      </div>

      {/* Loading/Error state for task list */} 
      {isLoading && <progress className="progress progress-primary w-full"></progress>}
      {error && <div className="alert alert-error shadow-lg"><div><span>Error loading tasks: {error}</span></div></div>}

      {/* Render based on view mode - Pass all handler props down */} 
      {!isLoading && !error && (
        <div>
          {/* You might want to add search/filter inputs here later */} 
          {viewMode === 'card' ? (
            <CardView 
              tasks={processedTasks}
              onDelete={onDelete} 
              onArchive={onArchive}
              onDownloadRequest={onDownloadRequest} 
              onDownloadAudio={onDownloadAudio}
              onExtractAudio={onExtractAudio}
              onDeleteVideo={onDeleteVideo}
              onDeleteAudio={onDeleteAudio}
              onDownloadVtt={onDownloadVtt}
              onDeleteVtt={onDeleteVtt}
              onNaturalSegmentVtt={onNaturalSegmentVtt}
              onMergeVtt={onMergeVtt}
              onProcessSrt={onProcessSrt}
              onDeleteSrt={onDeleteSrt}
              onDeleteAss={onDeleteAss}
              onTranscribeWhisperX={onTranscribeWhisperX}
              onDeleteWhisperX={onDeleteWhisperX}
              onSplitTranscribeWhisperX={onSplitTranscribeWhisperX}
              onCreateVideo={onCreateVideo}
              onOpenFolder={onOpenFolder}
              onGoToStudio={onGoToStudio}
              // Pass sorting props
              sortField={sortField}
              sortOrder={sortOrder}
              handleSort={handleSort}
              SortIndicator={SortIndicator}
            />
          ) : (
            <TableView 
              tasks={processedTasks}
              onDelete={onDelete} 
              onArchive={onArchive}
              onDownloadRequest={onDownloadRequest} 
              onDownloadAudio={onDownloadAudio}
              onExtractAudio={onExtractAudio} 
              onDeleteVideo={onDeleteVideo}
              onDeleteAudio={onDeleteAudio}
              onDownloadVtt={onDownloadVtt}
              onDeleteVtt={onDeleteVtt}
              onNaturalSegmentVtt={onNaturalSegmentVtt}
              onMergeVtt={onMergeVtt}
              onProcessSrt={onProcessSrt}
              onDeleteSrt={onDeleteSrt}
              onDeleteAss={onDeleteAss}
              onTranscribeWhisperX={onTranscribeWhisperX}
              onDeleteWhisperX={onDeleteWhisperX}
              onSplitTranscribeWhisperX={onSplitTranscribeWhisperX}
              onCreateVideo={onCreateVideo}
              // Pass sorting props
              sortField={sortField}
              sortOrder={sortOrder}
              handleSort={handleSort}
              SortIndicator={SortIndicator}
            />
          )}
          {tasks.length === 0 && !isLoading && <p className="text-center text-gray-500 mt-4">No tasks ingested yet.</p>}
        </div>
      )}
    </div>
  );
}

export default TaskList; 