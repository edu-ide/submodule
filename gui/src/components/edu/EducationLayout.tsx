import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const EducationLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 뒤로가기 함수
  const goBack = () => {
    if (location.pathname === '/education/home' || 
        location.pathname === '/education/curriculum' ||
        location.pathname === '/education/roadmap') {
      // 홈/루트 화면에서는 VS Code로 돌아가기
      window.history.back();
    } else {
      // 다른 화면에서는 이전 라우트로 이동
      navigate(-1);
    }
  };
  
  // 홈으로 이동
  const goHome = () => {
    navigate('/education/home');
  };
  
  return (
    <div className="education-layout">
      <header className="education-header">
        <button onClick={goBack} className="nav-button">
          <span className="codicon codicon-arrow-left"></span> 뒤로
        </button>
        <button onClick={goHome} className="nav-button">
          <span className="codicon codicon-home"></span> 홈
        </button>
      </header>
      
      <main className="education-content">
        <Outlet />
      </main>
      
      <style jsx>{`
        .education-layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        
        .education-header {
          display: flex;
          padding: 8px 16px;
          border-bottom: 1px solid var(--vscode-panel-border);
          background-color: var(--vscode-editor-background);
        }
        
        .nav-button {
          display: flex;
          align-items: center;
          padding: 6px 10px;
          margin-right: 8px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 2px;
          cursor: pointer;
        }
        
        .nav-button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
        
        .education-content {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

export default EducationLayout; 