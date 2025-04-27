import { useState } from 'react';

// Pass API_BASE_URL and onIngestComplete as props
function IngestForm({ API_BASE_URL, onIngestComplete }) {
  const [url, setUrl] = useState('');
  const [ingestResponse, setIngestResponse] = useState(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestError, setIngestError] = useState(null);

  const handleIngestSubmit = async (event) => {
    event.preventDefault();
    setIngestLoading(true);
    setIngestError(null);
    setIngestResponse(null);
    let ingestedTaskUuid = null;

    try {
      // --- Step 1: Ingest URL ---
      // Use the passed API_BASE_URL
      const ingestRes = await fetch(`${API_BASE_URL}/api/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const ingestData = await ingestRes.json();
      if (!ingestRes.ok) {
        throw new Error(`Ingest failed: ${ingestData.detail || `HTTP error! status: ${ingestRes.status}`}`);
      }

      ingestedTaskUuid = ingestData.metadata?.uuid;
      if (!ingestedTaskUuid) {
          throw new Error("Ingest successful, but no UUID received in metadata.");
      }

      setIngestResponse(ingestData);
      setUrl(''); // Clear input on initial success

      // --- Step 2: Fetch Info JSON ---
      console.log(`Ingest successful for ${ingestedTaskUuid}. Now fetching info.json...`);
      try {
         // Use the passed API_BASE_URL
         const fetchInfoRes = await fetch(`${API_BASE_URL}/api/tasks/${ingestedTaskUuid}/fetch_info_json`, {
             method: 'POST',
         });
         const fetchInfoData = await fetchInfoRes.json();
         if (!fetchInfoRes.ok) {
             console.error(`Failed to fetch info.json for ${ingestedTaskUuid}: ${fetchInfoData.detail || `HTTP error! status: ${fetchInfoRes.status}`}`);
             setIngestError(`Ingest successful, but failed to auto-fetch info.json: ${fetchInfoData.detail || fetchInfoRes.statusText}`);
         } else {
              console.log(`Successfully fetched info.json for ${ingestedTaskUuid}`, fetchInfoData);
         }
      } catch (fetchInfoError) {
          console.error(`Error during fetch_info_json call for ${ingestedTaskUuid}:`, fetchInfoError);
          setIngestError(`Ingest successful, but an error occurred during auto-fetch of info.json: ${fetchInfoError.message}`);
      }

      // --- Step 3: Trigger Task List Refresh in App.js ---
      if (onIngestComplete) {
        onIngestComplete(); // Call the callback prop
      }

    } catch (e) {
      console.error("Error during ingest process:", e);
      setIngestError(e.message || 'An unexpected error occurred during ingest.');
    } finally {
      setIngestLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-base-200 rounded-box shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Ingest New URL</h1>
      <form onSubmit={handleIngestSubmit} className="flex items-end gap-2">
        <div className="form-control flex-grow">
           <label htmlFor="url-input" className="label">
              <span className="label-text">URL to Ingest:</span>
           </label>
           <input
              id="url-input"
              type="text"
              placeholder="Enter URL and press Enter"
              className="input input-bordered w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={ingestLoading}
            />
        </div>
         <button type="submit" className={`btn btn-primary ${ingestLoading ? 'loading' : ''}`} disabled={ingestLoading || !url}>
            Ingest
          </button>
      </form>
      {ingestLoading && <p className="text-info mt-2">Ingesting...</p>}
      {ingestError && <p className="text-error mt-2">Error: {ingestError}</p>}
      {ingestResponse && !ingestError && (
         <p className="text-success mt-2">
           Ingest successful! Task created with UUID: {ingestResponse.metadata?.uuid}
         </p>
      )}
    </div>
  );
}

export default IngestForm; 