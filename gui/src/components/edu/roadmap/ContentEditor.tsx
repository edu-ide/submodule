import React, { useState } from 'react';

interface ContentEditorProps {
  contentId: string;
  initialContent: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ contentId, initialContent }) => {
  const [content, setContent] = useState(initialContent);
  
  const saveContent = () => {
    window.vscode.postMessage({
      command: 'saveContent',
      contentId,
      content
    });
  };

  return (
    <div className="editor-container">
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={saveContent}>저장</button>
    </div>
  );
};

export default ContentEditor; 