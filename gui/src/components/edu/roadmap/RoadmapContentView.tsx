import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useDispatch } from 'react-redux';
import { setNodeProgress } from '../../../redux/roadmapSlice';
import { VscCopy, VscOpenPreview, VscFile, VscCommentDiscussion, VscPlay, VscClearAll } from 'react-icons/vsc';
import RoadmapContentSection from './RoadmapContentSection';
import RoadmapContentNavigator from './RoadmapContentNavigator';
import { loadMarkdownContent } from '../../../utils/markdownLoader';
import { useEffect as useHighlightEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // VS Code 스타일 테마
import { fetchRoadmapContent } from './constants';
import { IdeMessengerContext } from '@/context/IdeMessenger';
import { setBottomMessage } from '@/redux/slices/uiStateSlice';
import CodeBlock from './CodeBlock';

interface ContentData {
  title: string;
  description: string;
  content: string;
  order: string;
  prerequisites: string[];
}

interface Section {
  title: string;
  content: string;
  order: string;
}

const RoadmapContentView: React.FC = () => {
  const params = useParams();
  const { roadmapId, contentId } = params;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'parsed' | 'scroll'>('parsed');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Markdown 컴포넌트의 코드 블록 렌더링
  const renderCodeBlock = ({className, children, inline}: {className?: string, children: any, inline?: boolean}) => {
    // 인라인 코드이거나 언어가 지정되지 않은 경우 기본 렌더링
    if (inline || !className) {
      return <code className={className}>{children}</code>;
    }
    
    const code = String(children).trim();
    const lang = className.replace('language-', '') || 'text';
    
    return (
      <CodeBlock 
        language={lang}
        value={code}
      />
    );
  };

  // 데이터 검증 함수 추가
  const validateContentData = (data: any): data is ContentData => {
    return (
      typeof data === 'object' &&
      typeof data.title === 'string' &&
      typeof data.description === 'string' &&
      typeof data.content === 'string' &&
      typeof data.order === 'string' &&
      Array.isArray(data.prerequisites)
    );
  };

  console.log('현재 경로 매개변수:', params);
  console.log('로드맵 ID:', roadmapId);
  console.log('콘텐츠 ID:', contentId);

  // 마크다운 콘텐츠를 섹션으로 파싱하는 함수
  const parseSections = (content: string): Section[] => {
    const lines = content.split('\n');
    const parsedSections: Section[] = [];
    let currentSection: Section = {
      title: '소개',  // 첫 섹션의 기본 제목
      content: '',
      order: '1'
    };
    let currentContent: string[] = [];
    let foundFirstSection = false;

    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        if (foundFirstSection) {
          // 이전 섹션 저장
          parsedSections.push({
            ...currentSection,
            content: currentContent.join('\n')
          });
          currentContent = [];
        } else {
          foundFirstSection = true;
        }
        
        // 새 섹션 시작
        currentSection = {
          title: line.replace('## ', ''),
          content: '',
          order: String(parsedSections.length + 1)
        };
      } else {
        currentContent.push(line);
      }
    });

    // 마지막 섹션 저장
    if (currentContent.length > 0) {
      parsedSections.push({
        ...currentSection,
        content: currentContent.join('\n')
      });
    }

    console.log('파싱된 섹션들:', parsedSections);
    return parsedSections;
  };

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      if (!contentId) {
        setIsLoading(false);
        setError('콘텐츠 ID가 없습니다');
        return;
      }
      
      try {
        console.log('콘텐츠 로드 시작 - contentId:', contentId);
        const roadmapContent = await fetchRoadmapContent();
        console.log('가져온 roadmapContent:', roadmapContent);
        
        if (!roadmapContent || !roadmapContent.roadmap) {
          throw new Error('로드맵 콘텐츠 데이터가 비어있습니다.');
        }

        const contentInfo = roadmapContent.roadmap[contentId];
        console.log('찾은 contentInfo:', contentInfo);
        
        if (!contentInfo) {
          throw new Error(`콘텐츠 ID(${contentId})에 해당하는 데이터를 찾을 수 없습니다.`);
        }

        if (!validateContentData(contentInfo)) {
          console.error('잘못된 콘텐츠 데이터 형식:', contentInfo);
          throw new Error('콘텐츠 데이터 형식이 올바르지 않습니다.');
        }
        
        setContentData(contentInfo);
        setSections(parseSections(contentInfo.content));
        setError(null);
        
      } catch (error) {
        console.error('콘텐츠 로드 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        setError(`콘텐츠를 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
        dispatch(setBottomMessage(
          <div>
            콘텐츠 로드 실패
            <br />
            ID: {contentId}
            <br />
            오류: {errorMessage}
          </div>
        ));
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [contentId, dispatch]);

  const handleBack = () => {
    navigate(`/education/roadmap/${roadmapId}`);
  };

  const handleCompleteContent = () => {
    if (contentId) {
      dispatch(setNodeProgress({ 
        id: contentId, 
        status: 'completed' 
      }));
      navigate(`/education/roadmap/${roadmapId}`);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleViewModeChange = (mode: 'parsed' | 'scroll') => {
    setViewMode(mode);
    // 모드 변경 시 섹션 인덱스 초기화
    setCurrentSectionIndex(0);
  };

  // 다음 콘텐츠로 이동
  const handleNextContent = async () => {
    try {
      const roadmapContent = await fetchRoadmapContent();
      const currentOrder = contentData?.order;
      
      // 현재 순서 다음의 콘텐츠 찾기
      const nextContent = Object.entries(roadmapContent.roadmap)
        .find(([_, content]) => content.order > currentOrder);
      
      if (nextContent) {
        const [nextContentId] = nextContent;
        navigate(`/education/roadmap/${roadmapId}/content/${nextContentId}`);
      } else {
        dispatch(setBottomMessage(
          <div>마지막 콘텐츠입니다.</div>
        ));
      }
    } catch (error) {
      console.error('다음 콘텐츠 조회 실패:', error);
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!contentData) return (
    <div className="error-container">
      <h2>⚠️ 콘텐츠 로드 실패</h2>
      <p>문제가 지속되면 관리자에게 문의해주세요</p>
      <button onClick={handleBack}>돌아가기</button>
    </div>
  );

  return (
    <div className="roadmap-content-view">
      <div className="roadmap-content-header">
        <h1>{contentData.title}</h1>
        <p className="description">{contentData.description}</p>
      </div>
      
      <div className="content-container">
        <Markdown
          children={contentData.content}
          components={{
            code: renderCodeBlock
          }}
        />
      </div>

      <div className="navigation-buttons">
        <button onClick={handleBack} className="back-button">
          이전으로
        </button>
        <div className="right-buttons">
          <button onClick={handleNextContent} className="next-button">
            다음 콘텐츠
          </button>
          <button onClick={handleCompleteContent} className="complete-button">
            완료
          </button>
        </div>
      </div>

      <style jsx>{`
        .roadmap-content-view {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
          font-family: var(--vscode-font-family);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .roadmap-content-header {
          margin-bottom: 30px;
        }
        
        .content-container {
          flex: 1;
          background: var(--vscode-editor-background);
          padding: 20px;
          border-radius: 4px;
          overflow-y: auto;
        }
        
        h1 {
          font-size: 2em;
          margin-bottom: 10px;
          color: var(--vscode-editor-foreground);
        }
        
        .description {
          font-size: 1.2em;
          color: var(--vscode-descriptionForeground);
          margin-bottom: 20px;
        }
        
        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding: 10px;
          background: var(--vscode-editor-background);
          border-radius: 4px;
        }
        
        .right-buttons {
          display: flex;
          gap: 10px;
        }
        
        .back-button,
        .next-button,
        .complete-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .back-button {
          background: var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
        }
        
        .next-button {
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }
        
        .complete-button {
          background: var(--vscode-statusBarItem-remoteBackground);
          color: var(--vscode-statusBarItem-remoteForeground);
        }
        
        .back-button:hover,
        .next-button:hover,
        .complete-button:hover {
          opacity: 0.9;
        }

        :global(code) {
          background: var(--vscode-textBlockQuote-background);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: var(--vscode-editor-font-family);
        }

        :global(pre) {
          background: var(--vscode-textBlockQuote-background);
          padding: 16px;
          border-radius: 4px;
          overflow-x: auto;
        }

        :global(h2) {
          font-size: 1.5em;
          margin: 1.5em 0 1em;
          padding-bottom: 0.5em;
          border-bottom: 1px solid var(--vscode-panel-border);
        }

        :global(h3) {
          font-size: 1.2em;
          margin: 1em 0;
        }

        :global(p) {
          margin: 1em 0;
          line-height: 1.6;
        }

        :global(ul), :global(ol) {
          margin: 1em 0;
          padding-left: 2em;
        }

        :global(li) {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
};

export default RoadmapContentView; 