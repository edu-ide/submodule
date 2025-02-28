export {};
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setHeaderInfo } from '../redux/slices/uiStateSlice';

const EducationHome: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(setHeaderInfo({
      title: '에듀센스 플랫폼',
      description: '체계적인 학습을 통해 프로그래밍 실력을 향상시키세요'
    }));
  }, [dispatch]);
  
  return (
    <div className="education-home">
      <h1>에듀센스 플랫폼에 오신 것을 환영합니다</h1>
      
      <div className="education-cards">
        <div 
          className="education-card"
          onClick={() => navigate('/education/curriculum')}
        >
          <div className="card-icon">
            <span className="codicon codicon-book"></span>
          </div>
          <h2>커리큘럼</h2>
          <p>단계별 학습 가이드를 통해 새로운 기술을 배워보세요.</p>
        </div>
        
        <div 
          className="education-card"
          onClick={() => navigate('/education/roadmap')}
        >
          <div className="card-icon">
            <span className="codicon codicon-map"></span>
          </div>
          <h2>로드맵</h2>
          <p>체계적인 학습 경로를 통해 프로그래밍 기술을 마스터하세요.</p>
        </div>
      </div>
      
      <style jsx>{`
        .education-home {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          font-size: 24px;
          margin-bottom: 24px;
          text-align: center;
        }
        
        .education-cards {
          display: flex;
          gap: 24px;
          justify-content: center;
        }
        
        .education-card {
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          padding: 24px;
          width: 300px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .education-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .card-icon {
          font-size: 32px;
          margin-bottom: 16px;
          text-align: center;
        }
        
        h2 {
          font-size: 18px;
          margin-bottom: 8px;
          text-align: center;
        }
        
        p {
          color: var(--vscode-descriptionForeground);
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default EducationHome; 