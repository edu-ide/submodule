import React from 'react';

interface ErrorDisplayProps {
  error: string;
  contentId?: string | null;
  realContentId?: string | null;
  onBack: () => void;
  vsCodeTheme: any;
}

/**
 * 에러 표시 컴포넌트
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  contentId,
  realContentId,
  onBack,
  vsCodeTheme
}) => {
  return (
    <div className="error-container">
      <h2>⚠️ 콘텐츠 로드 실패</h2>
      <p>{error}</p>
      <div className="error-help">
        <p>가능한 원인:</p>
        <ul>
          <li>URL에 잘못된 콘텐츠 ID 또는 타이틀이 포함되어 있습니다</li>
          <li>서버에서 콘텐츠 데이터를 가져오지 못했습니다</li>
          <li>요청한 콘텐츠가 로드맵 데이터에 없습니다</li>
        </ul>
        <p>현재 요청 정보:</p>
        <ul>
          <li>URL 콘텐츠 ID: {contentId}</li>
          <li>결정된 실제 ID: {realContentId}</li>
        </ul>
      </div>
      <button onClick={onBack} className="back-button">로드맵으로 돌아가기</button>
      
      <style jsx>{`
        .error-container {
          text-align: center;
          padding: 2em;
          background: ${vsCodeTheme.editorBackground};
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin: 2em auto;
          border: 1px solid var(--destructive);
        }
        
        .error-help {
          text-align: left;
          margin: 1.5em 0;
          padding: 1em;
          background-color: rgba(var(--destructive-rgb), 0.1);
          border-radius: 6px;
        }
        
        .error-help ul {
          margin-bottom: 1.5em;
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
        }
        
        .back-button:hover {
          background: ${vsCodeTheme.button.hover};
        }
      `}</style>
    </div>
  );
};

export default ErrorDisplay; 