export {};
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CURRICULUM_DATA } from '../data/curriculumData';

const CurriculumCategories: React.FC = () => {
  const { curriculumId } = useParams();
  const navigate = useNavigate();
  
  // 선택된 커리큘럼 찾기
  const curriculum = CURRICULUM_DATA.find(item => item.id === curriculumId);
  
  // 임시 카테고리 데이터
  const categories = curriculum?.categories || [
    { id: '1', title: '기본 개념', description: '기초 개념과 문법 학습' },
    { id: '2', title: '중급 기능', description: '더 복잡한 기능과 패턴 사용' },
    { id: '3', title: '고급 주제', description: '고급 기법과 최적화 방법' }
  ];
  
  return (
    <div className="curriculum-categories">
      <button 
        className="back-button"
        onClick={() => navigate('/education/curriculum')}
      >
        <span className="codicon codicon-arrow-left"></span> 뒤로가기
      </button>
      
      <h1>{curriculum?.title || curriculumId} 학습 카테고리</h1>
      
      <div className="categories-list">
        {categories.map((category, index) => (
          <div 
            key={category.id} 
            className="category-card"
            onClick={() => navigate(`/education/curriculum/${curriculumId}/category/${index}`)}
          >
            <h2>{category.title}</h2>
            <p>{category.description}</p>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .curriculum-categories {
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
          margin-bottom: 20px;
        }
        
        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .category-card {
          padding: 16px;
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .category-card:hover {
          background-color: var(--vscode-list-hoverBackground);
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 8px;
        }
        
        p {
          color: var(--vscode-descriptionForeground);
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default CurriculumCategories; 