import React, { useState, useEffect } from 'react';

// Props:
// - value: The markdown content to edit
// - onChange: Function to call when content changes

function MarkdownEditor({ value, onChange }) {
  const [content, setContent] = useState(value || '');

  useEffect(() => {
    setContent(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <textarea
        value={content}
        onChange={handleChange}
        className="w-full p-2 border rounded min-h-[200px] text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Enter markdown content here..."
      />
      <div className="mt-2 text-xs text-gray-500">
        <span className="font-medium">Markdown supported.</span> Use # for headings, * for lists, ** for bold, etc.
      </div>
    </div>
  );
}

export default MarkdownEditor; 