export { };
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
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

// --- Styled Components 정의 ---

const HomeContainer = styled.div<{ isMobileView: boolean }>`
  padding: ${({ isMobileView }) => (isMobileView ? '16px' : '24px')};
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    font-size: ${({ isMobileView }) => (isMobileView ? '20px' : '24px')};
    margin-bottom: ${({ isMobileView }) => (isMobileView ? '20px' : '24px')};
    text-align: center;
  }
`;

const LanguageSelectionArea = styled.div<{ isMobileView: boolean }>`
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: ${({ isMobileView }) => (isMobileView ? '16px' : '18px')};
    margin-bottom: 16px;
    color: var(--vscode-foreground);
    text-align: center;
  }
`;

const LanguageSelector = styled.div<{ isMobileView: boolean }>`
  position: relative;
  max-width: ${({ isMobileView }) => (isMobileView ? '90%' : 'none')};
  width: ${({ isMobileView }) => (isMobileView ? '90%' : 'auto')};
`;

const LanguageButton = styled.button<{ isMobileView: boolean }>`
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
  width: ${({ isMobileView }) => (isMobileView ? '100%' : 'auto')};
  text-align: left;

  &:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
`;

const DropdownArrow = styled.span`
  margin-left: 8px;
  font-size: 10px;
`;

const LanguageDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

const LanguageOption = styled.div<{ selected: boolean }>`
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  background-color: ${({ selected }) => (selected ? 'var(--vscode-list-activeSelectionBackground)' : 'transparent')};
  color: ${({ selected }) => (selected ? 'var(--vscode-list-activeSelectionForeground)' : 'inherit')};

  &:hover {
    background-color: var(--vscode-list-hoverBackground);
  }
`;

const LanguageIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

const EducationCards = styled.div<{ isMobileView: boolean }>`
  ${({ isMobileView }) =>
    isMobileView
      ? `
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
      `
      : `
        display: grid;
        grid-template-columns: repeat(auto-fit, 300px);
        gap: 24px;
        justify-content: center;
        align-items: stretch;
      `}
`;

const Card = styled.div<{ isMobileView: boolean }>`
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 8px;
  padding: ${({ isMobileView }) => (isMobileView ? '20px' : '24px')};
  max-width: ${({ isMobileView }) => (isMobileView ? '340px' : 'none')};
  width: ${({ isMobileView }) => (isMobileView ? '100%' : 'auto')};
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: ${({ isMobileView }) => (isMobileView ? '17px' : '18px')};
    margin-bottom: 8px;
    text-align: center;
  }

  p {
    color: var(--vscode-descriptionForeground);
    text-align: center;
    margin-bottom: 16px;
    font-size: ${({ isMobileView }) => (isMobileView ? '13px' : '14px')};
    flex-grow: 1;
  }
`;

const CardIcon = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
  text-align: center;
`;

const LanguageTag = styled.div<{ isMobileView: boolean }>`
  padding: 4px 8px;
  background-color: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
  border-radius: 12px;
  font-size: ${({ isMobileView }) => (isMobileView ? '11px' : '12px')};
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
`;

// --- Component Logic ---

const EducationHome: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux에서 선택된 언어 상태 가져오기
  const reduxSelectedLanguage = useSelector((state: RootState) => selectSelectedLanguage(state));
  // 로컬 상태 (UI 표시용)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

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

  // 컴포넌트 마운트 시 로컬 스토리지에서 언어 설정 로드
  useEffect(() => {
    // 헤더 정보 설정
    dispatch(setHeaderInfo({
      title: '에듀센스 플랫폼',
      description: '학습 시작하기'
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
  // 경로 수정 (/education/learn)
  const navigateWithLanguage = (path: string) => {
    const basePath = path.startsWith('/') ? path : `/${path}`; // Ensure path starts with /
    const fullPath = `/education/learn${basePath}`; // Add prefix
    if (reduxSelectedLanguage) {
      navigate(`${fullPath}?language=${reduxSelectedLanguage}`);
    } else {
      navigate(fullPath);
    }
  };

  const selectedLangInfo = getSelectedLanguage(); // 미리 계산

  return (
    <HomeContainer isMobileView={isMobileView}>
      <h1>학습 시작하기</h1>

      <LanguageSelectionArea isMobileView={isMobileView}>
        <h2>학습 언어 선택</h2>
        <LanguageSelector isMobileView={isMobileView}>
          <LanguageButton
            isMobileView={isMobileView}
            onClick={toggleLanguageMenu}
          >
            {selectedLangInfo
              ? (
                <>
                  <LanguageIcon>{selectedLangInfo.icon}</LanguageIcon>
                  {selectedLangInfo.name}
                </>
              )
              : '언어 선택'}
            <DropdownArrow>▼</DropdownArrow>
          </LanguageButton>

          {isLanguageMenuOpen && (
            <LanguageDropdown>
              {LANGUAGES.map(language => (
                <LanguageOption
                  key={language.id}
                  selected={reduxSelectedLanguage === language.id}
                  onClick={() => handleLanguageSelect(language.id)}
                >
                  <LanguageIcon>{language.icon}</LanguageIcon>
                  {language.name}
                </LanguageOption>
              ))}
            </LanguageDropdown>
          )}
        </LanguageSelector>
      </LanguageSelectionArea>

      <EducationCards isMobileView={isMobileView}>
        {/* 커리큘럼 카드 제거됨 */}
        {/*
        <Card
          isMobileView={isMobileView}
          onClick={() => navigateWithLanguage('/curriculum')}
        >
          <CardIcon>
            <span className="codicon codicon-book"></span>
          </CardIcon>
          <h2>커리큘럼</h2>
          <p>기초부터 차근차근 배워보세요.</p>
          {selectedLangInfo && (
            <LanguageTag isMobileView={isMobileView}>
              <LanguageIcon>{selectedLangInfo.icon}</LanguageIcon>
              {selectedLangInfo.name} 기준
            </LanguageTag>
          )}
        </Card>
        */}
        <Card
          isMobileView={isMobileView}
          onClick={() => navigateWithLanguage('/roadmaps')}
        >
          <CardIcon>
            <span className="codicon codicon-map"></span>
          </CardIcon>
          <h2>로드맵</h2>
          <p>체계적인 로드맵으로 실력을 키우세요.</p>
          {selectedLangInfo && (
            <LanguageTag isMobileView={isMobileView}>
              <LanguageIcon>{selectedLangInfo.icon}</LanguageIcon>
              {selectedLangInfo.name} 기준
            </LanguageTag>
          )}
        </Card>
      </EducationCards>
    </HomeContainer>
  );
};

export default EducationHome; 