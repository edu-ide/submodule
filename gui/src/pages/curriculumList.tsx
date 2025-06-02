export {};
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CurriculumList: React.FC = () => {
  const navigate = useNavigate();
  
  // 커리큘럼 데이터 (나중에 실제 데이터로 교체)
  const curriculums = [
    { id: 'python', title: '파이썬 기초', description: '파이썬 프로그래밍의 기초를 배웁니다.', difficulty: '초급', duration: '4주' },
    { id: 'javascript', title: '자바스크립트 입문', description: '웹 개발을 위한 자바스크립트 기초를 배웁니다.', difficulty: '초급', duration: '3주' },
    { id: 'react', title: 'React 개발', description: 'React 라이브러리를 사용한 웹 애플리케이션 개발을 배웁니다.', difficulty: '중급', duration: '6주' }
  ];

  return (
    <div className="curriculum-list">
      <h1>학습 커리큘럼</h1>
      
      <div className="items-grid">
        {curriculums.map(item => (
          <div 
            key={item.id} 
            className="item-card"
            onClick={() => navigate(`/education/curriculum/${item.id}`)}
          >
            <div className="item-title">{item.title}</div>
            <div className="item-description">{item.description}</div>
            <div className="item-meta">
              <span className="difficulty">{item.difficulty}</span>
              <span className="duration">{item.duration}</span>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .curriculum-list {
          padding: 20px;
        }
        
        h1 {
          margin-bottom: 20px;
          font-size: 24px;
        }
        
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .item-card {
          padding: 20px;
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .item-card:hover {
          background-color: var(--vscode-list-hoverBackground);
        }
        
        .item-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .item-description {
          margin-bottom: 16px;
          color: var(--vscode-foreground);
        }
        
        .item-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--vscode-descriptionForeground);
        }
      `}</style>
    </div>
  );
};

export default CurriculumList; 