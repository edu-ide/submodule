export {};
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoadmapList: React.FC = () => {
  const navigate = useNavigate();
  
  // 샘플 로드맵 데이터
  const roadmaps = [
    { id: 'python', title: '파이썬 학습 로드맵', description: '파이썬 프로그래밍 기초부터 고급 주제까지 체계적으로 학습' },
    { id: 'javascript', title: '자바스크립트 로드맵', description: '웹 개발을 위한 자바스크립트 기초와 현대적 프레임워크' },
    { id: 'react', title: 'React 개발 로드맵', description: 'React 라이브러리를 활용한 프론트엔드 개발 학습 경로' }
  ];

  return (
    <div className="roadmap-list">
      <h1>학습 로드맵</h1>
      
      <div className="roadmap-grid">
        {roadmaps.map(roadmap => (
          <div 
            key={roadmap.id} 
            className="roadmap-card"
            onClick={() => navigate(`/education/roadmap/${roadmap.id}`)}
          >
            <h2>{roadmap.title}</h2>
            <p>{roadmap.description}</p>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .roadmap-list {
          padding: 20px;
        }
        
        h1 {
          margin-bottom: 20px;
          font-size: 24px;
        }
        
        .roadmap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .roadmap-card {
          padding: 20px;
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .roadmap-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          margin-top: 0;
          font-size: 18px;
        }
        
        p {
          color: var(--vscode-descriptionForeground);
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default RoadmapList; 