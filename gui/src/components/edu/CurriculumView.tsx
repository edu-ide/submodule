import React from 'react';
import { CurriculumItem, CurriculumStep } from '../../types/curriculum';
import { CURRICULUM_DATA } from '../../data/curriculumData';

interface CurriculumViewProps {
  curriculumId: string | null;
  onBack: () => void;
  onSelectCategory: (curriculumId: string, categoryIndex: number) => void;
}

const CurriculumView: React.FC<CurriculumViewProps> = ({ 
  curriculumId, 
  onBack,
  onSelectCategory
}) => {
  // 선택된 커리큘럼 찾기
  const curriculum = curriculumId ? 
    CURRICULUM_DATA.find(item => item.id === curriculumId) : null;
  
  // 커리큘럼이 없으면 기본 메시지 표시
  if (!curriculum) {
    return (
      <div className="curriculum-empty-state">
        <h2>커리큘럼을 선택하세요</h2>
        <p>좌측의 커리큘럼 목록에서 학습하고 싶은 항목을 선택하세요.</p>
      </div>
    );
  }
  
  // 단계별 아이콘 매핑
  const getStepIcon = (index: number) => {
    const icons = ['📚', '🔍', '💡', '🛠️', '📝'];
    return index < icons.length ? icons[index] : '📝';
  };
  
  return (
    <div className="curriculum-container">
      <div className="curriculum-header">
        <button onClick={onBack} className="back-button">
          ← 뒤로
        </button>
        <h2>{curriculum.title}</h2>
      </div>
      
      <div className="curriculum-info">
        <p>{curriculum.description}</p>
        <div className="curriculum-meta">
          <span className="difficulty-badge">
            {curriculum.difficulty === 'beginner' ? '초급' : 
             curriculum.difficulty === 'intermediate' ? '중급' : '고급'}
          </span>
          <span className="duration-info">완료 시간: {curriculum?.duration || '미정'}</span>
        </div>
      </div>
      
      <div className="curriculum-steps">
        <h3>학습 단계</h3>
        <div className="steps-list">
          {curriculum.steps.map((step: CurriculumStep, index: number) => (
            <button 
              key={index}
              className={`step-item ${step.completed ? 'completed' : ''}`}
              onClick={() => onSelectCategory(curriculum.id, index)}
            >
              <div className="step-icon">
                {getStepIcon(index)}
              </div>
              <div className="step-content">
                <div className="step-title">{step.title}</div>
                <div className="step-duration">예상 소요시간: {step.duration}</div>
              </div>
              <div className="step-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .curriculum-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .curriculum-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .back-button {
          background: none;
          border: none;
          color: var(--vscode-button-foreground);
          cursor: pointer;
          padding: 8px;
          margin-right: 16px;
          display: flex;
          align-items: center;
          font-size: 14px;
        }
        
        .curriculum-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
        }
        
        .curriculum-info {
          margin-bottom: 24px;
          padding: 16px;
          background-color: var(--vscode-editor-background);
          border-radius: 8px;
          border: 1px solid var(--vscode-panel-border);
        }
        
        .curriculum-info p {
          margin: 0 0 12px 0;
          line-height: 1.5;
        }
        
        .curriculum-meta {
          display: flex;
          align-items: center;
          font-size: 12px;
        }
        
        .difficulty-badge {
          padding: 2px 8px;
          border-radius: 12px;
          background-color: var(--vscode-badge-background);
          color: var(--vscode-badge-foreground);
          margin-right: 12px;
        }
        
        .duration-info {
          color: var(--vscode-descriptionForeground);
        }
        
        .curriculum-steps h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 500;
        }
        
        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .step-item {
          display: flex;
          align-items: center;
          padding: 16px;
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .step-item:hover {
          background-color: var(--vscode-list-hoverBackground);
          border-color: var(--vscode-list-focusOutline);
        }
        
        .step-item.completed {
          border-color: var(--vscode-terminal-ansiGreen);
        }
        
        .step-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-right: 16px;
        }
        
        .step-content {
          flex: 1;
        }
        
        .step-title {
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .step-duration {
          font-size: 12px;
          color: var(--vscode-descriptionForeground);
        }
        
        .step-arrow {
          margin-left: 16px;
          font-size: 20px;
          color: var(--vscode-button-background);
        }
        
        .curriculum-empty-state {
          text-align: center;
          padding: 40px;
        }
        
        .curriculum-empty-state h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 500;
        }
        
        .curriculum-empty-state p {
          margin: 0;
          color: var(--vscode-descriptionForeground);
        }
      `}</style>
    </div>
  );
};

export default CurriculumView; 