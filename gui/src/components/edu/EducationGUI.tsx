import React from 'react';
import { CURRICULUM_DATA } from '../../data/curriculumData';
import { CurriculumItem, CurriculumStep } from '../../types/curriculum';
import './edu.css';

interface EducationGUIProps {
  onSelectCurriculum?: (curriculumId: string) => void;
  onSelectCategory?: (curriculumId: string, categoryIndex: number) => void;
  selectedCurriculumId?: string;
}

const EducationGUI: React.FC<EducationGUIProps> = ({ 
  onSelectCurriculum,
  onSelectCategory,
  selectedCurriculumId
}) => {
  // 중복 정의 제거 - 로컬 상태 대신 부모로부터 전달받은 ID만 사용
  const selectedCurriculum = selectedCurriculumId 
    ? CURRICULUM_DATA.find(item => item.id === selectedCurriculumId) || null
    : null;

  // 커리큘럼 선택 핸들러
  const handleCurriculumSelect = (curriculum: CurriculumItem) => {
    // 상위 컴포넌트에 선택 이벤트 전달
    if (onSelectCurriculum) {
      onSelectCurriculum(curriculum.id);
    }
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (curriculumId: string, stepIndex: number) => {
    if (onSelectCategory) {
      onSelectCategory(curriculumId, stepIndex);
    }
  };

  // 뒤로가기 핸들러 추가
  const handleBack = () => {
    if (onSelectCurriculum) {
      onSelectCurriculum(''); // 빈 문자열을 전달하여 선택 취소 효과
    }
  };

  // 커리큘럼 목록만 표시
  if (!selectedCurriculum) {
    return (
      <div className="education-container curriculum-only-view">
        <div className="curriculum-grid">
          {CURRICULUM_DATA.map((curriculum) => {
            const totalSteps = curriculum.steps.length;
            const completedSteps = curriculum.steps.filter(step => step.completed === true).length;
            const progress = Math.round((completedSteps / totalSteps) * 100);
            
            return (
              <div
                key={curriculum.id}
                className="curriculum-card"
                onClick={() => handleCurriculumSelect(curriculum)}
              >
                <div className="curriculum-icon">
                  {curriculum.category === 'frontend' ? '🎨' : '🔧'}
                </div>
                <div className="curriculum-card-content">
                  <h3>{curriculum.title}</h3>
                  <p>{curriculum.description}</p>
                  <div className="curriculum-meta">
                    <span className={`difficulty ${curriculum.difficulty}`}>
                      {curriculum.difficulty === 'beginner' ? '초급' : 
                       curriculum.difficulty === 'intermediate' ? '중급' : '고급'}
                    </span>
                    <span className="category">
                      {curriculum.category === 'frontend' ? '프론트엔드' : '백엔드'}
                    </span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    ></div>
                    <span className="progress-text">{progress}% 완료</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <style>{`
          .curriculum-only-view {
            padding: 20px;
          }
          
          .curriculum-title-header {
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: 500;
          }
          
          .curriculum-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
          
          .curriculum-card {
            display: flex;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .curriculum-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
            border-color: var(--vscode-focusBorder);
          }
          
          .curriculum-icon {
            font-size: 32px;
            margin-right: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-button-background);
            border-radius: 50%;
            width: 48px;
            height: 48px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .curriculum-card-content {
            flex: 1;
          }
          
          .curriculum-card h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
          }
          
          .curriculum-card p {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
          }
          
          .curriculum-meta {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
          }
          
          .difficulty {
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 12px;
          }
          
          .difficulty.beginner {
            background-color: var(--vscode-terminal-ansiGreen);
            color: var(--vscode-editor-background);
          }
          
          .difficulty.intermediate {
            background-color: var(--vscode-terminal-ansiYellow);
            color: var(--vscode-editor-background);
          }
          
          .difficulty.advanced {
            background-color: var(--vscode-terminal-ansiRed);
            color: var(--vscode-editor-background);
          }
          
          .category {
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 12px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
          }
          
          .progress-container {
            position: relative;
            height: 8px;
            background-color: var(--vscode-input-background);
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
          }
          
          .progress-bar {
            height: 100%;
            background-color: var(--vscode-button-background);
            border-radius: 4px;
            transition: width 0.3s ease;
          }
          
          .progress-text {
            position: absolute;
            top: -18px;
            right: 0;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
          }
        `}</style>
      </div>
    );
  }
  
  // 선택된 커리큘럼의 카테고리 버튼 UI 표시
  return (
    <div className="category-selection-container">
      <div className="category-header">
        <button className="back-button" onClick={handleBack}>
          ← 뒤로
        </button>
        <h2>{selectedCurriculum.title}</h2>
      </div>
      
      <p className="category-description">{selectedCurriculum.description}</p>
      
      <div className="category-buttons">
        {selectedCurriculum.steps.map((step, index) => (
          <button 
            key={index}
            className={`category-button ${step.completed ? 'completed' : ''}`}
            onClick={() => handleCategorySelect(selectedCurriculum.id, index)}
          >
            <div className="category-icon">
              {index === 0 ? '준비' : 
               index === 1 ? '목표' : 
               index === 2 ? '이론' : 
               index === 3 ? '실습' : '평가'}
            </div>
            <div className="category-content">
              <span className="category-title">{step.title}</span>
              {step.completed && <span className="completed-badge">완료됨</span>}
            </div>
            <div className="category-arrow">→</div>
          </button>
        ))}
      </div>
      
      <style>{`
        .category-selection-container {
          padding: 20px;
          max-width: 720px;
          margin: 0 auto;
        }
        
        .category-header {
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
        
        .category-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
        }
        
        .category-description {
          color: var(--vscode-descriptionForeground);
          margin-bottom: 24px;
          font-size: 16px;
          line-height: 1.5;
        }
        
        .category-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .category-button {
          display: flex;
          align-items: center;
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          margin-bottom: 10px;
        }
        
        .category-button:hover {
          background-color: var(--vscode-list-hoverBackground);
          border-color: var(--vscode-focusBorder);
          transform: translateX(5px);
        }
        
        .category-button.completed {
          border-left: 4px solid var(--vscode-terminal-ansiGreen);
        }
        
        .category-icon {
          font-size: 14px;
          font-weight: bold;
          margin-right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid var(--vscode-button-foreground);
        }
        
        .category-content {
          flex: 1;
          display: flex;
          align-items: center;
        }
        
        .category-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--vscode-editor-foreground);
        }
        
        .completed-badge {
          margin-left: 8px;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 12px;
          background-color: var(--vscode-terminal-ansiGreen);
          color: var(--vscode-editor-background);
        }
        
        .category-arrow {
          margin-left: 16px;
          font-size: 20px;
          font-weight: bold;
          color: var(--vscode-button-background);
        }
      `}</style>
    </div>
  );
};

export default EducationGUI;
