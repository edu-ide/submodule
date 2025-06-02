import React, { useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import 'highlight.js/styles/vs2015.css'; // VS Code 스타일 테마
import './styles/roadmapContent.css';

// 분리된 컴포넌트 임포트
import MarkdownRenderer from './components/MarkdownRenderer';
import ContentHeader from './components/ContentHeader';
import ContentNavigation from './components/ContentNavigation';
import ErrorDisplay from './components/ErrorDisplay';

// 분리된 훅 임포트
import { useRoadmapContent } from './hooks/useRoadmapContent';
import { useScrollToSection } from './hooks/useScrollToSection';

// VS Code 테마 색상 변수 (tailwind 변수 사용)
const vsCodeTheme = {
  // 기본 색상
  background: 'var(--background)',           // VSCode 배경
  foreground: 'var(--foreground)',          // 기본 텍스트
  editorBackground: 'var(--background)', // 에디터 배경
  border: 'var(--border)',                   // 테두리
  
  // 강조 색상
  button: {
    background: 'var(--button-background)',
    foreground: 'var(--button-foreground)',
    hover: 'var(--button-hover-background)',
  },
  
  // 입력 요소
  input: {
    background: 'var(--input-background)',
    foreground: 'var(--input-foreground)',
    border: 'var(--input-border)',
  },
  
  // 리스트 관련
  list: {
    activeSelection: {
      background: 'var(--list-active-selection-background)',
      foreground: 'var(--list-active-selection-foreground)',
    },
    hoverBackground: 'var(--list-hover-background)',
  },
  
  // 탭 관련
  tab: {
    activeBackground: 'var(--tab-active-background)',
    activeForeground: 'var(--tab-active-foreground)',
  },
};

/**
 * 로드맵 콘텐츠 뷰 컴포넌트
 * 로드맵의 콘텐츠를 표시하는 페이지 컴포넌트
 */
const RoadmapContentView: React.FC = () => {
  const params = useParams();
  const { roadmapId, contentId } = params;
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 콘텐츠 로드 훅 사용
  const {
    contentData,
    isLoading,
    error,
    realContentId,
    getNodeTitleForUrl,
    getNextContentId,
    getPrevContentId
  } = useRoadmapContent({ roadmapId, contentId });
  
  // 스크롤 훅 사용
  const { scrollToSection } = useScrollToSection({ 
    contentRef, 
    isLoading, 
    contentLoaded: !!contentData 
  });

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="loading-container">
        로딩 중...
      </div>
    );
  }
  
  // 에러 표시
  if (error) {
    return (
      <ErrorDisplay 
        error={error}
        contentId={contentId}
        realContentId={realContentId}
        onBack={() => {
          if (roadmapId) {
            window.location.href = `/education/roadmap/${roadmapId}`;
          }
        }}
        vsCodeTheme={vsCodeTheme}
      />
    );
  }
  
  // 콘텐츠 데이터가 없을 때 표시
  if (!contentData) {
    return (
      <ErrorDisplay 
        error="콘텐츠 데이터를 불러올 수 없습니다. 문제가 지속되면 관리자에게 문의해주세요."
        contentId={contentId}
        realContentId={realContentId}
        onBack={() => {
          if (roadmapId) {
            window.location.href = `/education/roadmap/${roadmapId}`;
          }
        }}
        vsCodeTheme={vsCodeTheme}
      />
    );
  }

  return (
    <div className="roadmap-content-view">
      
      
      {/* 콘텐츠 영역 */}
      <div className="content-container" ref={contentRef}>
        <MarkdownRenderer content={contentData.content} />
      </div>

      {/* 네비게이션 버튼 */}
      <ContentNavigation
        roadmapId={roadmapId}
        contentId={realContentId}
        getNodeTitleForUrl={getNodeTitleForUrl}
        getNextContentId={getNextContentId}
        getPrevContentId={getPrevContentId}
        vsCodeTheme={vsCodeTheme}
      />
    </div>
  );
};

export default RoadmapContentView; 