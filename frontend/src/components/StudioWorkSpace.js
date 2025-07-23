import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Needed for fetching
import MarkdownViewer from './MarkdownViewer';
import MarkdownWithTimestamps from './MarkdownWithTimestamps'; // Import timestamp component
import MarkdownEditor from './MarkdownEditor'; // Import the editor component
import BlockEditor from './BlockEditor'; // Import block editor component
import PlaceholderComponent1 from './PlaceholderComponent1';
import PlaceholderComponent2 from './PlaceholderComponent2';
import MarkdownList from './MarkdownList'; // Import the new list component
import TimestampFormatTest from './TimestampFormatTest'; // 导入时间戳格式测试组件
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// 添加中文字体支持 - 使用开源的思源黑体
// 这是一个Base64编码的字体子集，仅包含常用中文字符
const chineseFontBase64 = 'AAEAAAAKAIAAAwAgT1MvMkB6THoAAACsAAAAYGNtYXAAVADaAAABDAAAAUJnbHlmQGT/JQAAAlgAAABMaGVhZBpX0HcAAAOkAAAANmhoZWEHUANhAAAD3AAAACRobXR4B+gAAAAABAAAAAASbG9jYQBkAAAAAAQUAAAACm1heHABFQA5AAAEIAAAAIB2bWV4cAAAACIAAARgAAAABnBvc3QAAwAAAAAEaAAAACBwcmVwukanGAAABIgAAAAcAAEAAgAEAAMABAAFAAYABwAIAAkACgALAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2ADcAOAA5ADoAOwA8AD0APgA/AEAAQQBCAEMARABFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AXwBgAGEAYgBjAGQAZQBmAGcAaABpAGoAawBsAG0AbgBvAHAAcQByAHMAdAB1AHYAdwB4AHkAegB7AHwAfQB+AH8AgACBAIIAgwCEAIUAhgCHAIgAiQCKAIsAjACNAI4AjwCQAJEAkgCTAJQAlQCWAJcAmACZAJoAmwCcAJ0AngCfAKAAoQCiAKMApAClAKYApwCoAKkAqgCrAKwArQCuAK8AsACxALIAswC0ALUAtgC3ALgAuQC6ALsAvAC9AL4AvwDAAMEAwgDDAMQAxQDGAMcAyADJAMoAywDMAM0AzgDPANAA0QDSANMA1ADVANYA1wDYANkA2gDbANwA3QDeAN8A4ADhAOIA4wDkAOUA5gDnAOgA6QDqAOsA7ADtAO4A7wDwAPEA8gDzAPQA9QD2APcA+AD5APoA+wD8AP0A/gD/AQABAQECAQMBBAEFAQYBBwEIAQkBCgELAQwBDQEOAQ8BEAERARIBEwEUARUBFgEXARgBGQEaARsBHAEdAR4BHwEgASEBIgEjASQBJQEmAScBKAEpASoBKwEsAS0BLgEvATABMQEyATMBNAE1ATYBNwE4ATkBOgE7ATwBPQE+AT8BQAFBAUIBQwFEAUUBRgFHAUgBSQFKAUsBTAFNAU4BTwFQAVEBUgFTAVQBVQFWAVcBWAFZAVoBWwFcAV0BXgFfAWABYQFiAWMBZAFlAWYBZwFoAWkBagFrAWwBbQFuAW8BcAFxAXIBcwF0AXUBdgF3AXgBeQF6AXsBfAF9AX4BfwGAAYEBggGDAYQBhQGGAYcBiAGJAYoBiwGMAY0BjgGPAZABkQGSAZMBlAGVAZYBlwGYAZkBmgGbAZwBnQGeAZ8BoAGhAaIBowGkAaUBpgGnAagBqQGqAasBrAGtAa4BrwGwAbEBsgGzAbQBtQG2AbcBuAG5AboBuwG8Ab0BvgG/AcABwQHCAcMBxAHFAcYBxwHIAckBygHLAcwBzQHOAc8B0AHRAdIB0wHUAdUB1gHXAdgB2QHaAdsB3AHdAd4B3wHgAeEB4gHjAeQB5QHmAecB6AHpAeoB6wHsAe0B7gHvAfAB8QHyAfMB9AH1AfYB9wH4AfkB+gH7AfwB/QH+Af8CAAIBAgICAwIEAgUCBgIHAggCCQIKAgsCDAINAg4CDwIQAhECEgITAhQCFQIWAhcCGAIZAhoCGwIcAh0CHgIfAiACIQIiAiMCJAIlAiYCJwIoAikCKgIrAiwCLQIuAi8CMAIxAjICMwI0AjUCNgI3AjgCOQI6AjsCPAI9Aj4CPwJAAkECQgJDAkQCRQJGAkcCSAJJAkoCSwJMAk0CTgJPAlACUQJSAlMCVAJVAlYCVwJYAlkCWgJbAlwCXQJeAl8CYAJhAmICYwJkAmUCZgJnAmgCaQJqAmsCbAJtAm4CbwJwAnECcgJzAnQCdQJ2AncCeAJ5AnoCewJ8An0CfgJ/AoACgQKCAoMChAKFAoYChwKIAokCigKLAowCjQKOAo8CkAKRApICkwKUApUClgKXApgCmQKaApsCnAKdAp4CnwKgAqECogKjAqQCpQKmAqcCqAKpAqoCqwKsAq0CrgKvArACsQKyArMCtAK1ArYCtwK4ArkCugK7ArwCvQK+Ar8CwALBAsICwwLEAsUCxgLHAsgCyQLKAssCzALNAs4CzwLQAtEC0gLTAtQC1QLWAtcC2ALZAtoC2wLcAt0C3gLfAuAC4QLiAuMC5ALlAuYC5wLoAukC6gLrAuwC7QLuAu8C8ALxAvIC8wL0AvUC9gL3AvgC+QL6AvsC/AL9Av4C/wMAAwEDAgMDAwQDBQMGAwcDCAMJAwoDCwMMAw0DDgMPAxADEQMSAxMDFAMVAxYDFwMYAxkDGgMbAxwDHQMeAx8DIAMhAyIDIwMkAyUDJgMnAygDKQMqAysDLAMtAy4DLwMwAzEDMgMzAzQDNQM2AzcDOAM5AzoDOwM8Az0DPgM/A0ADQQNCA0MDRANFA0YDRwNIA0kDSgNLA0wDTQNOA08DUANRA1IDUwNUA1UDVgNXA1gDWQNaA1sDXANdA14DXwNgA2EDYgNjA2QDZQNmA2cDaANpA2oDawNsA20DbgNvA3ADcQNyA3MDdAN1A3YDdwN4A3kDegN7A3wDfQN+A38DgAOBA4IDgwOEA4UDhgOHA4gDiQOKA4sDjAONA44DjwOQA5EDkgOTA5QDlQOWA5cDmAOZA5oDmwOcA50DngOfA6ADoQOiA6MDpAOlA6YDpwOoA6kDqgOrA6wDrQOuA68DsAOxA7IDswO0A7UDtgO3A7gDuQO6A7sDvAO9A74DvwPAA8EDwgPDA8QDxQPGA8cDyAPJA8oDywPMA80DzgPPA9AD0QPSA9MD1APVA9YD1wPYA9kD2gPbA9wD3QPeA98D4APhA+ID4wPkA+UD5gPnA+gD6QPqA+sD7APtA+4D7wPwA/ED8gPzA/QD9QP2A/cD+AP5A/oD+wP8A/0D/gP/BAAEAQQCBAMEBAQFBAYEBwQIBAkECgQLBAwEDQQOBA8EEAQRBBIEEwQUBBUEFgQXBBgEGQQaBBsEHAQdBB4EHwQgBCEEIgQjBCQEJQQmBCcEKAQpBCoEKwQsBC0ELgQvBDAEMQQyBDMENAQ1BDYENwQ4BDkEOgQ7BDwEPQQ+BD8EQARBBEIEQwREBEUERgRHBEgESQRKBEsETARNBE4ETwRQBFEEUgRTBFQEVQRWBFcEWARZBFoEWwRcBF0EXgRfBGAEYQRiBGMEZARlBGYEZwRoBGkEagRrBGwEbQRuBG8EcARxBHIEcwR0BHUEdgR3BHgEeQR6BHsEfAR9BH4EfwSABIEEggSDBIQEhQSGBIcEiASJBIoEiwSMBI0EjgSPBJAEkQSSBJMElASVBJYElwSYBJkEmgSbBJwEnQSeBJ8EoAShBKIEowSkBKUEpgSnBKgEqQSqBKsErAStBK4ErwSwBLEEsgSzBLQEtQS2BLcEuAS5BLoEuwS8BL0EvgS/BMAEwQTCBMMExATFBMYExwTIBMkEygTLBMwEzQTOBM8E0ATRBNIF9gX3BfgF+QX6BfsF/AX9Bf4F/wYABgEGAgYDBgQGBQYGBgcGCAYJBgoGCwYMBg0GDgYPBhAGEQYSBhMGFAYVBhYGFwYYBhkGGgYbBhwGHQYeBh8GIAYhBiIGIwYkBiUGJgYnBigGKQYqBisGLAYtBi4GLwYwBjEGMgYzBjQGNQY2BjcGOAY5BjoGOwY8Bj0GPgY/BkAGQQZCBkMGRAZFBkYGRwZIBkkGSgZLBkwGTQZOBk8GUAZRBlIGUwZUBlUGVgZXBlgGWQZaBls=';

// Props:
// - taskUuid: The UUID of the current task
// - apiBaseUrl: The base URL for the backend API
// - markdownContent: Optional fallback markdown content from parent
// - videoRef: Reference to the video element for timestamp navigation

function StudioWorkSpace({ taskUuid, apiBaseUrl, markdownContent, videoRef }) {
  const [markdownFiles, setMarkdownFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // Name of the selected file
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState(markdownContent || '');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);
  const selectedFileRef = useRef(selectedFile);

  // New state to track if content has timestamps
  const [hasTimestamps, setHasTimestamps] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  // Block editor mode state
  const [editMode, setEditMode] = useState('normal'); // 'normal' or 'block'

  const handleExpandToggle = () => {
    const scrollPosition = contentRef.current?.scrollTop || 0;
    
    setIsExpanded(prev => !prev);
    
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = scrollPosition;
      }
    }, 10);
  };

  const handleSelectFile = (filename) => {
    if (selectedFile === filename) return;
    
    const scrollPosition = contentRef.current?.scrollTop || 0;
    
    selectedFileRef.current = filename;
    setSelectedFile(filename);
    setIsEditing(false);
    setIsCreatingNew(false);
    
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, 10);
  };

  const handleFileDeleted = (filename) => {
    // Remove file from the list
    setMarkdownFiles(prev => prev.filter(f => f !== filename));
    
    // If the deleted file was selected, clear selection
    if (selectedFile === filename) {
      setSelectedFile(null);
      setCurrentMarkdownContent('');
    }
    
    // Exit editing mode if we were editing the deleted file
    if (isEditing) {
      setIsEditing(false);
    }
  };

  const handleFileRenamed = (oldFilename, newFilename) => {
    // Update the file in the list
    setMarkdownFiles(prev => prev.map(f => f === oldFilename ? newFilename : f));
    
    // Update selection if the renamed file was selected
    if (selectedFile === oldFilename) {
      setSelectedFile(newFilename);
    }
  };

  // Effect to fetch the list of markdown files for the task
  useEffect(() => {
    if (!taskUuid || !apiBaseUrl) return;

    // setCurrentMarkdownContent is initialized with prop, or by file selection effect.
    // This effect focuses on the file list and default selection if needed.

    const fetchFileList = async () => {
      setIsLoadingList(true);
      setError(null);
      setMarkdownFiles([]); 
      // Don't reset selectedFile here if we want to respect a direct prop content display initially.
      // setSelectedFile(null); // Let prop content persist if no default file is chosen
      // setCurrentMarkdownContent(''); // Already initialized from prop
      try {
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list`, {
          params: { extension: '.md' } 
        });

        const files = response.data || []; 
        setMarkdownFiles(files);
        
        // If markdownContent prop was NOT provided (or was empty), then try to select a default file from the list.
        // Otherwise, if markdownContent prop WAS provided, selectedFile remains null (or its current value)
        // so that the prop-derived currentMarkdownContent is displayed until the user picks a file.
        if (!markdownContent) {
          const defaultFileToLoad = files.find(f => f.includes('parallel_summary.md')) || files[0];
          if (defaultFileToLoad) {
            setSelectedFile(defaultFileToLoad); // This will trigger the content fetching useEffect
          } else {
            setSelectedFile(null); // No default file found, ensure selectedFile is null
            setCurrentMarkdownContent(''); // No prop, no default file, so no content.
          }
        } else {
          // markdownContent prop IS available. We've initialized currentMarkdownContent with it.
          // We do NOT auto-select a file from the list here, to let the prop content show.
          // If a file was ALREADY selected (e.g. user clicked one), we don't want to nullify it here either.
          // So, selectedFile remains as is (could be null, could be user-selected).
          // If selectedFile is null, the rendering logic will use the prop-based currentMarkdownContent.
          if (!selectedFile) { // Only ensure it's null if it wasn't already set by user interaction somehow before this runs
             // If no file is selected AND we are using prop content, ensure selectedFile is null.
             // This helps the rendering logic pick the prop content via the `markdownContent ?` branch.
             setSelectedFile(null);
          }
        }
      } catch (err) {
        console.error("Error fetching markdown file list:", err);
        setError('Failed to load markdown file list.');
        setMarkdownFiles([]);
        setSelectedFile(null);
        setCurrentMarkdownContent(markdownContent || ''); // Fallback to prop content on list fetch error
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchFileList();
  // Let's keep the dependencies simple, this effect is about the file list primarily.
  // markdownContent dependency was causing re-runs that might not be desired for just file list.
  // }, [taskUuid, apiBaseUrl, markdownContent, selectedFile]); 
  }, [taskUuid, apiBaseUrl]); // Simpler dependencies

  // Effect to fetch the content of the selected markdown file
  useEffect(() => {
    // This effect should ONLY run if a file is EXPLICITLY selected.
    // If selectedFile is null, we rely on currentMarkdownContent being set (or not) by the prop or list fetch logic.
    if (!selectedFile || !taskUuid || !apiBaseUrl) {
      // If no file is selected, currentMarkdownContent should reflect the prop's value (or be empty).
      // The initialization of currentMarkdownContent and the list-fetching useEffect handle this.
      // So, we don't necessarily clear currentMarkdownContent here unless selectedFile was just cleared.
      return;
    }

    const fetchFileContent = async () => {
      setIsLoadingContent(true);
      setError(null); 
      try {
        // Use the existing endpoint for fetching file content
        // Make sure the filename is URI encoded if it might contain special characters
        const encodedFilename = encodeURIComponent(selectedFile);
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`, {
             responseType: 'text' // Ensure we get raw text
        });
        const content = response.data || '';
        setCurrentMarkdownContent(content);
        
        // Check for timestamps in the content
        // Looking for patterns like [00:00:00] or [hh:mm:ss]
        setHasTimestamps(/\[\d{2}:\d{2}:\d{2}\]/.test(content));
      } catch (err) {
        console.error(`Error fetching markdown content for ${selectedFile}:`, err); // Keep error log
        setError(`Failed to load content for ${selectedFile}.`);
        setCurrentMarkdownContent(''); // Clear content on error
        setHasTimestamps(false);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchFileContent();
  }, [selectedFile, taskUuid, apiBaseUrl, markdownContent]); // Re-run if selected file, task, or API URL changes

  // Check for timestamps in markdownContent when it changes
  useEffect(() => {
    if (markdownContent && !selectedFile) {
      setHasTimestamps(/\[\d{2}:\d{2}:\d{2}\]/.test(markdownContent));
    }
  }, [markdownContent, selectedFile]);

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setIsEditing(true);
    setSelectedFile(null);
    setCurrentMarkdownContent('');
    setNewFileName('');
  };

  const handleSaveNew = async () => {
    if (!newFileName || !taskUuid || !apiBaseUrl) return;
    
    // Add .md extension if not already present
    const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;
    
    setIsSaving(true);
    try {
      // Save the new markdown file
      await axios.post(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodeURIComponent(fileName)}`, 
        currentMarkdownContent,
        { headers: { 'Content-Type': 'text/plain' } }
      );
      
      // Refresh the file list
      const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list`, {
        params: { extension: '.md' }
      });
      
      const files = response.data || [];
      setMarkdownFiles(files);
      
      // Select the newly created file
      setSelectedFile(fileName);
      setIsCreatingNew(false);
      setIsEditing(false);
      
    } catch (err) {
      console.error("Error saving new markdown file:", err);
      setError('Failed to save new markdown file.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedFile || !taskUuid || !apiBaseUrl) return;
    
    setIsSaving(true);
    try {
      // Save the edited markdown file
      await axios.post(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodeURIComponent(selectedFile)}`, 
        currentMarkdownContent,
        { headers: { 'Content-Type': 'text/plain' } }
      );
      
      // Reload the file content to ensure we're displaying the latest version
      try {
        const encodedFilename = encodeURIComponent(selectedFile);
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`, {
          responseType: 'text'
        });
        setCurrentMarkdownContent(response.data || '');
      } catch (fetchErr) {
        console.error(`Error reloading content after save for ${selectedFile}:`, fetchErr);
        // Continue with existing content if reload fails
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error(`Error saving markdown content for ${selectedFile}:`, err);
      setError(`Failed to save content for ${selectedFile}.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (newContent) => {
    setCurrentMarkdownContent(newContent);
  };

  const handleCopyContent = async (contentToCopy = null) => {
    const content = contentToCopy || currentMarkdownContent;
    console.log('handleCopyContent called');
    console.log('Content to copy (first 100 chars):', content?.substring(0, 100));
    console.log('Content length:', content?.length || 0);
    
    if (!content || content.trim() === '') {
      console.warn('No content to copy');
      alert('没有内容可以复制');
      return;
    }
    
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        console.log('Content copied to clipboard successfully');
        alert('内容已复制到剪贴板');
      } else {
        throw new Error('Clipboard API not available, using fallback');
      }
    } catch (err) {
      console.error('Primary copy method failed:', err);
      
      // Fallback method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          console.log('Content copied to clipboard (fallback method)');
          alert('内容已复制到剪贴板 (兼容模式)');
        } else {
          throw new Error('execCommand copy failed');
        }
      } catch (fallbackErr) {
        console.error('Fallback copy method also failed:', fallbackErr);
        alert('复制失败，请手动选择并复制内容');
      }
    }
  };

  const handleExportToPDF = async (contentToExport = null) => {
    const content = contentToExport || currentMarkdownContent;
    
    if (!content || content.trim() === '') {
      alert('没有内容可以导出');
      return;
    }

    setIsExportingPDF(true);
    try {
      // Import required libraries
      const { marked } = await import('marked');
      
      // Configure marked for better rendering
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
      });
      
      // Convert markdown to HTML using marked
      const htmlContent = marked(content);
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = selectedFile 
        ? selectedFile.replace('.md', '.pdf')
        : `markdown-export-${timestamp}.pdf`;
      
      // Add title if we have a selected file
      const title = selectedFile ? selectedFile.replace('.md', '') : `Markdown Export`;
      
      // Create a complete HTML page for printing
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: "PingFang SC", "Microsoft YaHei", "Source Han Sans CN", "Noto Sans CJK SC", sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #333333;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .title {
              font-size: 18pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 20px;
              color: #000000;
              page-break-after: avoid;
            }
            h1 { font-size: 16pt; font-weight: bold; margin: 16px 0 8px 0; color: #000000; page-break-after: avoid; }
            h2 { font-size: 14pt; font-weight: bold; margin: 14px 0 7px 0; color: #333333; page-break-after: avoid; }
            h3 { font-size: 12pt; font-weight: bold; margin: 12px 0 6px 0; color: #333333; page-break-after: avoid; }
            h4, h5, h6 { font-size: 11pt; font-weight: bold; margin: 10px 0 5px 0; color: #333333; page-break-after: avoid; }
            p { margin: 8px 0; color: #333333; }
            ul, ol { margin: 8px 0; padding-left: 20px; }
            li { margin: 4px 0; color: #333333; }
            blockquote { 
              margin: 12px 0; 
              padding: 8px 16px; 
              border-left: 4px solid #dddddd; 
              background-color: #f9f9f9; 
              color: #333333;
              page-break-inside: avoid;
            }
            code { 
              background-color: #f1f1f1; 
              padding: 2px 4px; 
              border-radius: 3px; 
              font-family: "Courier New", monospace; 
              font-size: 10pt; 
              color: #333333;
            }
            pre { 
              background-color: #f4f4f4; 
              padding: 12px; 
              border-radius: 4px; 
              overflow-x: auto; 
              margin: 12px 0;
              page-break-inside: avoid;
            }
            pre code { 
              background-color: transparent; 
              padding: 0; 
              color: #333333;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin: 12px 0;
              page-break-inside: avoid;
            }
            th, td { 
              border: 1px solid #dddddd; 
              padding: 6px 8px; 
              text-align: left; 
              background-color: #ffffff; 
              color: #333333;
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
              color: #000000;
            }
            a { color: #0066cc; text-decoration: underline; }
            strong { font-weight: bold; color: #333333; }
            em { font-style: italic; color: #333333; }
            hr { border: none; border-top: 1px solid #dddddd; margin: 16px 0; }
            
            /* Print-specific styles */
            @media print {
              body { print-color-adjust: exact; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="title">${title}</div>
          ${htmlContent}
        </body>
        </html>
      `;
      
      // Open in a new window and print
      const printWindow = window.open('', '_blank');
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      
      // Wait for content to load
      await new Promise(resolve => {
        printWindow.onload = resolve;
        setTimeout(resolve, 1000); // Fallback timeout
      });
      
      // Print the document
      printWindow.print();
      
      // Optional: Close the print window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
      
      alert('PDF 导出已启动！请在打印对话框中选择"保存为PDF"');
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert(`PDF 导出失败: ${error.message || '未知错误'}`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow overflow-hidden ${isExpanded ? 'absolute right-0 z-10 w-[50%] h-full top-0 left-[50%]' : 'flex-1 min-w-0'} transition-all duration-300 ease-in-out`}>
      <div className={`flex justify-between items-center border-b border-gray-300 flex-shrink-0 sticky top-0 bg-white z-20 ${isExpanded ? 'p-2' : 'p-4 pb-2'}`}>
        <h3 className="text-lg font-semibold">Studio WorkSpace</h3>
        <button 
          onClick={handleExpandToggle}
          className={`${isExpanded ? 'p-2 bg-primary text-white' : 'text-gray-600 hover:text-primary p-1'} rounded-full hover:bg-opacity-90 focus:outline-none transition-colors`}
          title={isExpanded ? "收缩面板" : "扩展面板"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      </div>
      <div ref={contentRef} className="flex-grow overflow-y-auto p-4 pt-2 space-y-4">
        
        <div> 
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-md font-medium text-gray-700">Markdown Documents</h4>
            <button 
              onClick={handleCreateNew}
              className="text-gray-600 hover:text-primary focus:outline-none p-1 rounded-full hover:bg-gray-100"
              title="Create new markdown document"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {isLoadingList && <p className="text-sm text-gray-500 italic">Loading file list...</p>}
          {error && <p className="text-sm text-red-500">Error: {error}</p>}
          
          {!isLoadingList && !isCreatingNew && (
                      <MarkdownList
            files={markdownFiles}
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            onFileDeleted={handleFileDeleted}
            onFileRenamed={handleFileRenamed}
            taskUuid={taskUuid}
            apiBaseUrl={apiBaseUrl}
          />
          )}

          {isCreatingNew && (
            <div className="mt-3 border rounded p-3 bg-base-100">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter file name (e.g. notes.md)"
                  className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1 text-xs rounded bg-base-200 hover:bg-base-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNew}
                  disabled={!newFileName || isSaving}
                  className={`px-3 py-1 text-xs rounded ${!newFileName || isSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-primary-content hover:bg-primary-focus'}`}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 border-t pt-4">
            {isLoadingContent ? (
              <p className="text-sm text-gray-500 italic">Loading content for {selectedFile}...</p>
            ) : isEditing ? (
              <div>
                <MarkdownEditor 
                  key={`editor-${selectedFile || 'new'}`}
                  value={currentMarkdownContent}
                  onChange={handleContentChange}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => isCreatingNew ? setIsCreatingNew(false) : setIsEditing(false)}
                    className="px-3 py-1 text-xs rounded bg-base-200 hover:bg-base-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isCreatingNew ? handleSaveNew : handleSaveEdit}
                    disabled={isSaving}
                    className={`px-3 py-1 text-xs rounded ${isSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-primary-content hover:bg-primary-focus'}`}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : selectedFile ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  {/* 模式切换 */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setEditMode('normal')}
                      className={`px-3 py-1 text-xs rounded ${
                        editMode === 'normal' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      普通模式
                    </button>
                    <button
                      onClick={() => setEditMode('block')}
                      className={`px-3 py-1 text-xs rounded ${
                        editMode === 'block' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      块编辑
                    </button>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyContent()}
                      className="px-3 py-1 text-xs rounded bg-base-200 hover:bg-base-300 flex items-center gap-1"
                      title="复制内容"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      复制
                    </button>
                    {editMode === 'normal' && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 text-xs rounded bg-base-200 hover:bg-base-300 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        编辑
                      </button>
                    )}
                  </div>
                </div>
                {editMode === 'block' ? (
                  <BlockEditor
                    key={`block-editor-${selectedFile}`}
                    markdownContent={currentMarkdownContent}
                    onContentChange={async (newContent) => {
                      setCurrentMarkdownContent(newContent);
                      // 自动保存
                      if (selectedFile && taskUuid && apiBaseUrl) {
                        try {
                          await axios.post(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodeURIComponent(selectedFile)}`, 
                            newContent,
                            { headers: { 'Content-Type': 'text/plain' } }
                          );
                        } catch (err) {
                          console.error(`Error auto-saving ${selectedFile}:`, err);
                        }
                      }
                    }}
                    taskUuid={taskUuid}
                    apiBaseUrl={apiBaseUrl}
                    className="border-0"
                  />
                ) : hasTimestamps && videoRef ? (
                  <MarkdownWithTimestamps
                    key={`viewer-timestamps-${selectedFile}`}
                    markdownContent={currentMarkdownContent}
                    videoRef={videoRef}
                  />
                ) : (
                  <MarkdownViewer 
                    key={`viewer-${selectedFile}`}
                    markdownContent={currentMarkdownContent}
                    videoRef={videoRef}
                  />
                )}
              </div>
            ) : !isLoadingList && markdownFiles.length > 0 ? (
              <p className="text-gray-500 text-sm italic">Select a markdown file above to view its content.</p>
            ) : markdownContent ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 italic">Displaying default markdown content:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyContent(markdownContent)}
                      className="px-3 py-1 text-xs rounded bg-base-200 hover:bg-base-300 flex items-center gap-1"
                      title="Copy content to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={() => handleExportToPDF(markdownContent)}
                      disabled={isExportingPDF}
                      className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
                        isExportingPDF 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-base-200 hover:bg-base-300'
                      }`}
                      title="Export to PDF"
                    >
                      {isExportingPDF ? (
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      {isExportingPDF ? 'Exporting...' : 'Export'}
                    </button>
                  </div>
                </div>
                {hasTimestamps && videoRef ? (
                  <MarkdownWithTimestamps
                    key="default-content-timestamps"
                    markdownContent={markdownContent}
                    videoRef={videoRef}
                  />
                ) : (
                  <MarkdownViewer 
                    key="default-content"
                    markdownContent={markdownContent}
                    videoRef={videoRef}
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
        

        
        <PlaceholderComponent1 />
        <PlaceholderComponent2 />
        
      </div>
    </div>
  );
}

export default StudioWorkSpace; 