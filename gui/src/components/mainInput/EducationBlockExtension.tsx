import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import StyledMarkdownPreview from "../markdown/StyledMarkdownPreview";

// 교육 블록 렌더러 컴포넌트
const EducationBlockView = (props: any) => {
  const { node, updateAttributes } = props;
  const { title, content, category, markdown } = node.attrs;
  
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // DOM에 렌더링 된 후 contenteditable 속성 확인
      const element = document.querySelector('.education-block');
      if (element) {
        console.log('교육 블록 요소 발견:', element);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="education-block" style={{
      border: '2px solid #4a6bff',
      borderRadius: '6px',
      padding: '8px 12px',
      margin: '16px 0',
      backgroundColor: 'rgba(30, 60, 90, 0.5)',
      minHeight: '50px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BookOpenIcon width="16" height="16" style={{ marginRight: '8px' }} />
          <span style={{ fontWeight: 'bold' }}>{title}</span>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          {expanded ? 
            <ChevronUpIcon width="16" height="16" /> : 
            <ChevronDownIcon width="16" height="16" />
          }
        </button>
      </div>
      
      {expanded && (
        <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>카테고리:</strong> {category}
          </div>
          <div style={{ 
            padding: '8px', 
            backgroundColor: 'rgba(20, 20, 20, 0.5)', 
            borderRadius: '4px',
            maxHeight: '200px',
            overflow: 'auto' 
          }}>
            {markdown && <StyledMarkdownPreview source={markdown} />}
          </div>
        </div>
      )}
    </div>
  );
};

// 교육 블록 확장 정의
const EducationBlock = Node.create({
  name: 'educationBlock',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,
  
  addAttributes() {
    return {
      title: { default: '' },
      content: { default: '' },
      category: { default: '' },
      markdown: { default: '' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div.education-block' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'education-block' }), 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(EducationBlockView);
  },
  
  toDOM() {
    return ['div', { class: 'education-block' }, 0];
  },
  
  toJSON() {
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: `[교육자료]` }]
    };
  }
});

export const makeEducationBlockSerializable = (node: any) => {
  if (node.type === 'educationBlock') {
    return {
      type: 'paragraph',
      content: [{ 
        type: 'text', 
        text: `[교육자료: ${node.attrs.title}]` 
      }]
    };
  }
  return node;
};

export default EducationBlock; 