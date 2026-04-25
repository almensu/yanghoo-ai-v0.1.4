import { useState } from 'react';
import { Undo2, Search, Filter, X } from 'lucide-react';
import CardView from './CardView';
import TableView from './TableView';

function TaskList({ 
  tasks = [], 
  isLoading, 
  error, 
  onDelete, 
  onArchive, 
  onRestoreArchived,
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
  onMergeSrt,
  onDeleteSrt,
  onDeleteAss,
  onTranscribeWhisperX,
  onDeleteWhisperX,
  onSplitTranscribeWhisperX,
  onCreateVideo,
  onOpenFolder,
  onGoToStudio,
  sortField,
  sortOrder,
  handleSort,
  SortIndicator,
  // New props for filtering
  searchQuery,
  setSearchQuery,
  platformFilter,
  setPlatformFilter,
  archiveFilter,
  setArchiveFilter,
  assetFilter,
  setAssetFilter,
  totalTasksCount // Total tasks count before filtering
}) {
  const [viewMode, setViewMode] = useState('card');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const clearFilters = () => {
    setSearchQuery('');
    setPlatformFilter('all');
    setArchiveFilter('active');
    setAssetFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || platformFilter !== 'all' || archiveFilter !== 'active' || assetFilter !== 'all';

  return (
    <div className="p-6 bg-base-100 rounded-box shadow-lg flex flex-col gap-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Ingested Tasks 
            <span className="badge badge-neutral badge-sm font-normal">{tasks.length} / {totalTasksCount}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Search title, url, uuid..." 
              className="input input-bordered input-sm w-full pl-9 pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button 
            className={`btn btn-sm ${isFilterOpen || hasActiveFilters ? 'btn-primary' : 'btn-ghost btn-outline'} gap-1`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="badge badge-xs badge-secondary p-1"></span>}
          </button>

          <div className="tabs tabs-boxed">
            <button type="button" className={`tab tab-sm ${viewMode === 'card' ? 'tab-active' : ''}`} onClick={() => setViewMode('card')}>Card</button>
            <button type="button" className={`tab tab-sm ${viewMode === 'table' ? 'tab-active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-base-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-xs font-semibold uppercase opacity-60">Platform</span></label>
            <select className="select select-bordered select-sm" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
              <option value="all">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="xiaoyuzhou">Xiaoyuzhou</option>
              <option value="podcast">Podcast</option>
              <option value="bilibili">Bilibili</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label py-1"><span className="label-text text-xs font-semibold uppercase opacity-60">Archive Status</span></label>
            <select className="select select-bordered select-sm" value={archiveFilter} onChange={(e) => setArchiveFilter(e.target.value)}>
              <option value="active">Active Only</option>
              <option value="archived">Archived Only</option>
              <option value="all">All (Incl. Archived)</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label py-1"><span className="label-text text-xs font-semibold uppercase opacity-60">Asset Status</span></label>
            <select className="select select-bordered select-sm" value={assetFilter} onChange={(e) => setAssetFilter(e.target.value)}>
              <option value="all">Any Assets</option>
              <option value="has_subtitles">Has Subtitles</option>
              <option value="has_markdown">Has Markdown</option>
              <option value="has_keyframes">Has Keyframes</option>
            </select>
          </div>

          <div className="form-control justify-end">
            <button className="btn btn-ghost btn-sm gap-1 text-error hover:bg-error/10" onClick={clearFilters} disabled={!hasActiveFilters}>
              <X className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>
      )}

      {/* Loading/Error state for task list */} 
      {isLoading && (
        <div className="flex flex-col items-center py-20 gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/60 animate-pulse">Loading your tasks...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg">
          <X className="w-6 h-6" />
          <span>Error loading tasks: {error}</span>
        </div>
      )}

      {/* Task Content */} 
      {!isLoading && !error && (
        <>
          {tasks.length > 0 ? (
            <div>
              {viewMode === 'card' ? (
                <CardView 
                  tasks={tasks}
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
                  onMergeSrt={onMergeSrt}
                  onDeleteSrt={onDeleteSrt}
                  onDeleteAss={onDeleteAss}
                  onTranscribeWhisperX={onTranscribeWhisperX}
                  onDeleteWhisperX={onDeleteWhisperX}
                  onSplitTranscribeWhisperX={onSplitTranscribeWhisperX}
                  onCreateVideo={onCreateVideo}
                  onOpenFolder={onOpenFolder}
                  onGoToStudio={onGoToStudio}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  handleSort={handleSort}
                  SortIndicator={SortIndicator}
                />
              ) : (
                <TableView 
                  tasks={tasks}
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
                  onMergeSrt={onMergeSrt}
                  onDeleteSrt={onDeleteSrt}
                  onDeleteAss={onDeleteAss}
                  onTranscribeWhisperX={onTranscribeWhisperX}
                  onDeleteWhisperX={onDeleteWhisperX}
                  onSplitTranscribeWhisperX={onSplitTranscribeWhisperX}
                  onCreateVideo={onCreateVideo}
                  onOpenFolder={onOpenFolder}
                  onGoToStudio={onGoToStudio}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  handleSort={handleSort}
                  SortIndicator={SortIndicator}
                />
              )}
            </div>
          ) : (
            /* Empty or No Results State */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-base-200/30 rounded-xl border-2 border-dashed border-base-300">
               {totalTasksCount === 0 ? (
                 <>
                   <div className="bg-primary/10 p-4 rounded-full mb-4">
                     <Search className="w-10 h-10 text-primary opacity-40" strokeWidth={1.5} />
                   </div>
                   <h3 className="text-lg font-bold mb-1">No tasks yet</h3>
                   <p className="text-base-content/60 max-w-xs mb-6">Start by ingesting a media URL from YouTube or a Podcast feed above.</p>
                   {onRestoreArchived && (
                      <button className="btn btn-sm btn-outline gap-1" onClick={onRestoreArchived}>
                        <Undo2 className="w-4 h-4"/> Restore Archived
                      </button>
                   )}
                 </>
               ) : (
                 <>
                   <div className="bg-base-300 p-4 rounded-full mb-4">
                     <Filter className="w-10 h-10 text-base-content/20" strokeWidth={1.5} />
                   </div>
                   <h3 className="text-lg font-bold mb-1">No matches found</h3>
                   <p className="text-base-content/60 max-w-xs mb-6">Adjust your filters or search terms to find what you're looking for.</p>
                   <button className="btn btn-sm btn-primary btn-outline" onClick={clearFilters}>Clear All Filters</button>
                 </>
               )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TaskList; 
 