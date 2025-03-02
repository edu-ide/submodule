export {};
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GuideContent: React.FC = () => {
  const { curriculumId, categoryIndex } = useParams();
  const navigate = useNavigate();
  
  // 임시 가이드 콘텐츠
  const guideContent = {
    title: `${curriculumId} 가이드 - 카테고리 ${categoryIndex}`,
    content: "이 페이지는 선택한 커리큘럼 카테고리의 학습 가이드를 표시합니다.",
    sections: [
      {
        title: "소개",
        content: "이 섹션에서는 해당 주제의 기본 개념을 소개합니다."
      },
      {
        title: "학습 목표",
        content: "이 가이드를 통해 달성하고자 하는 학습 목표들을 나열합니다."
      },
      {
        title: "예제",
        content: "실제 사용 사례와 예제 코드를 제공합니다."
      }
    ]
  };
  
  return (
    <div className="guide-content">
      <button 
        className="back-button"
        onClick={() => navigate(`/education/curriculum/${curriculumId}`)}
      >
        <span className="codicon codicon-arrow-left"></span> 뒤로가기
      </button>
      
      <h1>{guideContent.title}</h1>
      <p className="guide-description">{guideContent.content}</p>
      
      <div className="guide-sections">
        {guideContent.sections.map((section, index) => (
          <div key={index} className="guide-section">
            <h2>{section.title}</h2>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .guide-content {
          padding: 20px;
        }
        
        .back-button {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          margin-bottom: 20px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .back-button:hover {
          background: var(--vscode-button-hoverBackground);
        }
        
        .back-button span {
          margin-right: 6px;
        }
        
        h1 {
          margin-bottom: 16px;
        }
        
        .guide-description {
          margin-bottom: 24px;
          color: var(--vscode-descriptionForeground);
        }
        
        .guide-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .guide-section {
          padding: 16px;
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default GuideContent; 