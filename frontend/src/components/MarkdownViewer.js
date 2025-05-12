import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // 你可以换成别的高亮主题
import './markdown.css'; // 新增自定义 markdown 样式

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
    <div className={"markdown-body flex-grow overflow-auto p-4 bg-base-100 rounded-lg shadow"}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownViewer; 