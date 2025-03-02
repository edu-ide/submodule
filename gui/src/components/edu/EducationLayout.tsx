import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { setSelectedLanguage } from '../../redux/slices/languageSlice';
import { setViewMode, setListViewMode } from '../../redux/roadmapSlice';

// 인터페이스 언어 컨텍스트 생성
export const LanguageContext = createContext({
  language: 'ko',
  setLanguage: (lang: string) => {}
});

// 인터페이스 언어 컨텍스트 훅
export const useLanguage = () => useContext(LanguageContext);

interface EducationLayoutProps {
  children?: React.ReactNode;
}

const EducationLayout: React.FC<EducationLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { title, description } = useSelector((state: RootState) => state.uiState.headerInfo);
  
  // 인터페이스 언어 상태 관리
  const [language, setLanguage] = useState('ko'); // 한국어를 기본값으로 설정
  
  // 프로그래밍 언어 상태 Redux에서 가져오기
  const selectedProgrammingLanguage = useSelector((state: RootState) => state.language.selectedLanguage) || 'python';
  
  // 프로그래밍 언어 표시 이름
  const programmingLanguageNames = {
    python: 'Python',
    javascript: 'JavaScript',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#'
  };
  
  // 로드맵 설정 상태
  const [currentLayout, setCurrentLayout] = useState<string>('horizontal');
  const [showStatus, setShowStatus] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  // 설정 패널 표시 상태 추가
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  
  // 로드맵 보기 모드 상태 관리
  const viewMode = useSelector((state: RootState) => state.roadmap.viewMode);
  const listViewMode = useSelector((state: RootState) => state.roadmap.listViewMode);
  
  // 로컬 스토리지에서 인터페이스 언어 설정 불러오기
  useEffect(() => {
    const savedLanguage = localStorage.getItem('edu-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // 현재 경로가 로드맵 관련 페이지인지 확인
  const isRoadmapRoute = location.pathname.includes('/roadmap') && !location.pathname.includes('/roadmaps');
  
  // 현재 경로가 로드맵 목록 페이지인지 확인 (조건 강화)
  const isRoadmapListRoute = location.pathname.includes('/roadmaps') || 
                            location.pathname === '/education/roadmaps' ||
                            location.pathname.endsWith('/roadmaps');
  
  // 콘솔에 경로 정보 출력 (디버깅용)
  useEffect(() => {
    console.log('현재 경로:', location.pathname);
    console.log('isRoadmapRoute:', isRoadmapRoute);
    console.log('isRoadmapListRoute:', isRoadmapListRoute);
  }, [location.pathname, isRoadmapRoute, isRoadmapListRoute]);
  
  // 인터페이스 언어 변경 핸들러
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('edu-language', newLanguage);
  };
  
  // 로드맵 레이아웃 변경 핸들러
  const handleLayoutChange = (layout: string) => {
    setCurrentLayout(layout);
    // 여기서 로드맵 컴포넌트에 레이아웃 변경을 알리는 이벤트를 발생시키거나 상태를 전달해야 함
    // 예: 전역 상태로 레이아웃 설정 관리 또는 이벤트 발생
    const layoutChangeEvent = new CustomEvent('roadmap-layout-change', { 
      detail: { layout } 
    });
    window.dispatchEvent(layoutChangeEvent);
  };
  
  // 진행 상태 표시 핸들러
  const handleToggleStatus = () => {
    setShowStatus(!showStatus);
    const statusEvent = new CustomEvent('roadmap-status-toggle', { 
      detail: { show: !showStatus } 
    });
    window.dispatchEvent(statusEvent);
  };
  
  // 가이드 표시 핸들러
  const handleToggleGuide = () => {
    setShowGuide(!showGuide);
    const guideEvent = new CustomEvent('roadmap-guide-toggle', { 
      detail: { show: !showGuide } 
    });
    window.dispatchEvent(guideEvent);
  };
  
  // 보기 모드 변경 핸들러
  const handleViewModeChange = (mode: 'flow' | 'toc') => {
    dispatch(setViewMode(mode));
  };
  
  // 목록 보기 모드 변경 핸들러
  const handleListViewModeChange = (mode: 'list' | 'flow') => {
    dispatch(setListViewMode(mode));
  };
  
  // 설정 패널 토글 핸들러
  const toggleSettingsPanel = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      console.log('설정 버튼 클릭 이벤트 처리됨');
    }
    
    setShowSettingsPanel(prevState => {
      const newState = !prevState;
      console.log('설정 패널 상태 변경:', newState ? '열림' : '닫힘');
      
      // 상태 변경 후 DOM 업데이트를 위해 약간의 지연 시간을 두고 스크롤 처리
      if (newState) {
        setTimeout(() => {
          const settingsContent = document.querySelector('.settings-panel-content');
          if (settingsContent) {
            settingsContent.scrollTop = 0;
          }
        }, 50);
      }
      
      return newState;
    });
  };
  
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
  
  // useEffect를 써서 키보드 이벤트 설정
  useEffect(() => {
    // 설정 패널이 열려있을 때만 키보드 이벤트 리스너 추가
    if (showSettingsPanel) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          console.log('Escape 키 감지, 설정 패널 닫기');
          toggleSettingsPanel();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      // 클린업 함수
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showSettingsPanel]);
  
  // 외부 클릭 처리 함수
  const handleOutsideClick = (e: React.MouseEvent) => {
    // 이벤트 전파 중지
    e.stopPropagation();
    console.log('오버레이 클릭됨, 설정 패널 닫기');
    toggleSettingsPanel();
  };
  
  const handlePanelClick = (e: React.MouseEvent) => {
    // 패널 내부 클릭 시 이벤트 전파 중지(오버레이 클릭 이벤트 방지)
    e.stopPropagation();
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
            <div className="settings-container">
              {/* 프로그래밍 언어 표시 */}
              {selectedProgrammingLanguage && (
                <div className="current-language">
                  <span>{programmingLanguageNames[selectedProgrammingLanguage] || selectedProgrammingLanguage}</span>
                </div>
              )}
              
              {/* 뷰 모드 토글 버튼 추가 */}
              {isRoadmapListRoute && (
                <div className="view-mode-toggle-container">
                  <button 
                    className={`view-mode-toggle-button ${listViewMode === 'list' ? 'active' : ''}`}
                    onClick={() => handleListViewModeChange('list')}
                    title="목록 보기"
                    aria-label="목록 보기"
                    type="button"
                  >
                    <span className="toggle-icon">📋</span>
                  </button>
                  <button 
                    className={`view-mode-toggle-button ${listViewMode === 'flow' ? 'active' : ''}`}
                    onClick={() => handleListViewModeChange('flow')}
                    title="플로우 보기"
                    aria-label="플로우 보기"
                    type="button"
                  >
                    <span className="toggle-icon">🔄</span>
                  </button>
                </div>
              )}
              
              {isRoadmapRoute && (
                <div className="view-mode-toggle-container">
                  <button 
                    className={`view-mode-toggle-button ${viewMode === 'toc' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('toc')}
                    title="목차 보기"
                    aria-label="목차 보기"
                    type="button"
                  >
                    <span className="toggle-icon">📋</span>
                  </button>
                  <button 
                    className={`view-mode-toggle-button ${viewMode === 'flow' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('flow')}
                    title="플로우 보기"
                    aria-label="플로우 보기"
                    type="button"
                  >
                    <span className="toggle-icon">🔄</span>
                  </button>
                </div>
              )}
              
              {/* 로드맵 설정 - 로드맵 페이지와 로드맵 리스트 페이지에서 표시 */}
              {(isRoadmapRoute || isRoadmapListRoute) && (
                <div className="roadmap-settings">
                  <button 
                    className={`settings-button ${showSettingsPanel ? 'active' : ''}`}
                    onClick={(e) => toggleSettingsPanel(e)}
                    title={isRoadmapRoute ? "로드맵 설정" : "로드맵 목록 설정"}
                    aria-label={isRoadmapRoute ? "로드맵 설정" : "로드맵 목록 설정"}
                    type="button"
                  >
                    <span className="settings-icon">⚙️</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* 설정 패널 - 클래스 이름 변경 및 오버레이 별도 구성 */}
        {(isRoadmapRoute || isRoadmapListRoute) && showSettingsPanel && (
          <>
            <div 
              className="settings-backdrop" 
              onClick={handleOutsideClick}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 99999,
                backdropFilter: 'blur(2px)',
              }}
            ></div>
            
            <div 
              className="settings-modal" 
              onClick={handlePanelClick}
              style={{
                position: 'fixed',
                top: '70px',
                right: '20px',
                width: '320px',
                backgroundColor: 'var(--vscode-editor-background)',
                border: '1px solid var(--vscode-panel-border)',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                zIndex: 100000,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div 
                className="settings-modal-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--vscode-panel-border)',
                  flexShrink: 0,
                }}
              >
                <h3 style={{ margin: 0, fontSize: '1.1em' }}>
                  {isRoadmapRoute ? '로드맵 설정' : '로드맵 목록 설정'}
                </h3>
                <button 
                  onClick={() => toggleSettingsPanel()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--vscode-foreground)',
                    fontSize: '1.2em',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >✕</button>
              </div>
              
              <div 
                className="settings-modal-content"
                style={{
                  padding: '16px',
                  overflowY: 'auto',
                  maxHeight: 'calc(80vh - 60px)',
                  flexGrow: 1,
                }}
              >
                {/* 레이아웃 섹션 */}
                {(isRoadmapRoute || (isRoadmapListRoute && listViewMode === 'flow')) && (
                  <div className="settings-section">
                    <h4>레이아웃</h4>
                    <div className="layout-controls">
                      <button 
                        className={`layout-button ${currentLayout === 'horizontal' ? 'active' : ''}`}
                        onClick={() => handleLayoutChange('horizontal')}
                        title="수평 레이아웃"
                      >
                        <span className="layout-icon">⇨</span> 수평
                      </button>
                      <button 
                        className={`layout-button ${currentLayout === 'vertical' ? 'active' : ''}`}
                        onClick={() => handleLayoutChange('vertical')}
                        title="수직 레이아웃"
                      >
                        <span className="layout-icon">⇩</span> 수직
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 표시 옵션 */}
                {isRoadmapRoute && (
                  <div className="settings-section">
                    <h4>표시 옵션</h4>
                    <div className="display-controls">
                      <button 
                        className={`toggle-button ${showStatus ? 'active' : ''}`}
                        onClick={handleToggleStatus}
                      >
                        <span className="toggle-icon">📊</span> 진행 상태 표시
                      </button>
                      <button 
                        className={`toggle-button ${showGuide ? 'active' : ''}`}
                        onClick={handleToggleGuide}
                      >
                        <span className="toggle-icon">❓</span> 가이드 표시
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 언어 선택 */}
                <div className="settings-section">
                  <h4>인터페이스 언어</h4>
                  <div className="language-controls">
                    <select value={language} onChange={handleLanguageChange} className="language-select">
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        <main className="education-content">
          {children || <Outlet />}
        </main>
        
        <style jsx>{`
          .education-layout {
            display: flex;
            flex-direction: column;
            height: 100vh;
            position: relative;
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
            justify-content: space-between;
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
            flex: 1;
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
          
          .settings-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .current-language {
            font-size: 0.9em;
            color: var(--vscode-foreground);
            padding: 4px 8px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-dropdown-border);
            border-radius: 2px;
          }
          
          .roadmap-settings {
            position: relative;
            margin-left: 10px;
            z-index: 100000;
          }
          
          .settings-button {
            background: transparent;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s;
            position: relative;
            z-index: 100001;
          }
          
          .settings-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
          }
          
          .settings-button.active {
            background-color: var(--vscode-button-secondaryBackground);
          }
          
          .settings-icon {
            font-size: 1.2em;
          }
          
          /* 설정 패널 컨테이너 추가 */
          .settings-panel-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            pointer-events: none;
          }
          
          /* 설정 패널 스타일 */
          .settings-panel {
            position: fixed;
            top: 70px;
            right: 20px;
            width: 320px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 100000;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: settingsPanelFadeIn 0.2s ease-out;
            transform-origin: top right;
          }
          
          @keyframes settingsPanelFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .settings-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
            flex-shrink: 0;
            z-index: 100001;
          }
          
          .settings-panel-header h3 {
            margin: 0;
            font-size: 1.1em;
            color: var(--vscode-foreground);
          }
          
          .close-panel-button {
            background: transparent;
            border: none;
            color: var(--vscode-foreground);
            font-size: 1.2em;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
          }
          
          .close-panel-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
          }
          
          .settings-panel-content {
            padding: 16px;
            overflow-y: auto;
            max-height: calc(80vh - 60px);
            flex-grow: 1;
          }
          
          .settings-section {
            margin-bottom: 20px;
          }
          
          .settings-section h4 {
            margin: 0 0 10px 0;
            font-size: 0.95em;
            color: var(--vscode-foreground);
          }
          
          .layout-controls,
          .display-controls,
          .language-controls,
          .view-mode-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .layout-button,
          .toggle-button,
          .view-mode-button {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-button-border);
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
          }
          
          .layout-button:hover,
          .toggle-button:hover,
          .view-mode-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
          }
          
          .layout-button.active,
          .toggle-button.active,
          .view-mode-button.active {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
          }
          
          .layout-icon,
          .toggle-icon,
          .button-icon {
            margin-right: 8px;
            font-size: 14px;
          }
          
          .language-select {
            background-color: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            border: 1px solid var(--vscode-dropdown-border);
            border-radius: 2px;
            padding: 6px 8px;
            width: 100%;
            font-size: 0.9em;
            outline: none;
          }
          
          .language-select:hover {
            border-color: var(--vscode-focusBorder);
          }
          
          /* 설정 패널 오버레이 */
          .settings-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 99999;
            backdrop-filter: blur(2px);
            animation: overlayFadeIn 0.2s ease-out;
          }
          
          @keyframes overlayFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          .view-mode-toggle-container {
            display: flex;
            gap: 5px;
            margin-right: 5px;
          }
          
          .view-mode-toggle-button {
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 4px;
            width: 32px;
            height: 32px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .view-mode-toggle-button:hover {
            background: var(--vscode-button-secondaryHoverBackground);
          }
          
          .view-mode-toggle-button.active {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
          }
          
          .toggle-icon {
            font-size: 1.2rem;
          }
        `}</style>
      </div>
    </LanguageContext.Provider>
  );
};

export default EducationLayout; 