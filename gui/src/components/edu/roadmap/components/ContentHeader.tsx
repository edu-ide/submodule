import React from 'react';

interface ContentHeaderProps {
  title: string;
  onBack: () => void;
  vsCodeTheme: any;
}

/**
 * 콘텐츠 헤더 컴포넌트
 */
const ContentHeader: React.FC<ContentHeaderProps> = ({ 
  title, 
  onBack,
  vsCodeTheme 
}) => {
  return (
    <div className="roadmap-content-header">
      <button className="back-button" onClick={onBack}>
        ← 로드맵으로 돌아가기
      </button>
      <h1 className="content-title">{title}</h1>
      
      <style jsx>{`
        .roadmap-content-header {
          display: flex;
          align-items: center;
          padding: 15px;
          margin-bottom: 20px;
          background: ${vsCodeTheme.editorBackground};
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid ${vsCodeTheme.border};
          position: relative;
        }
        
        .roadmap-content-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background: var(--vscode-terminal-ansiBlue);
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
        
        .back-button {
          padding: 8px 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
          background: ${vsCodeTheme.button.background};
          color: ${vsCodeTheme.button.foreground};
          display: flex;
          align-items: center;
          margin-right: 15px;
        }
        
        .back-button:hover {
          background: ${vsCodeTheme.button.hover};
          transform: translateX(-3px);
        }
        
        .content-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default ContentHeader; 