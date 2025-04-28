import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Props:
// - markdownContent: A string containing the Markdown text to render.

function MarkdownViewer({ markdownContent }) {

  // Basic styling for the container. 
  // You might want to use Tailwind CSS @tailwindcss/typography plugin 
  // for better default markdown styling by adding `prose` class here.
  // Example: className="p-4 prose lg:prose-xl max-w-none"
  const containerClasses = "p-4 bg-base-100 rounded-lg shadow"; 

  if (!markdownContent) {
    return (
      <div className={`${containerClasses} text-gray-500 italic flex items-center justify-center flex-grow`}>
        No content to display or load.
      </div>
    );
  }

  return (
    <div className={containerClasses + " flex-grow overflow-auto"}> {/* Added flex-grow and overflow */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}> 
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownViewer; 