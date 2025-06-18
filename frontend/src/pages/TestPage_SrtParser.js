import React, { useState } from 'react';

// Import the SRT parsing functions from Studio.js
// For testing purposes, we'll copy them here
const parseSrt = (srtString, lang) => {
  if (!srtString || srtString.trim() === '') return { cues: [], error: null };

  console.log(`[parseSrt ${lang}] Starting SRT parsing...`);
  
  try {
    const lines = srtString.trim().split(/\r?\n/);
    const cues = [];
    let currentCue = null;
    let lineIndex = 0;

    while (lineIndex < lines.length) {
      const line = lines[lineIndex].trim();
      
      // Skip empty lines
      if (!line) {
        lineIndex++;
        continue;
      }

      // Check if line is a sequence number
      if (/^\d+$/.test(line)) {
        // Save previous cue if exists
        if (currentCue && currentCue.text) {
          cues.push(currentCue);
        }
        
        // Start new cue
        currentCue = {
          id: `${lang}-srt-cue-${line}`,
          text: '',
          startTime: 0,
          endTime: 0
        };
        lineIndex++;
        continue;
      }

      // Check if line is a timestamp
      const timestampMatch = line.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
      if (timestampMatch && currentCue) {
        const [, startH, startM, startS, startMs, endH, endM, endS, endMs] = timestampMatch;
        currentCue.startTime = parseInt(startH) * 3600 + parseInt(startM) * 60 + parseInt(startS) + parseInt(startMs) / 1000;
        currentCue.endTime = parseInt(endH) * 3600 + parseInt(endM) * 60 + parseInt(endS) + parseInt(endMs) / 1000;
        lineIndex++;
        continue;
      }

      // Otherwise, it's subtitle text
      if (currentCue) {
        if (currentCue.text) {
          currentCue.text += '\n' + line;
        } else {
          currentCue.text = line;
        }
      }
      lineIndex++;
    }

    // Add the last cue
    if (currentCue && currentCue.text) {
      cues.push(currentCue);
    }

    console.log(`[parseSrt ${lang}] Parsed ${cues.length} SRT cues`);
    return { cues, error: null };

  } catch (error) {
    console.error(`[parseSrt ${lang}] Error parsing SRT:`, error);
    return { cues: [], error: `SRT parsing failed: ${error.message}` };
  }
};

const detectAndParseSrt = (srtString, lang) => {
  if (!srtString || srtString.trim() === '') {
    return { cues: [], error: null, detectedType: 'empty' };
  }

  console.log(`[detectAndParseSrt ${lang}] Analyzing SRT content...`);
  
  // First parse normally
  const { cues: rawCues, error } = parseSrt(srtString, lang);
  if (error || rawCues.length === 0) {
    return { cues: rawCues, error, detectedType: 'unknown' };
  }

  // Analyze the content to detect type
  const sampleSize = Math.min(20, rawCues.length);
  const sampleCues = rawCues.slice(0, sampleSize);
  
  let englishCount = 0;
  let chineseCount = 0;
  let bilingualPairs = 0;

  // Check for bilingual pattern (pairs of cues with same timestamp)
  for (let i = 0; i < sampleCues.length - 1; i++) {
    const current = sampleCues[i];
    const next = sampleCues[i + 1];
    
    // Check if consecutive cues have same timestamp (bilingual pattern)
    if (Math.abs(current.startTime - next.startTime) < 0.1 && 
        Math.abs(current.endTime - next.endTime) < 0.1) {
      
      // Check language of each
      const currentIsEnglish = /^[a-zA-Z0-9\s\[\].,!?'"()-]+$/.test(current.text.replace(/[^\w\s\[\].,!?'"()-]/g, ''));
      const nextIsChinese = /[\u4e00-\u9fff]/.test(next.text);
      
      if (currentIsEnglish && nextIsChinese) {
        bilingualPairs++;
      }
    }
    
    // Count language types
    if (/^[a-zA-Z0-9\s\[\].,!?'"()-]+$/.test(current.text.replace(/[^\w\s\[\].,!?'"()-]/g, ''))) {
      englishCount++;
    }
    if (/[\u4e00-\u9fff]/.test(current.text)) {
      chineseCount++;
    }
  }

  console.log(`[detectAndParseSrt ${lang}] Analysis: English=${englishCount}, Chinese=${chineseCount}, BilingualPairs=${bilingualPairs}`);

  // Determine type and process accordingly
  if (bilingualPairs > sampleSize * 0.3) {
    console.log(`[detectAndParseSrt ${lang}] Detected bilingual SRT, merging pairs...`);
    
    // Merge bilingual pairs
    const mergedCues = [];
    for (let i = 0; i < rawCues.length - 1; i += 2) {
      const englishCue = rawCues[i];
      const chineseCue = rawCues[i + 1];
      
      // Verify they have similar timestamps
      if (chineseCue && 
          Math.abs(englishCue.startTime - chineseCue.startTime) < 0.1 && 
          Math.abs(englishCue.endTime - chineseCue.endTime) < 0.1) {
        
        mergedCues.push({
          id: `${lang}-bilingual-srt-${i/2}`,
          startTime: englishCue.startTime,
          endTime: englishCue.endTime,
          enText: englishCue.text,
          zhText: chineseCue.text,
          isBilingual: true
        });
      } else {
        // If not a pair, add as regular cue
        mergedCues.push({
          ...englishCue,
          isBilingual: false
        });
        if (chineseCue) {
          mergedCues.push({
            ...chineseCue,
            isBilingual: false
          });
        }
      }
    }
    
    // Handle odd number of cues
    if (rawCues.length % 2 === 1) {
      const lastCue = rawCues[rawCues.length - 1];
      mergedCues.push({
        ...lastCue,
        isBilingual: false
      });
    }
    
    console.log(`[detectAndParseSrt ${lang}] Merged ${rawCues.length} cues into ${mergedCues.length} bilingual cues`);
    return { cues: mergedCues, error, detectedType: 'bilingual' };
    
  } else if (chineseCount > englishCount) {
    console.log(`[detectAndParseSrt ${lang}] Detected Chinese SRT`);
    return { 
      cues: rawCues.map(cue => ({ ...cue, isBilingual: false })), 
      error, 
      detectedType: 'chinese' 
    };
  } else {
    console.log(`[detectAndParseSrt ${lang}] Detected English SRT`);
    return { 
      cues: rawCues.map(cue => ({ ...cue, isBilingual: false })), 
      error, 
      detectedType: 'english' 
    };
  }
};

function TestPage_SrtParser() {
  const [srtContent, setSrtContent] = useState('');
  const [parseResult, setParseResult] = useState(null);

  const testSrtSample = `1
00:00:01,510 --> 00:00:05,100
[music] what

2
00:00:01,510 --> 00:00:05,100
[音乐] 什么

3
00:00:05,850 --> 00:00:06,100
okay

4
00:00:05,850 --> 00:00:06,100
好的

5
00:00:06,150 --> 00:00:06,910
how are you

6
00:00:06,150 --> 00:00:06,910
你好吗`;

  const handleParse = () => {
    const result = detectAndParseSrt(srtContent, 'test');
    setParseResult(result);
  };

  const loadSample = () => {
    setSrtContent(testSrtSample);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SRT Parser Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Input SRT Content</h2>
          <div className="mb-2">
            <button 
              onClick={loadSample}
              className="btn btn-sm btn-outline mr-2"
            >
              Load Sample
            </button>
            <button 
              onClick={handleParse}
              className="btn btn-sm btn-primary"
              disabled={!srtContent.trim()}
            >
              Parse SRT
            </button>
          </div>
          <textarea
            className="textarea textarea-bordered w-full h-64 font-mono text-sm"
            value={srtContent}
            onChange={(e) => setSrtContent(e.target.value)}
            placeholder="Paste SRT content here..."
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Parse Results</h2>
          {parseResult ? (
            <div className="space-y-4">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Detected Type</div>
                  <div className="stat-value text-lg">{parseResult.detectedType}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Cues Count</div>
                  <div className="stat-value text-lg">{parseResult.cues.length}</div>
                </div>
              </div>
              
              {parseResult.error && (
                <div className="alert alert-warning">
                  <span>Parse Error: {parseResult.error}</span>
                </div>
              )}
              
              <div className="overflow-auto max-h-96 border rounded p-2">
                <h3 className="font-semibold mb-2">Parsed Cues:</h3>
                {parseResult.cues.slice(0, 10).map((cue, index) => (
                  <div key={index} className="mb-2 p-2 border rounded bg-base-100">
                    <div className="text-xs text-gray-500">
                      {cue.startTime.toFixed(1)}s - {cue.endTime.toFixed(1)}s
                    </div>
                    {cue.isBilingual ? (
                      <div>
                        <div className="text-sm"><strong>EN:</strong> {cue.enText}</div>
                        <div className="text-sm"><strong>ZH:</strong> {cue.zhText}</div>
                      </div>
                    ) : (
                      <div className="text-sm">{cue.text}</div>
                    )}
                  </div>
                ))}
                {parseResult.cues.length > 10 && (
                  <div className="text-sm text-gray-500">
                    ... and {parseResult.cues.length - 10} more cues
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">No parse results yet. Click "Parse SRT" to test.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestPage_SrtParser; 