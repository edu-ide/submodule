import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from '@emotion/styled'; // Emotion styled import
import {
  ArrowLeft, Home, List, GitBranch, Settings, X, MoveRight, MoveDown, BarChartHorizontal, HelpCircle
} from 'lucide-react';
import { RootState } from '../../redux/store';
import { setSelectedLanguage } from '../../redux/slices/languageSlice';
import { setViewMode, setListViewMode } from '../../redux/roadmapSlice';

// 인터페이스 언어 컨텍스트 생성
export const LanguageContext = createContext({
  language: 'ko',
  setLanguage: (lang: string) => { }
});

// 인터페이스 언어 컨텍스트 훅
export const useLanguage = () => useContext(LanguageContext);

interface EducationLayoutProps {
  children?: React.ReactNode;
}

// --- Styled Components 정의 ---

const LayoutContainer = styled.div<{ isMobileView: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
`;

const Header = styled.header`
  border-bottom: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
  flex-shrink: 0;
`;

const NavContainer = styled.div<{ isMobileView: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ isMobileView }) => (isMobileView ? '8px 12px' : '8px 16px')};
  gap: ${({ isMobileView }) => (isMobileView ? '8px' : '12px')};
  justify-content: space-between;
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button<{ isMobileView: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  min-width: 36px;
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
`;

const HeaderTitleContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const HeaderTitle = styled.h1`
  font-size: 1.2em;
  margin: 0;
  color: var(--vscode-foreground);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeaderDescription = styled.p`
  font-size: 0.9em;
  margin: 0;
  color: var(--vscode-descriptionForeground);
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SettingsContainer = styled.div<{ isMobileView: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ isMobileView }) => (isMobileView ? '5px' : '8px')};
`;

const CurrentLanguage = styled.div`
  font-size: 0.9em;
  color: var(--vscode-foreground);
  padding: 4px 8px;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-dropdown-border);
  border-radius: 2px;
  white-space: nowrap;
`;

const ViewModeToggleContainer = styled.div`
  display: flex;
  gap: 5px;
`;

const ViewModeToggleButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ active }) => (active ? 'var(--vscode-button-background)' : 'var(--vscode-button-secondaryBackground)')};
  color: ${({ active }) => (active ? 'var(--vscode-button-foreground)' : 'var(--vscode-button-secondaryForeground)')};
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--vscode-button-secondaryHoverBackground);
  }
`;


const RoadmapSettings = styled.div`
  position: relative;
  z-index: 100000;
`;

const SettingsButton = styled.button<{ active: boolean }>`
  background: ${({ active }) => (active ? 'var(--vscode-button-secondaryBackground)' : 'transparent')};
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
  color: var(--vscode-button-foreground);

  &:hover {
    background-color: var(--vscode-button-secondaryHoverBackground);
  }
`;

const SettingsBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 99999;
  backdrop-filter: blur(2px);
  animation: overlayFadeIn 0.2s ease-out;

  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SettingsModal = styled.div<{ isMobileView: boolean }>`
  position: fixed;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 100000;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 자식 요소의 overflow 처리 */

  ${({ isMobileView }) =>
    isMobileView
      ? `
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        max-height: 70vh;
        border-radius: 12px 12px 0 0;
        transform-origin: bottom center;
        animation: settingsPanelSlideUp 0.3s ease-out;

        @keyframes settingsPanelSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `
      : `
        top: 70px; /* 헤더 높이 고려 */
        right: 20px;
        width: 320px;
        max-height: calc(100vh - 90px); /* 위아래 여백 고려 */
        border-radius: 6px;
        transform-origin: top right;
        animation: settingsPanelFadeIn 0.2s ease-out;

        @keyframes settingsPanelFadeIn {
           from { opacity: 0; transform: scale(0.95); }
           to { opacity: 1; transform: scale(1); }
        }
      `}
`;


const SettingsModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vscode-panel-border);
  flex-shrink: 0;
  z-index: 1; /* 내용 스크롤 시 위에 있도록 */

  h3 {
    margin: 0;
    font-size: 1.1em;
    color: var(--vscode-foreground);
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--vscode-foreground);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--vscode-button-secondaryHoverBackground);
  }
`;

const SettingsModalContent = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
`;

const SettingsSection = styled.div`
  margin-bottom: 20px;

  h4 {
    margin: 0 0 10px 0;
    font-size: 0.95em;
    color: var(--vscode-foreground);
  }
`;

const ControlsContainer = styled.div<{ isMobileView: boolean; direction?: 'row' | 'column' }>`
  display: flex;
  flex-direction: ${({ isMobileView, direction }) => (direction === 'row' && !isMobileView ? 'row' : 'column')};
  gap: 8px;
`;

const SettingButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: ${({ active }) => (active ? 'var(--vscode-button-background)' : 'var(--vscode-button-secondaryBackground)')};
  color: ${({ active }) => (active ? 'var(--vscode-button-foreground)' : 'var(--vscode-button-secondaryForeground)')};
  border: 1px solid var(--vscode-button-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  text-align: left;
  flex-grow: 1;

  &:hover {
    background-color: var(--vscode-button-secondaryHoverBackground);
  }

  svg {
    margin-right: 8px;
    flex-shrink: 0;
  }
`;


const LanguageSelect = styled.select`
  background-color: var(--vscode-dropdown-background);
  color: var(--vscode-dropdown-foreground);
  border: 1px solid var(--vscode-dropdown-border);
  border-radius: 2px;
  padding: 6px 8px;
  width: 100%;
  font-size: 0.9em;
  outline: none;

  &:hover {
    border-color: var(--vscode-focusBorder);
  }
`;

const MainContent = styled.main`
  flex: 1;
  overflow: auto;
  padding: 0px;
`;

// --- Component Logic ---

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
  const programmingLanguageNames: { [key: string]: string } = { // 타입 명시
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

  // 모바일 뷰 상태 추가
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // 화면 크기 감지 useEffect 추가
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkScreenSize(); // 초기 실행
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


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
  // 경로 prefix 수정 (/education/learn)
  const isRoadmapListRoute = location.pathname.includes('/roadmaps') ||
    location.pathname === '/education/learn/roadmaps' ||
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
    // 경로 prefix 수정 (/education/learn)
    if (location.pathname === '/education/learn/home' ||
      location.pathname === '/education/learn/curriculum' ||
      location.pathname === '/education/learn/roadmaps') {
      // 홈/루트 화면에서는 VS Code로 돌아가기
      window.history.back();
    } else {
      // 다른 화면에서는 이전 라우트로 이동
      navigate(-1);
    }
  };

  // 홈으로 이동
  const goHome = () => {
    navigate('/education/learn/home'); // 경로 prefix 수정
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
      <LayoutContainer isMobileView={isMobileView}>
        <Header>
          <NavContainer isMobileView={isMobileView}>
            <NavButtons>
              <NavButton onClick={goBack} title="뒤로" isMobileView={isMobileView}>
                <ArrowLeft size={18} />
              </NavButton>
              <NavButton onClick={goHome} title="홈" isMobileView={isMobileView}>
                <Home size={18} />
              </NavButton>
            </NavButtons>

            {!isMobileView && title && (
              <HeaderTitleContainer>
                <HeaderTitle>{title}</HeaderTitle>
                {description && <HeaderDescription>{description}</HeaderDescription>}
              </HeaderTitleContainer>
            )}

            <SettingsContainer isMobileView={isMobileView}>
              {!isMobileView && selectedProgrammingLanguage && (
                <CurrentLanguage>
                  {programmingLanguageNames[selectedProgrammingLanguage] || selectedProgrammingLanguage}
                </CurrentLanguage>
              )}

              {isRoadmapListRoute && (
                <ViewModeToggleContainer>
                  <ViewModeToggleButton
                    active={listViewMode === 'list'}
                    onClick={() => handleListViewModeChange('list')}
                    title="목록 보기" aria-label="목록 보기" type="button"
                  >
                    <List size={18} />
                  </ViewModeToggleButton>
                  <ViewModeToggleButton
                    active={listViewMode === 'flow'}
                    onClick={() => handleListViewModeChange('flow')}
                    title="플로우 보기" aria-label="플로우 보기" type="button"
                  >
                    <GitBranch size={18} />
                  </ViewModeToggleButton>
                </ViewModeToggleContainer>
              )}
              {isRoadmapRoute && (
                <ViewModeToggleContainer>
                  <ViewModeToggleButton
                    active={viewMode === 'toc'}
                    onClick={() => handleViewModeChange('toc')}
                    title="목차 보기" aria-label="목차 보기" type="button"
                  >
                    <List size={18} />
                  </ViewModeToggleButton>
                  <ViewModeToggleButton
                    active={viewMode === 'flow'}
                    onClick={() => handleViewModeChange('flow')}
                    title="플로우 보기" aria-label="플로우 보기" type="button"
                  >
                    <GitBranch size={18} />
                  </ViewModeToggleButton>
                </ViewModeToggleContainer>
              )}

              {(isRoadmapRoute || isRoadmapListRoute) && (
                <RoadmapSettings>
                  <SettingsButton
                    active={showSettingsPanel}
                    onClick={(e) => toggleSettingsPanel(e)}
                    title="설정" aria-label="설정" type="button"
                  >
                    <Settings size={18} />
                  </SettingsButton>
                </RoadmapSettings>
              )}
            </SettingsContainer>
          </NavContainer>
        </Header>

        {(isRoadmapRoute || isRoadmapListRoute) && showSettingsPanel && (
          <>
            <SettingsBackdrop onClick={handleOutsideClick} />
            <SettingsModal isMobileView={isMobileView} onClick={handlePanelClick}>
              <SettingsModalHeader>
                <h3>{isRoadmapRoute ? '로드맵 설정' : '로드맵 목록 설정'}</h3>
                <CloseButton onClick={() => toggleSettingsPanel()}>
                  <X size={20} />
                </CloseButton>
              </SettingsModalHeader>

              <SettingsModalContent>
                {(isRoadmapRoute || (isRoadmapListRoute && listViewMode === 'flow')) && (
                  <SettingsSection>
                    <h4>레이아웃</h4>
                    <ControlsContainer isMobileView={isMobileView} direction="row">
                      <SettingButton
                        active={currentLayout === 'horizontal'}
                        onClick={() => handleLayoutChange('horizontal')}
                        title="수평 레이아웃"
                      >
                        <MoveRight size={16} /> 수평
                      </SettingButton>
                      <SettingButton
                        active={currentLayout === 'vertical'}
                        onClick={() => handleLayoutChange('vertical')}
                        title="수직 레이아웃"
                      >
                        <MoveDown size={16} /> 수직
                      </SettingButton>
                    </ControlsContainer>
                  </SettingsSection>
                )}

                {isRoadmapRoute && (
                  <SettingsSection>
                    <h4>표시 옵션</h4>
                    <ControlsContainer isMobileView={isMobileView}>
                      <SettingButton
                        active={showStatus}
                        onClick={handleToggleStatus}
                      >
                        <BarChartHorizontal size={16} /> 진행 상태 표시
                      </SettingButton>
                      <SettingButton
                        active={showGuide}
                        onClick={handleToggleGuide}
                      >
                        <HelpCircle size={16} /> 가이드 표시
                      </SettingButton>
                    </ControlsContainer>
                  </SettingsSection>
                )}

                <SettingsSection>
                  <h4>인터페이스 언어</h4>
                  <ControlsContainer isMobileView={isMobileView}>
                    <LanguageSelect value={language} onChange={handleLanguageChange}>
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </LanguageSelect>
                  </ControlsContainer>
                </SettingsSection>
              </SettingsModalContent>
            </SettingsModal>
          </>
        )}

        <MainContent>
          {children || <Outlet />}
        </MainContent>
      </LayoutContainer>
    </LanguageContext.Provider>
  );
};

export default EducationLayout; 