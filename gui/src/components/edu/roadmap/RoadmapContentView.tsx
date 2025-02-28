import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useDispatch } from 'react-redux';
import { setNodeProgress } from '../../../redux/roadmapSlice';
import { VscCopy, VscOpenPreview } from 'react-icons/vsc';
import RoadmapContentSection from './RoadmapContentSection';
import RoadmapContentNavigator from './RoadmapContentNavigator';
import { loadMarkdownContent } from '../../../utils/markdownLoader';
import { useEffect as useHighlightEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // VS Code 스타일 테마
import { setBottomMessage } from '../../../redux/slices/uiStateSlice';
import { fetchRoadmapContent } from './constants';

interface ContentData {
  title: string;
  description: string;
  content: string;
}

// 코드 블록 컴포넌트 추가
const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  return (
    <pre>
      <code
        className={`hljs ${language}`}
        dangerouslySetInnerHTML={{
          __html: hljs.highlightAuto(value).value,
        }}
      />
    </pre>
  );
};

const RoadmapContentView: React.FC = () => {
  const params = useParams();
  const { roadmapId, contentId } = params;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log('현재 경로 매개변수:', params);
  console.log('로드맵 ID:', roadmapId);
  console.log('콘텐츠 ID:', contentId);

  // 데이터 검증 함수 추가
  const validateContentData = (data: any): boolean => {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.title === 'string' &&
      typeof data.description === 'string' &&
      typeof data.content === 'string'
    );
  };

  // Highlight.js 초기화
  useHighlightEffect(() => {
    hljs.configure({
      languages: ['python', 'bash', 'javascript', 'typescript', 'json'],
    });
    hljs.highlightAll();
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      if (!contentId) {
        setIsLoading(false);
        setError('콘텐츠 ID가 없습니다');
        return;
      }
      
      try {
        const roadmapContent = await fetchRoadmapContent();
        const contentInfo = roadmapContent[contentId];
        
        if (!contentInfo) {
          setIsLoading(false);
          setError('유효하지 않은 콘텐츠 ID입니다');
          return;
        }
        
        const contentPath = contentInfo.contentFile;
        const markdownContent = await loadMarkdownContent(contentPath);
        
        setContentData({
          title: contentInfo.title,
          description: contentInfo.description,
          content: markdownContent || '# 기본 콘텐츠\n콘텐츠를 불러올 수 없습니다'
        });
        setError(null);
        
      } catch (error) {
        console.error('Content load error:', error);
        setError(`콘텐츠 로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        setContentData({
          title: '임시 제목',
          description: '임시 설명',
          content: '# 임시 콘텐츠\n문제가 발생했습니다. 관리자에게 문의해주세요.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [contentId, dispatch]);

  const handleBack = () => {
    navigate(`/education/roadmap/${roadmapId}`);
  };

  // 콘텐츠 완료 처리 함수
  const handleCompleteContent = () => {
    if (contentId) {
      dispatch(setNodeProgress({ 
        id: contentId, 
        status: 'completed' 
      }));
      // 완료 후 로드맵으로 돌아가기
      navigate(`/education/roadmap/${roadmapId}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('클립보드에 복사되었습니다!');
      })
      .catch(err => {
        console.error('복사 실패:', err);
      });
  };

  const sendToEditor = (content: string) => {
    if (window.vscode) {
      window.vscode.postMessage({
        command: 'insertCode',
        text: content
      });
    } else {
      alert('VS Code 에디터에서만 사용 가능한 기능입니다.');
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
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
      
      <RoadmapContentSection title="학습 내용">
        <Markdown
          children={contentData.content}
          components={{
            code: ({ className, children }) => (
              <CodeBlock 
                language={className?.replace('language-', '')} 
                value={String(children)} 
              />
            )
          }}
        />
      </RoadmapContentSection>

      <RoadmapContentNavigator 
        onComplete={handleCompleteContent} 
        onBack={handleBack} 
      />

      <style jsx>{`
        .roadmap-content-view {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
          font-family: var(--vscode-font-family);
        }
        
        .roadmap-content-header {
          margin-bottom: 30px;
        }
        
        .back-button {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 20px;
        }
        
        .back-button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
        
        h1 {
          font-size: 2em;
          margin-bottom: 10px;
          color: var(--vscode-editor-foreground);
        }
        
        .description {
          font-size: 1.2em;
          color: var(--vscode-descriptionForeground);
        }
        
        .markdown-content {
          background-color: var(--vscode-editor-background);
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 30px;
        }
        
        .resources-section, .challenges-section {
          margin-top: 30px;
          padding: 15px;
          background-color: var(--vscode-sideBar-background);
          border-radius: 4px;
        }
        
        h2 {
          font-size: 1.5em;
          margin-bottom: 15px;
          color: var(--vscode-editor-foreground);
        }
        
        h3 {
          font-size: 1.2em;
          margin-bottom: 5px;
          color: var(--vscode-editor-foreground);
        }
        
        ul {
          padding-left: 20px;
        }
        
        li {
          margin-bottom: 10px;
        }
        
        a {
          color: var(--vscode-textLink-foreground);
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        .action-icons {
          display: flex;
          gap: 8px;
          margin-top: 5px;
        }
        
        .icon {
          cursor: pointer;
          color: var(--vscode-icon-foreground);
          transition: color 0.2s;
        }
        
        .icon:hover {
          color: var(--vscode-button-hoverBackground);
        }
      `}</style>
    </div>
  );
};

export default RoadmapContentView; 