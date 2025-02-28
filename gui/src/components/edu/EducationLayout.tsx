import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface EducationLayoutProps {
  children?: React.ReactNode;
}

const EducationLayout: React.FC<EducationLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { title, description } = useSelector((state: RootState) => state.uiState.headerInfo);
  
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
        <div className="nav-container">
          <div className="nav-buttons">
            <button onClick={goBack} className="nav-button">
              <span className="codicon codicon-arrow-left"></span> 뒤로
            </button>
            <button onClick={goHome} className="nav-button">
              <span className="codicon codicon-home"></span> 홈
            </button>
          </div>
          {title && (
            <div className="header-title">
              <h1>{title}</h1>
              {description && <p className="header-description">{description}</p>}
            </div>
          )}
        </div>
      </header>
      
      <main className="education-content">
        {children || <Outlet />}
      </main>
      
      <style jsx>{`
        .education-layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        
        .education-header {
          border-bottom: 1px solid var(--vscode-panel-border);
          background-color: var(--vscode-editor-background);
        }

        .nav-container {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          gap: 20px;
        }

        .nav-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .nav-button {
          display: flex;
          align-items: center;
          padding: 6px 10px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 2px;
          cursor: pointer;
        }
        
        .nav-button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }

        .header-title {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .header-title h1 {
          font-size: 1.2em;
          margin: 0;
          color: var(--vscode-foreground);
          font-weight: 500;
        }

        .header-description {
          font-size: 0.9em;
          margin: 0;
          color: var(--vscode-descriptionForeground);
        }
        
        .education-content {
          flex: 1;
          overflow: auto;
          padding: 16px;
        }
      `}</style>
    </div>
  );
};

export default EducationLayout; 