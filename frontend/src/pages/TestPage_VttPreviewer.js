import React, { useState, useEffect, useRef, useCallback } from 'react';
import VideoPlayer from '../components/VideoPlayer'; 
// import VttPreviewer from '../components/VttPreviewer'; // No longer using the component directly
import { WebVTTParser } from 'webvtt-parser'; // Import parser

// --- Hardcoded VTT Content ---
const hardcodedVttEn = `WEBVTT
Kind: captions
Language: en

00:00:08.400 --> 00:00:13.430 align:start position:0%
 
the<00:00:08.639><c> thing</c><00:00:08.880><c> i</c><00:00:09.040><c> would</c><00:00:09.280><c> say</c><00:00:09.599><c> is</c>

00:00:13.430 --> 00:00:13.440 align:start position:0%
 
 

00:00:13.440 --> 00:00:16.150 align:start position:0%
 
when<00:00:13.599><c> you</c><00:00:13.840><c> grow</c><00:00:14.240><c> up</c><00:00:14.480><c> you</c><00:00:14.719><c> tend</c><00:00:15.120><c> to</c><00:00:15.519><c> get</c><00:00:15.759><c> told</c>

00:00:16.150 --> 00:00:16.160 align:start position:0%
when you grow up you tend to get told
 

00:00:16.160 --> 00:00:20.230 align:start position:0%
when you grow up you tend to get told
that<00:00:16.320><c> the</c><00:00:16.560><c> world</c><00:00:17.039><c> is</c><00:00:17.199><c> the</c><00:00:17.359><c> way</c><00:00:17.520><c> it</c><00:00:17.760><c> is</c><00:00:18.400><c> and</c><00:00:18.640><c> your</c>

00:00:20.230 --> 00:00:20.240 align:start position:0%
that the world is the way it is and your
 
`;

const hardcodedVttZh = `WEBVTT
Kind: captions
Language: zh-Hans

00:00:08.400 --> 00:00:13.430 align:start position:0%
 
我<00:00:08.639><c>想</c><00:00:08.878><c>说</c><00:00:09.117><c>的</c><00:00:09.356><c>是</c><00:00:09.595><c>，</c>

00:00:13.430 --> 00:00:13.440 align:start position:0%
 
 

00:00:13.440 --> 00:00:16.150 align:start position:0%
 
当<00:00:13.697><c>你</c><00:00:13.954><c>长大</c><00:00:14.211><c>后</c><00:00:14.468><c>，</c><00:00:14.725><c>你</c><00:00:14.982><c>往往</c><00:00:15.239><c>会</c><00:00:15.496><c>被</c><00:00:15.753><c>告知</c>

00:00:16.150 --> 00:00:16.160 align:start position:0%
当你长大后，你往往会被告知
 

00:00:16.160 --> 00:00:20.230 align:start position:0%
当你长大后，你往往会被告知
世界<00:00:16.573><c>就</c><00:00:16.986><c>是</c><00:00:17.399><c>这样</c><00:00:17.812><c>，</c><00:00:18.225><c>你</c><00:00:18.638><c>的</c>

00:00:20.230 --> 00:00:20.240 align:start position:0%
世界就是这样，你的
 
`;
// ------------------------------

// Helper function to format time (reuse from VttPreviewer)
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return '00:00:00.000';
  }
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
};

// Helper to combine cues (simple time proximity logic)
const combineCues = (cues1, cues2, timeThreshold = 0.5) => {
    const combined = [];
    const cues2Used = new Set(); // Keep track of used cues2

    cues1.forEach(cue1 => {
        let bestMatch = null;
        let minDiff = Infinity;

        cues2.forEach((cue2, index) => {
            if (!cues2Used.has(index)) {
                const diff = Math.abs(cue1.startTime - cue2.startTime);
                if (diff < timeThreshold && diff < minDiff) {
                    minDiff = diff;
                    bestMatch = { cue: cue2, index: index };
                }
            }
        });

        let combinedCue = {
            startTime: cue1.startTime,
            endTime: cue1.endTime, // Use cue1's timing primarily
            text1: cue1.text,
            text2: null
        };

        if (bestMatch) {
            combinedCue.text2 = bestMatch.cue.text;
            cues2Used.add(bestMatch.index);
        }
        combined.push(combinedCue);
    });
    
    cues2.forEach((cue2, index) => {
         if (!cues2Used.has(index)) {
              combined.push({
                   startTime: cue2.startTime,
                   endTime: cue2.endTime,
                   text1: null,
                   text2: cue2.text
              });
         }
    });
    
    combined.sort((a, b) => a.startTime - b.startTime);
    return combined;
};


const TestPage_VttPreviewer = () => {
  // Removed taskData, loading, error states
  const [vttEn, setVttEn] = useState(`WEBVTT
Kind: captions
Language: en

00:00:01.000 --> 00:00:05.000
Hello, and welcome to this presentation.

00:00:06.000 --> 00:00:10.000
Today we will discuss important concepts.

00:00:11.000 --> 00:00:15.000
Let's begin with the first topic.`);

  const [vttZh, setVttZh] = useState(`WEBVTT
Kind: captions
Language: zh-Hans

00:00:01.000 --> 00:00:05.000
大家好，欢迎收看本次演示。

00:00:06.000 --> 00:00:10.000
今天我们将讨论重要概念。

00:00:11.000 --> 00:00:15.000
让我们从第一个主题开始。`);

  // Additional test cases for VTT parsing
  const testCases = [
    {
      name: "Standard format",
      content: `WEBVTT

00:00:01.000 --> 00:00:05.000
Standard format with proper spacing.`
    },
    {
      name: "With metadata",
      content: `WEBVTT
Kind: captions
Language: en

00:00:01.000 --> 00:00:05.000
VTT with metadata.`
    },
    {
      name: "Missing blank after WEBVTT",
      content: `WEBVTT
00:00:01.000 --> 00:00:05.000
Missing blank line after WEBVTT.`
    },
    {
      name: "With cue identifiers",
      content: `WEBVTT

cue1
00:00:01.000 --> 00:00:05.000
VTT with cue identifiers.

cue2
00:00:06.000 --> 00:00:10.000
Second cue with identifier.`
    },
    {
      name: "Missing WEBVTT header",
      content: `00:00:01.000 --> 00:00:05.000
No WEBVTT header at all.

00:00:06.000 --> 00:00:10.000
Second cue without header.`
    },
    {
      name: "Malformed timestamps",
      content: `WEBVTT

00:00:01.000-->00:00:05.000
Timestamps without spaces.

00:00:06.000-->00:00:10.000
Another malformed timestamp.`
    },
    {
      name: "Extra spacing in cues",
      content: `WEBVTT

00:00:01.000 --> 00:00:05.000

Text with blank line before it.

00:00:06.000 --> 00:00:10.000


Multiple blank lines before text.`
    },
    {
      name: "Inconsistent line endings",
      content: `WEBVTT\r
Kind: captions\r
\r
00:00:01.000 --> 00:00:05.000\r
Mixed line endings with CR+LF.`
    },
    {
      name: "Broken cue timing",
      content: `WEBVTT

00:00:xx.000 --> 00:00:05.000
Invalid start time.

00:00:01.000 --> 00:abc:05.000
Invalid end time.`
    }
  ];

  const [parsedCuesEn, setParsedCuesEn] = useState([]);
  const [parsedCuesZh, setParsedCuesZh] = useState([]);
  const [combinedCues, setCombinedCues] = useState([]);
  const [displayMode, setDisplayMode] = useState('en'); // 'en', 'zh', 'both'
  const [activeCueIndex, setActiveCueIndex] = useState(-1);
  
  const videoPlayerRef = useRef(null); // Ref for the VideoPlayer's video element
  const cueListRef = useRef(null); // Ref for the scrollable list container
  const activeCueRef = useRef(null); // Ref for the currently active cue element

  // Hardcoded video source details for this test
  const testTaskUuid = "dc7d6006-815c-4a62-a09e-c6233a21219d"; 
  const videoFilename = "video_360p.mp4"; // Use the correct filename
  const apiBaseUrl = 'http://127.0.0.1:8000'; // Corrected IP address
  const localVideoRelativePath = `${testTaskUuid}/${videoFilename}`;
  const videoTitle = "VTT Preview Test Video (Hardcoded)";

  // Removed useEffect for fetching API data

  // Effect to parse VTT when content changes (runs once on load)
  useEffect(() => {
    const parseVtt = (vttString, lang) => {
        if (!vttString || vttString.trim() === '') return [];
        
        let parser = new WebVTTParser();
        
        // Pre-process the VTT string to fix common issues
        let preprocessedVtt = vttString;
        
        // Ensure file starts with WEBVTT
        if (!preprocessedVtt.trim().startsWith('WEBVTT')) {
            preprocessedVtt = 'WEBVTT\n\n' + preprocessedVtt;
        }
        
        // Ensure there's a blank line after WEBVTT header
        if (preprocessedVtt.startsWith('WEBVTT') && !preprocessedVtt.startsWith('WEBVTT\n\n')) {
            preprocessedVtt = preprocessedVtt.replace('WEBVTT', 'WEBVTT\n');
            // Add another newline if needed
            if (!preprocessedVtt.startsWith('WEBVTT\n\n')) {
                preprocessedVtt = preprocessedVtt.replace('WEBVTT\n', 'WEBVTT\n\n');
            }
        }
        
        // Handle metadata lines properly
        const lines = preprocessedVtt.split('\n');
        const metadataEndIndex = lines.findIndex((line, i) => 
            i > 0 && line.includes('-->') || (line.trim() === '' && i > 2)
        );
        
        if (metadataEndIndex > 0) {
            // Ensure blank line after metadata
            if (lines[metadataEndIndex].trim() !== '') {
                lines.splice(metadataEndIndex, 0, '');
                preprocessedVtt = lines.join('\n');
            }
        }
        
        // Check for and fix malformed timestamp lines
        for (let i = 0; i < lines.length; i++) {
            // Fix timestamps missing spaces around the arrow
            if (lines[i].includes('-->')) {
                lines[i] = lines[i].replace(/(\d\d:\d\d:\d\d\.\d\d\d)-->(\d\d:\d\d:\d\d\.\d\d\d)/g, '$1 --> $2');
                // Ensure proper spacing around arrow
                lines[i] = lines[i].replace(/(\d\d:\d\d:\d\d\.\d\d\d)\s*-->\s*(\d\d:\d\d:\d\d\.\d\d\d)/g, '$1 --> $2');
            }
        }
        preprocessedVtt = lines.join('\n');
        
        try {
            const tree = parser.parse(preprocessedVtt, 'metadata');
            
            if (tree.errors.length > 0) {
                // Log detailed errors but continue with what was parsed
                console.warn(`VTT (${lang}) parsing encountered ${tree.errors.length} errors:`, 
                    tree.errors.slice(0, 3).map(e => e.message || e).join(', ') + 
                    (tree.errors.length > 3 ? ` (and ${tree.errors.length - 3} more)` : ''));
            }
            
            if (tree.cues.length === 0) {
                throw new Error('Parser returned zero cues');
            }
            
            const parsed = tree.cues.map(cue => ({
                startTime: cue.startTime,
                endTime: cue.endTime,
                text: cue.text.replace(/\n/g, ' ')
            })).sort((a, b) => a.startTime - b.startTime);
            
            return parsed;
        } catch (err) {
            console.error(`Error parsing VTT (${lang}):`, err);
            
            // Try a more aggressive fallback approach
            try {
                console.warn(`Attempting fallback parsing for ${lang} VTT`);
                
                // Strip all metadata and just keep cues
                const simplifiedVtt = 'WEBVTT\n\n' + 
                    vttString.split('\n')
                        .filter(line => line.includes('-->') || 
                                       (line.trim() !== '' && 
                                        !line.startsWith('WEBVTT') && 
                                        !line.startsWith('Kind:') && 
                                        !line.startsWith('Language:')))
                        .join('\n')
                        // Fix any malformed timestamps
                        .replace(/(\d\d:\d\d:\d\d\.\d\d\d)-->(\d\d:\d\d:\d\d\.\d\d\d)/g, '$1 --> $2');
                
                const fallbackTree = parser.parse(simplifiedVtt, 'metadata');
                console.warn(`Used fallback parsing for ${lang}, recovered ${fallbackTree.cues.length} cues`);
                
                if (fallbackTree.cues.length === 0) {
                    throw new Error('Fallback parsing returned zero cues');
                }
                
                const fallbackParsed = fallbackTree.cues.map(cue => ({
                    startTime: cue.startTime,
                    endTime: cue.endTime,
                    text: cue.text.replace(/\n/g, ' ')
                })).sort((a, b) => a.startTime - b.startTime);
                
                return fallbackParsed;
            } catch (fallbackErr) {
                console.error(`Fallback parsing also failed for ${lang}:`, fallbackErr);
                
                // Last resort: try to extract timestamps and text manually
                try {
                    console.warn(`Attempting manual extraction for ${lang} VTT`);
                    const manualCues = [];
                    const timestampRegex = /(\d\d:\d\d:\d\d\.\d\d\d)\s*-->\s*(\d\d:\d\d:\d\d\.\d\d\d)/g;
                    
                    let matches;
                    const allText = vttString.split('\n');
                    for (let i = 0; i < allText.length; i++) {
                        if (timestampRegex.test(allText[i])) {
                            // Reset the regex because test() advances the lastIndex
                            timestampRegex.lastIndex = 0;
                            matches = timestampRegex.exec(allText[i]);
                            
                            if (matches && matches.length >= 3) {
                                // Parse timestamps
                                const startParts = matches[1].split(':').map(Number);
                                const endParts = matches[2].split(':').map(Number);
                                
                                const startTime = startParts[0] * 3600 + startParts[1] * 60 + 
                                                parseFloat(startParts[2]);
                                const endTime = endParts[0] * 3600 + endParts[1] * 60 + 
                                              parseFloat(endParts[2]);
                                
                                // Get text from next line(s)
                                let text = '';
                                let j = i + 1;
                                while (j < allText.length && 
                                      !timestampRegex.test(allText[j]) && 
                                      allText[j].trim() !== '') {
                                    text += (text ? ' ' : '') + allText[j].trim();
                                    j++;
                                }
                                
                                manualCues.push({
                                    startTime,
                                    endTime,
                                    text: text || '[No text content]'
                                });
                            }
                        }
                    }
                    
                    console.warn(`Manual extraction recovered ${manualCues.length} cues for ${lang}`);
                    return manualCues.length > 0 ? manualCues : [];
                } catch (manualErr) {
                    console.error(`All parsing methods failed for ${lang}:`, manualErr);
                    return [];
                }
            }
        }
    };
    
    setParsedCuesEn(parseVtt(vttEn, 'EN'));
    setParsedCuesZh(parseVtt(vttZh, 'ZH'));

  }, [vttEn, vttZh]); // Run only when hardcoded strings change (i.e., on load)

  // Effect to combine cues when parsed cues change
  useEffect(() => {
      if (parsedCuesEn.length > 0 && parsedCuesZh.length > 0) {
           setCombinedCues(combineCues(parsedCuesEn, parsedCuesZh));
      } else {
           if (parsedCuesEn.length > 0) {
                setCombinedCues(parsedCuesEn.map(c => ({...c, text1: c.text, text2: null})));
           } else if (parsedCuesZh.length > 0) {
                 setCombinedCues(parsedCuesZh.map(c => ({...c, text1: null, text2: c.text})));
           } else {
                setCombinedCues([]);
           }
      }
  }, [parsedCuesEn, parsedCuesZh]);

  // Determine which cues to display based on mode
  const displayedCues = 
      displayMode === 'both' ? combinedCues 
    : displayMode === 'zh' ? combinedCues.map(c => ({...c, text1: null})) // Keep structure, null out EN
    : combinedCues.map(c => ({...c, text2: null})); // Keep structure, null out ZH (Default EN)

  // Handle video time updates
  const handleTimeUpdate = useCallback(() => {
    const video = videoPlayerRef.current;
    const actualVideoElement = video?.querySelector('video') || video;
    if (!actualVideoElement || displayedCues.length === 0) return;
    const currentTime = actualVideoElement.currentTime;
    let foundIndex = -1;
    for (let i = 0; i < displayedCues.length; i++) {
      if (currentTime >= displayedCues[i].startTime && currentTime < displayedCues[i].endTime) {
        foundIndex = i;
        break;
      }
    }
    if (foundIndex !== activeCueIndex) {
        setActiveCueIndex(foundIndex);
    }
  }, [displayedCues, activeCueIndex]);

  // Add/Remove timeupdate listener
  useEffect(() => {
    const video = videoPlayerRef.current;
    const actualVideoElement = video?.querySelector('video') || video;
    
    // 严格检查videoElement是否为有效的HTML视频元素
    if (!actualVideoElement || !(actualVideoElement instanceof HTMLVideoElement)) {
      console.log("TestPage_VttPreviewer: Video element ref is not a valid HTMLVideoElement, listener not added");
      return;
    }
    
    try {
      actualVideoElement.addEventListener('timeupdate', handleTimeUpdate);
      handleTimeUpdate(); // Initial check
      
      return () => {
        try {
          if (actualVideoElement) { // Check again in cleanup
            actualVideoElement.removeEventListener('timeupdate', handleTimeUpdate);
          }
        } catch (error) {
          console.error("TestPage_VttPreviewer: Error removing timeupdate event listener:", error);
        }
      };
    } catch (error) {
      console.error("TestPage_VttPreviewer: Error adding timeupdate event listener:", error);
      return;
    }
  }, [handleTimeUpdate]); // Dependency is correct

  // Handle clicking a cue to seek video
  const handleCueClick = (startTime) => {
    const video = videoPlayerRef.current;
    const actualVideoElement = video?.querySelector('video') || video;
    if (actualVideoElement) {
      actualVideoElement.currentTime = startTime;
      actualVideoElement.play(); 
    }
  };

  // Scroll active cue into view
  useEffect(() => {
    if (activeCueRef.current) {
      activeCueRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [activeCueIndex]); 

  // --- Hardcoded Video Props --- 

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">VTT Previewer Test Page (Hardcoded EN/ZH/Both)</h1>
      
      {/* Test Cases Selector */}
      <div className="my-4 p-4 bg-base-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test VTT Parser with Different Formats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select 
              className="select select-bordered w-full max-w-xs mb-2"
              onChange={(e) => {
                const selectedCase = testCases.find(c => c.name === e.target.value);
                if (selectedCase) {
                  setVttEn(selectedCase.content);
                }
              }}
            >
              <option disabled selected>Select a test case...</option>
              {testCases.map(tc => (
                <option key={tc.name} value={tc.name}>{tc.name}</option>
              ))}
            </select>
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-primary mr-2"
                onClick={() => setVttEn(hardcodedVttEn)}
              >
                Reset to Default EN
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => setVttZh(hardcodedVttZh)}
              >
                Reset to Default ZH
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm mb-2">
              <span className="font-semibold">VTT Parse Results:</span> 
            </p>
            <p className="text-sm">
              {parsedCuesEn.length} EN cues, {parsedCuesZh.length} ZH cues, {combinedCues.length} combined cues
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">Show current VTT content</summary>
              <div className="mt-2">
                <h3 className="text-xs font-semibold">EN VTT:</h3>
                <pre className="text-xs bg-base-300 p-2 rounded mt-1 max-h-32 overflow-auto whitespace-pre-wrap">{vttEn || "[none]"}</pre>
                <h3 className="text-xs font-semibold mt-2">ZH VTT:</h3>
                <pre className="text-xs bg-base-300 p-2 rounded mt-1 max-h-32 overflow-auto whitespace-pre-wrap">{vttZh || "[none]"}</pre>
              </div>
            </details>
          </div>
        </div>
        
        {/* Custom VTT Input */}
        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2">Test Your Own VTT</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Paste VTT Content (EN)</label>
              <textarea 
                className="textarea textarea-bordered w-full h-32 font-mono text-xs"
                placeholder="Paste VTT content here..."
                onChange={(e) => {
                  // Don't immediately set to allow editing without constant reparsing
                }}
                onBlur={(e) => {
                  // Only set when user is done editing
                  if (e.target.value.trim()) {
                    setVttEn(e.target.value);
                  }
                }}
              ></textarea>
              <button 
                className="btn btn-sm btn-outline mt-2"
                onClick={(e) => {
                  const textarea = e.target.previousElementSibling;
                  if (textarea && textarea.value.trim()) {
                    setVttEn(textarea.value);
                  }
                }}
              >
                Parse VTT
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Paste VTT Content (ZH)</label>
              <textarea 
                className="textarea textarea-bordered w-full h-32 font-mono text-xs"
                placeholder="贴入VTT内容..."
                onChange={(e) => {
                  // Don't immediately set to allow editing without constant reparsing
                }}
                onBlur={(e) => {
                  // Only set when user is done editing
                  if (e.target.value.trim()) {
                    setVttZh(e.target.value);
                  }
                }}
              ></textarea>
              <button 
                className="btn btn-sm btn-outline mt-2"
                onClick={(e) => {
                  const textarea = e.target.previousElementSibling;
                  if (textarea && textarea.value.trim()) {
                    setVttZh(textarea.value);
                  }
                }}
              >
                Parse VTT
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls to switch display mode */} 
      <div className="my-4 flex space-x-2">
          <button 
              onClick={() => setDisplayMode('en')}
              className={`btn btn-sm ${displayMode === 'en' ? 'btn-primary' : 'btn-outline'}`}
              disabled={parsedCuesEn.length === 0} // Disable if no EN cues parsed
            >English</button>
          <button 
              onClick={() => setDisplayMode('zh')}
               className={`btn btn-sm ${displayMode === 'zh' ? 'btn-primary' : 'btn-outline'}`}
               disabled={parsedCuesZh.length === 0} // Disable if no ZH cues parsed
             >中文</button>
          <button 
              onClick={() => setDisplayMode('both')}
               className={`btn btn-sm ${displayMode === 'both' ? 'btn-primary' : 'btn-outline'}`}
               disabled={parsedCuesEn.length === 0 || parsedCuesZh.length === 0} // Disable if either is missing
             >双语</button>
      </div>

      {/* Layout with Video on left, VTT Preview on right */} 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video Player Column */} 
        <div>
            <h2 className="text-lg font-semibold mb-2">Video Player</h2>
            <VideoPlayer 
                ref={videoPlayerRef} // Assign the ref here
                localVideoPath={localVideoRelativePath} 
                embedUrl={null} // No embed URL needed
                apiBaseUrl={apiBaseUrl} 
                title={videoTitle} 
                allowToggle={false} // No toggle needed
            />
        </div>

        {/* VTT Previewer Column (Manual Implementation) */} 
        <div className="bg-base-200 p-4 rounded-lg shadow max-h-[600px] flex flex-col">
             <h2 className="text-lg font-semibold mb-2 border-b border-base-300 pb-2">Subtitle Preview ({displayMode})</h2>
             {displayedCues.length === 0 && (
                 <p className="text-gray-500 italic">No cues parsed or available for the selected mode.</p>
             )}
             {displayedCues.length > 0 && (
                 <ul ref={cueListRef} className="space-y-1 overflow-y-auto flex-grow pr-2">
                     {displayedCues.map((cue, index) => (
                         <li 
                         key={`${cue.startTime}-${index}-${displayMode}`}
                         ref={index === activeCueIndex ? activeCueRef : null} 
                         className={`p-2 rounded cursor-pointer transition-colors duration-150 ease-in-out ${
                            index === activeCueIndex ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                         }`}
                         onClick={() => handleCueClick(cue.startTime)}
                         title={`Go to ${formatTime(cue.startTime)}`}
                         >
                             <div className="font-mono text-xs mr-2 opacity-80 mb-1">
                                {formatTime(cue.startTime)}
                             </div>
                             {/* Render based on mode */} 
                             {displayMode === 'en' && cue.text1 && (
                                 <span className="text-sm">{cue.text1}</span>
                             )}
                              {displayMode === 'zh' && cue.text2 && (
                                 <span className="text-sm">{cue.text2}</span>
                             )}
                             {displayMode === 'both' && (
                                 <>
                                     {cue.text1 && <p className="text-sm mb-1">{cue.text1}</p>}
                                     {cue.text2 && <p className="text-sm text-secondary">{cue.text2}</p>} 
                                     {/* Optional: Show placeholder if one language is missing in combined view? */}
                                     {!cue.text1 && cue.text2 && <p className="text-sm italic text-gray-500">[Missing EN]</p>}
                                     {cue.text1 && !cue.text2 && <p className="text-sm italic text-gray-500">[Missing ZH]</p>}
                                     {!cue.text1 && !cue.text2 && <p className="text-sm italic text-gray-500">[Empty Cue]</p>}
                                 </>
                             )}
                         </li>
                     ))}
                 </ul>
             )}
        </div>
      </div>

    </div>
  );
};

export default TestPage_VttPreviewer; 