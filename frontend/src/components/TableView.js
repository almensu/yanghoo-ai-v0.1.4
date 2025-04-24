import React from 'react';

// Basic placeholder for image loading/error (Could be shared in a utils file)
const ImageWithFallback = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [error, setError] = React.useState(false);
  const backendUrl = 'http://127.0.0.1:8000'; 
  const placeholder = "https://via.placeholder.com/40/eeeeee/999999?text=N/A"; // Smaller placeholder

  React.useEffect(() => {
    // Reset error state if src prop changes
    setCurrentSrc(src);
    setError(false);
  }, [src]);

  const onError = () => {
    // Only set error flag if it wasn't already the placeholder
    if (finalSrc !== placeholder) {
        setError(true);
    }
  };

  // Determine the final source URL
  let finalSrc;
  if (error || !currentSrc) {
    // If an error occurred loading the actual image OR if src prop was initially null/empty,
    // use the external placeholder directly.
    finalSrc = placeholder;
  } else if (currentSrc.startsWith('http')) {
     // If src is already an absolute URL (e.g., placeholder), use it.
     finalSrc = currentSrc;
  } else {
    // Otherwise, construct the backend URL
    // Strip "data/" prefix 
    const relativePath = currentSrc.startsWith('data/') ? currentSrc.substring(5) : currentSrc;
    finalSrc = `${backendUrl}/files/${relativePath}`;
  }

  return <img src={finalSrc} alt={alt} className={className} onError={onError} />;
};

function TableView({ tasks, onDelete, onDownloadRequest }) {
  if (!tasks || tasks.length === 0) {
    return null; 
  }

  const videoQualities = ['best', '1080p', '720p', '360p'];

  return (
    <div className="overflow-x-auto">
      <table className="table w-full table-zebra table-compact">
        {/* Head */}
        <thead>
          <tr>
            <th></th> {/* Empty for potential checkbox or index */}
            <th>Thumbnail</th>
            <th>Title</th>
            <th>Platform</th>
            <th>URL</th>
            <th>UUID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Rows */}
          {tasks.map((task, index) => (
            <tr key={task.uuid} className="hover">
              <th>{index + 1}</th>
              <td>
                <div className="avatar">
                  <div className="w-10 h-10 rounded">
                     <ImageWithFallback 
                       src={task.thumbnail_path}
                       alt="Thumb"
                       className="object-cover"
                      />
                  </div>
                </div>
              </td>
              <td>
                 <div className="font-bold line-clamp-2" title={task.title}> 
                   {task.title || 'N/A'}
                 </div>
              </td>
              <td><span className="badge badge-ghost badge-sm">{task.platform}</span></td>
              <td><a href={task.url} target="_blank" rel="noopener noreferrer" className="link link-hover text-xs truncate block max-w-xs" title={task.url}>{task.url}</a></td>
              <td className="text-xs font-mono" title={task.uuid}>{task.uuid.substring(0, 8)}...</td>
              <td>
                <div className="flex gap-1 items-center"> {/* Group buttons, align center */}
                  {/* Audio Button */}
                  <button 
                    className="btn btn-info btn-xs btn-outline" 
                    onClick={() => onDownloadRequest(task.uuid, 'bestaudio')}
                  >
                    Audio
                  </button>
                  {/* Video Dropdown */}
                  <div className="dropdown dropdown-left"> {/* Dropdown left for table view */}
                    <button tabIndex={0} className="btn btn-success btn-xs btn-outline">Video</button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-32 z-[1]">
                      {videoQualities.map(quality => (
                        <li key={quality}>
                          <a onClick={() => onDownloadRequest(task.uuid, quality)}>{quality}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Delete Button */}
                  <button 
                    className="btn btn-error btn-xs btn-outline" 
                    onClick={() => onDelete(task.uuid)}
                 >
                   Delete
                 </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
         {/* Foot - Optional */}
        <tfoot>
          <tr>
             <th></th> 
             <th>Thumbnail</th>
             <th>Title</th>
             <th>Platform</th>
             <th>URL</th>
             <th>UUID</th>
             <th>Actions</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TableView; 