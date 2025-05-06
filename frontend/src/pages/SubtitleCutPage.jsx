import React, { useState, useEffect } from 'react';
// We will import necessary components later
// import VideoPlayer from '../components/VideoPlayer';
// import VttPreviewer from '../components/VttPreviewer';
// import FileUpload from '../components/FileUpload'; // Or a new component
// import { parseVtt } from '../utils/vttParser'; // Assume a parser function exists

function SubtitleCutPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [vttFile, setVttFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(''); // State for video object URL
  const [cues, setCues] = useState([]); // To hold parsed VTT cues
  const [selectedCues, setSelectedCues] = useState(new Set()); // Use Set for easier add/delete

  // Clean up object URL when component unmounts or videoFile changes
  useEffect(() => {
    let currentVideoUrl = '';
    if (videoFile) {
      currentVideoUrl = URL.createObjectURL(videoFile);
      setVideoUrl(currentVideoUrl);
    } else {
      setVideoUrl(''); // Reset if no file
    }

    // Cleanup function
    return () => {
      if (currentVideoUrl) {
        URL.revokeObjectURL(currentVideoUrl);
      }
    };
  }, [videoFile]);

  const handleVideoUpload = (file) => {
    if (file) {
      setVideoFile(file);
    } else {
      setVideoFile(null); // Handle deselection or cancellation
    }
  };

  // --- Simple VTT Parser (Example) ---
  // A more robust parser should handle various VTT features and edge cases
  const simpleVttParser = (vttContent) => {
    const lines = vttContent.trim().split('\n\n');
    const parsedCues = [];
    let idCounter = 0;

    if (!lines[0].startsWith('WEBVTT')) {
      console.warn("VTT file doesn't start with WEBVTT header.");
      // Optionally return empty or throw error
    }

    // Start parsing from the first cue block (skip header if present)
    const startIndex = lines[0].startsWith('WEBVTT') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const block = lines[i].split('\n');
      if (block.length < 2) continue; // Malformed block

      // Find the timestamp line (usually the first or second line)
      let timeLineIndex = -1;
      if (block[0].includes('-->')) {
        timeLineIndex = 0;
      } else if (block.length > 1 && block[1].includes('-->')) {
        timeLineIndex = 1;
      }

      if (timeLineIndex !== -1) {
        const timeMatch = block[timeLineIndex].match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
        if (timeMatch) {
          const startTimeStr = timeMatch[1];
          const endTimeStr = timeMatch[2];
          // Simple text joining, skipping timestamp and potential ID line
          const text = block.slice(timeLineIndex + 1).join('\n').trim();

          // Convert HH:MM:SS.mmm to seconds
          const timeToSeconds = (timeStr) => {
            const parts = timeStr.split(':');
            const secondsParts = parts[2].split('.');
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(secondsParts[0]) + parseInt(secondsParts[1]) / 1000;
          };

          parsedCues.push({
            id: `cue-${idCounter++}`, // Generate a simple unique ID
            startTime: timeToSeconds(startTimeStr),
            endTime: timeToSeconds(endTimeStr),
            text: text,
          });
        }
      }
    }
    console.log("Parsed Cues:", parsedCues);
    return parsedCues;
  };
  // --- End Simple VTT Parser ---

  const handleVttUpload = (file) => {
    if (file) {
      setVttFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        try {
          // Replace with a robust parser later
          const parsed = simpleVttParser(content);
          // const parsed = parseVtt(content); // Using the util function
          setCues(parsed);
          setSelectedCues(new Set()); // Reset selection on new file upload
        } catch (error) {
          console.error("Error parsing VTT file:", error);
          alert("无法解析 VTT 文件。请检查文件格式是否正确。");
          setCues([]); // Clear cues on error
          setSelectedCues(new Set());
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading VTT file:", error);
        alert("读取 VTT 文件时出错。");
        setCues([]);
        setSelectedCues(new Set());
      };
      reader.readAsText(file); // Read the file as text
    } else {
      setVttFile(null); // Handle deselection or cancellation
      setCues([]);
      setSelectedCues(new Set());
    }
  };

  const handleCueSelection = (cueId) => {
    setSelectedCues(prevSelected => {
      const newSelection = new Set(prevSelected);
      if (newSelection.has(cueId)) {
        newSelection.delete(cueId);
      } else {
        newSelection.add(cueId);
      }
      return newSelection;
    });
  };

  const handleCutVideo = () => {
    // Convert Set back to Array or process directly if needed
    const selectedCueIds = Array.from(selectedCues);

    if (!videoFile || !vttFile || selectedCueIds.length === 0) {
      alert('请先上传视频和字幕文件，并选择要保留的字幕片段。');
      return;
    }

    const segmentsToKeep = cues
      .filter(cue => selectedCueIds.includes(cue.id)) // Filter based on selected IDs
      .map(cue => ({ start: cue.startTime, end: cue.endTime }))
       // Optional: Sort segments by start time
      .sort((a, b) => a.start - b.start);

     // Optional: Merge overlapping or adjacent segments if needed
     // ... merging logic ...

    console.log('Selected segments (time in seconds):', segmentsToKeep);

    // TODO: Call backend API to perform the cut
    // videoEditAPI.cutVideo(videoFile, segmentsToKeep)
    //  .then(result => console.log('Cut video result:', result))
    //  .catch(error => console.error('Error cutting video:', error));

    console.log('Initiating video cut with selected cue IDs:', selectedCueIds);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px' }}>
      <h1>字幕剪辑视频</h1>

      {/* File Upload Section */}
      <div>
        <label style={{ marginRight: '15px' }}>
          上传视频:
          <input type="file" accept="video/*" onChange={(e) => handleVideoUpload(e.target.files[0])} />
        </label>
        <label>
          上传 VTT 字幕:
          <input type="file" accept=".vtt" onChange={(e) => handleVttUpload(e.target.files[0])} />
        </label>
      </div>

      {/* Player and Previewer Section */}
      <div style={{ display: 'flex', flexGrow: 1, marginTop: '20px', overflow: 'hidden' }}> {/* Added overflow: hidden */}
        <div style={{ flex: 1, marginRight: '10px', border: '1px solid #ccc', overflow: 'hidden' }}> {/* Added border and overflow */}
          {videoUrl ? (
            /* <VideoPlayer src={videoUrl} /> */
            <video controls src={videoUrl} style={{ width: '100%', height: '100%' }}></video> /* Using native video for now */
          ) : (
            <p style={{ padding: '20px' }}>请上传视频文件</p>
          )}
        </div>
        <div style={{ flex: 1, marginLeft: '10px', border: '1px solid #ccc', overflowY: 'auto' }}> {/* Added border */}
          {cues.length > 0 ? (
            /* <VttPreviewer cues={cues} onSelectCue={handleCueSelection} selectedCues={selectedCues} /> */
             /* Basic list for now, replace with VttPreviewer */
            <ul style={{ listStyle: 'none', padding: '10px', margin: 0 }}>
              {cues.map((cue) => (
                <li
                  key={cue.id}
                  onClick={() => handleCueSelection(cue.id)}
                  style={{
                    padding: '8px',
                    marginBottom: '5px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: selectedCues.has(cue.id) ? '#d0e0f0' : 'transparent', // Highlight selected
                    transition: 'background-color 0.2s',
                  }}
                >
                  <strong>{cue.startTime.toFixed(3)} - {cue.endTime.toFixed(3)}</strong>
                  <p style={{ margin: '5px 0 0' }}>{cue.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ padding: '20px' }}>{vttFile ? '正在解析或解析失败...' : '请上传 VTT 字幕文件'}</p>
          )}
        </div>
      </div>

      {/* Action Button Section */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}> {/* Centered button */}
        <button
          onClick={handleCutVideo}
          disabled={!videoFile || !vttFile || cues.length === 0 || selectedCues.size === 0} // Disable if no cues or no selection
          style={{ padding: '10px 20px', fontSize: '16px' }} // Style button
        >
          开始剪辑 ({selectedCues.size} 条选中)
        </button>
      </div>
    </div>
  );
}

export default SubtitleCutPage; 