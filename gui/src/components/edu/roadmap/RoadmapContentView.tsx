import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useDispatch } from 'react-redux';
import { setNodeProgress } from '../../../redux/roadmapSlice';
import { setBottomMessage, setHeaderInfo } from '../../../redux/slices/uiStateSlice';
import { VscCopy, VscOpenPreview, VscFile, VscCommentDiscussion, VscPlay, VscClearAll } from 'react-icons/vsc';
import RoadmapContentSection from './RoadmapContentSection';
import RoadmapContentNavigator from './RoadmapContentNavigator';
import { loadMarkdownContent } from '../../../utils/markdownLoader';
import { useEffect as useHighlightEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // VS Code 스타일 테마
import { fetchRoadmapContent } from './constants';
import { IdeMessengerContext } from '@/context/IdeMessenger';
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
        
        // 헤더 정보 업데이트
        dispatch(setHeaderInfo({
          title: contentInfo.title,
          description: contentInfo.description
        }));
        
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

  // 이전 콘텐츠로 이동
  const handlePrevContent = async () => {
    try {
      const roadmapContent = await fetchRoadmapContent();
      const currentOrder = contentData?.order;
      
      // 현재 순서 이전의 콘텐츠 찾기
      const prevContent = Object.entries(roadmapContent.roadmap)
        .reverse()
        .find(([_, content]) => content.order < currentOrder);
      
      if (prevContent) {
        const [prevContentId] = prevContent;
        navigate(`/education/roadmap/${roadmapId}/content/${prevContentId}`);
      } else {
        dispatch(setBottomMessage(
          <div>첫 번째 콘텐츠입니다.</div>
        ));
      }
    } catch (error) {
      console.error('이전 콘텐츠 조회 실패:', error);
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
      <div className="content-container">
        <Markdown
          children={contentData.content}
          components={{
            code: renderCodeBlock
          }}
        />
      </div>

      <div className="navigation-buttons">
        <div className="left-buttons">
          <button onClick={handleBack} className="back-button">
            이전으로
          </button>
          <button onClick={handlePrevContent} className="nav-button">
            ◀ 이전 콘텐츠
          </button>
        </div>
        <div className="right-buttons">
          <button onClick={handleNextContent} className="nav-button">
            다음 콘텐츠 ▶
          </button>
          <button onClick={handleCompleteContent} className="complete-button">
            완료
          </button>
        </div>
      </div>

      <style jsx>{`
        .roadmap-content-view {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .content-container {
          flex: 1;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          overflow-y: auto;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .left-buttons,
        .right-buttons {
          display: flex;
          gap: 12px;
        }
        
        .back-button,
        .nav-button,
        .complete-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .back-button {
          background: #f0f0f0;
          color: #666666;
        }
        
        .nav-button {
          background: #0066cc;
          color: white;
        }
        
        .complete-button {
          background: #28a745;
          color: white;
        }
        
        .back-button:hover {
          background: #e0e0e0;
        }
        
        .nav-button:hover {
          background: #0052a3;
        }
        
        .complete-button:hover {
          background: #218838;
        }

        :global(code) {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
          color: #333333;
          border: 1px solid #e0e0e0;
        }

        :global(pre) {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          border: 1px solid #e0e0e0;
        }

        :global(h2) {
          font-size: 1.8em;
          margin: 1.8em 0 1em;
          padding-bottom: 0.5em;
          border-bottom: 2px solid #f0f0f0;
          color: #1a1a1a;
          font-weight: 600;
        }

        :global(h3) {
          font-size: 1.4em;
          margin: 1.5em 0 1em;
          color: #1a1a1a;
          font-weight: 600;
        }

        :global(p) {
          margin: 1em 0;
          line-height: 1.8;
          color: #333333;
        }

        :global(ul), :global(ol) {
          margin: 1em 0;
          padding-left: 2em;
          color: #333333;
        }

        :global(li) {
          margin: 0.7em 0;
          line-height: 1.6;
        }

        :global(a) {
          color: #0066cc;
          text-decoration: none;
        }

        :global(a:hover) {
          text-decoration: underline;
        }

        :global(strong) {
          color: #1a1a1a;
          font-weight: 600;
        }

        :global(blockquote) {
          margin: 1em 0;
          padding: 0.5em 1em;
          border-left: 4px solid #e0e0e0;
          background: #f8f9fa;
          color: #666666;
        }

        :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }

        :global(hr) {
          border: none;
          border-top: 2px solid #f0f0f0;
          margin: 2em 0;
        }

        .error-message {
          color: #dc3545;
          padding: 1em;
          background: #fff5f5;
          border-radius: 8px;
          border: 1px solid #ffebeb;
        }

        .error-container {
          text-align: center;
          padding: 2em;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default RoadmapContentView; 