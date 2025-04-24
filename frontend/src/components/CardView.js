import React from 'react';

// Basic placeholder for image loading/error
const ImageWithFallback = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [error, setError] = React.useState(false);
  const backendUrl = 'http://127.0.0.1:8000'; 
  const placeholder = "https://via.placeholder.com/150/eeeeee/999999?text=No+Image";

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
     // This case might overlap with !currentSrc if placeholder was set initially, which is fine.
     finalSrc = currentSrc;
  } else {
    // Otherwise, construct the backend URL
    // Strip "data/" prefix 
    const relativePath = currentSrc.startsWith('data/') ? currentSrc.substring(5) : currentSrc;
    finalSrc = `${backendUrl}/files/${relativePath}`;
  }

  return <img src={finalSrc} alt={alt} className={className} onError={onError} />;
};


function CardView({ tasks, onDelete, onDownloadRequest }) {
  if (!tasks || tasks.length === 0) {
    // This case is handled in App.js, but good practice to check
    return null; 
  }

  const videoQualities = ['best', '1080p', '720p', '360p'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tasks.map((task) => (
        <div key={task.uuid} className="card bg-base-100 shadow-xl border border-base-300">
          <figure className="h-48 overflow-hidden"> {/* Fixed height for image area */}
             <ImageWithFallback 
               src={task.thumbnail_path}
               alt={task.title || 'Thumbnail'} 
               className="object-cover w-full h-full" // Cover ensures image fills the area
              />
          </figure>
          <div className="card-body p-4">
            <h2 className="card-title text-base line-clamp-2" title={task.title}> {/* Limit title lines */} 
              {task.title || 'No Title'}
            </h2>
            <p className="text-xs text-gray-500 truncate" title={task.url}>{task.url}</p>
            <div className="card-actions justify-between items-center mt-2">
              <span className="badge badge-outline badge-sm">{task.platform}</span>
              <div className="flex gap-1"> {/* Group buttons */}
                {/* Audio Button */}
                <button 
                  className="btn btn-info btn-xs btn-outline" 
                  onClick={() => onDownloadRequest(task.uuid, 'bestaudio')} 
                >
                  Audio
                </button>
                {/* Video Dropdown */}
                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className="btn btn-success btn-xs btn-outline">Video</button>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-32 z-[1]"> {/* Ensure z-index */}
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
                  // Consider adding a loading state per card if deletion is slow
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardView; 