import React from 'react';

interface InlineCodeProps {
  content: string;
}

const InlineCode: React.FC<InlineCodeProps> = ({ content }) => {
  return (
    <code
      style={{
        background: '#2d2d2d',
        color: '#ffffff',
        padding: '2px 6px',
        borderRadius: '4px',
        fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
        fontSize: '0.9em',
        border: '1px solid #404040',
        display: 'inline-block',
        lineHeight: '1.4',
        margin: '0 2px',
        verticalAlign: 'middle'
      }}
    >
      {content}
    </code>
  );
};

export default InlineCode; 