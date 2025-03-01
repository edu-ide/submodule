export {};
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setHeaderInfo } from '../redux/slices/uiStateSlice';
import { setSelectedLanguage, selectSelectedLanguage } from '../redux/slices/languageSlice';
import { RootState } from '../redux/store';

// 지원하는 프로그래밍 언어 목록
const LANGUAGES = [
  { id: 'python', name: '파이썬', icon: '🐍' },
  { id: 'javascript', name: '자바스크립트', icon: '🟨' },
  { id: 'java', name: '자바', icon: '☕' },
  { id: 'csharp', name: 'C#', icon: '🔷' },
  { id: 'cpp', name: 'C++', icon: '🔵' }
];

const EducationHome: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux에서 선택된 언어 상태 가져오기
  const reduxSelectedLanguage = useSelector((state: RootState) => selectSelectedLanguage(state));
  // 로컬 상태 (UI 표시용)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  
  // 컴포넌트 마운트 시 로컬 스토리지에서 언어 설정 로드
  useEffect(() => {
    // 헤더 정보 설정
    dispatch(setHeaderInfo({
      title: '에듀센스 플랫폼',
      description: '체계적인 학습을 통해 프로그래밍 실력을 향상시키세요'
    }));
    
    // 로컬 스토리지에서 선택된 언어 가져오기
    const savedLanguage = localStorage.getItem('preferredLanguage');
    
    // 저장된 언어가 있고 Redux 상태가 없으면 Redux 상태 업데이트
    if (savedLanguage && !reduxSelectedLanguage) {
      dispatch(setSelectedLanguage(savedLanguage));
    }
  }, [dispatch, reduxSelectedLanguage]);
  
  // 언어 선택 핸들러
  const handleLanguageSelect = (languageId: string) => {
    // Redux 상태 업데이트
    dispatch(setSelectedLanguage(languageId));
    setIsLanguageMenuOpen(false);
    
    // localStorage에 선택한 언어 저장
    localStorage.setItem('preferredLanguage', languageId);
  };
  
  // 선택된 언어 정보 얻기
  const getSelectedLanguage = () => {
    return LANGUAGES.find(lang => lang.id === reduxSelectedLanguage) || null;
  };
  
  // 언어 선택 메뉴 토글
  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };
  
  // 커리큘럼 또는 로드맵 페이지로 이동할 때 선택된 언어 전달
  const navigateWithLanguage = (path: string) => {
    if (reduxSelectedLanguage) {
      navigate(`${path}?language=${reduxSelectedLanguage}`);
    } else {
      navigate(path);
    }
  };
  
  return (
    <div className="education-home">
      <h1>에듀센스 플랫폼에 오신 것을 환영합니다</h1>
      
      {/* 언어 선택 영역 */}
      <div className="language-selection-area">
        <h2>학습할 프로그래밍 언어를 선택하세요</h2>
        <div className="language-selector">
          <button 
            className="language-button"
            onClick={toggleLanguageMenu}
          >
            {getSelectedLanguage() 
              ? (
                <span>
                  <span className="language-icon">{getSelectedLanguage()?.icon}</span>
                  {getSelectedLanguage()?.name}
                </span>
              ) 
              : '언어 선택'}
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {isLanguageMenuOpen && (
            <div className="language-dropdown">
              {LANGUAGES.map(language => (
                <div 
                  key={language.id}
                  className={`language-option ${reduxSelectedLanguage === language.id ? 'selected' : ''}`}
                  onClick={() => handleLanguageSelect(language.id)}
                >
                  <span className="language-icon">{language.icon}</span>
                  {language.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="education-cards">
        <div 
          className="education-card"
          onClick={() => navigateWithLanguage('/education/curriculum')}
        >
          <div className="card-icon">
            <span className="codicon codicon-book"></span>
          </div>
          <h2>커리큘럼</h2>
          <p>단계별 학습 가이드를 통해 새로운 기술을 배워보세요.</p>
          {reduxSelectedLanguage && (
            <div className="language-tag">
              <span className="language-icon">{getSelectedLanguage()?.icon}</span> 
              {getSelectedLanguage()?.name} 기준
            </div>
          )}
        </div>
        
        <div 
          className="education-card"
          onClick={() => navigateWithLanguage('/education/roadmap')}
        >
          <div className="card-icon">
            <span className="codicon codicon-map"></span>
          </div>
          <h2>로드맵</h2>
          <p>체계적인 학습 경로를 통해 프로그래밍 기술을 마스터하세요.</p>
          {reduxSelectedLanguage && (
            <div className="language-tag">
              <span className="language-icon">{getSelectedLanguage()?.icon}</span> 
              {getSelectedLanguage()?.name} 기준
            </div>
          )}
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
        
        .language-selection-area {
          margin-bottom: 32px;
          text-align: center;
        }
        
        .language-selection-area h2 {
          font-size: 18px;
          margin-bottom: 16px;
          color: var(--vscode-foreground);
        }
        
        .language-selector {
          position: relative;
          display: inline-block;
        }
        
        .language-button {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 150px;
        }
        
        .language-button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
        
        .dropdown-arrow {
          margin-left: 8px;
          font-size: 10px;
        }
        
        .language-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          z-index: 10;
          margin-top: 4px;
        }
        
        .language-option {
          padding: 10px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        
        .language-option:hover {
          background-color: var(--vscode-list-hoverBackground);
        }
        
        .language-option.selected {
          background-color: var(--vscode-list-activeSelectionBackground);
          color: var(--vscode-list-activeSelectionForeground);
        }
        
        .language-icon {
          margin-right: 8px;
          font-size: 16px;
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
          position: relative;
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
          margin-bottom: 16px;
        }
        
        .language-tag {
          display: inline-block;
          padding: 4px 8px;
          background-color: var(--vscode-badge-background);
          color: var(--vscode-badge-foreground);
          border-radius: 12px;
          font-size: 12px;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default EducationHome; 