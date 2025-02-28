import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useDispatch } from 'react-redux';
import { setNodeProgress } from '../../../redux/roadmapSlice';
import { VscCopy, VscOpenPreview, VscFile, VscCommentDiscussion } from 'react-icons/vsc';
import RoadmapContentSection from './RoadmapContentSection';
import RoadmapContentNavigator from './RoadmapContentNavigator';
import { loadMarkdownContent } from '../../../utils/markdownLoader';
import { useEffect as useHighlightEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // VS Code 스타일 테마
import { fetchRoadmapContent } from './constants';
import { IdeMessengerContext } from '@/context/IdeMessenger';

interface ContentData {
  title: string;
  description: string;
  content: string;
}

// 코드 블록 컴포넌트 수정
const CodeBlock = ({ language, value }: { language: string; value: string }) => {
    const ideMessenger = useContext(IdeMessengerContext); 
  const dispatch = useDispatch();
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
      .then(() => alert('코드가 복사되었습니다!'))
      .catch(err => console.error('복사 실패:', err));
  };

  const handlePasteToEditor = () => {
    if (window.vscode) {
      // 파일명 생성 (현재 시간 기반)
      const timestamp = new Date().getTime();
      const fileName = `code-snippet-${timestamp}.py`;
      
      // memFS에 파일 생성 및 내용 삽입
      window.vscode.postMessage({
        command: 'createFile',
        filePath: `/mnt/memFS/${fileName}`,
        content: value
      });
      
      // 생성된 파일 열기
      window.vscode.postMessage({
        command: 'openFile',
        filePath: `/mnt/memFS/${fileName}`
      });
      
 
    } else {
      alert('VS Code 웹 에디터 환경에서만 사용 가능한 기능입니다.');
    }
  };

  // 학습 도우미 전송 핸들러 추가
  const handleSendToHelper = () => {
    ideMessenger?.post('addEducationContextToChat', {
      content: {
        type: "doc",
        content: [{
          type: "educationBlock",
          attrs: {
            title: `코드 분석 요청 - ${new Date().toLocaleString()}`,
            content: value,
            category: "roadmap",
            markdown: `\`\`\`${language}\n${value}\n\`\`\``
          }
        }]
      },
      shouldRun: true,
      prompt: "이 코드를 분석하고 설명해주세요"
    });

  };
  return (
    <div style={{ 
      position: 'relative',
      margin: '16px 0',
      fontSize: '1.1em'
    }}>
      <pre style={{
        position: 'relative',
        padding: '20px',
        backgroundColor: 'var(--vscode-editor-background)',
        borderRadius: '6px',
        overflowX: 'auto',
        border: '1px solid var(--vscode-editor-lineHighlightBorder)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '12px',
          display: 'flex',
          gap: '4px'
        }}>
          <button
            onClick={handleCopy}
            style={{
              background: 'var(--vscode-button-background)',
              color: 'var(--vscode-button-foreground)',
              border: 'none',
              borderRadius: '4px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            title="코드 복사"
          >
            <VscCopy size={18} />
          </button>
          <button
            onClick={handlePasteToEditor}
            style={{
              background: 'var(--vscode-editorInfo-foreground)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            title="메모리 파일시스템에 생성"
          >
            <VscFile size={18} />
          </button>
          <button
            onClick={handleSendToHelper}
            style={{
              background: 'var(--vscode-editorInfo-foreground)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            title="학습 도우미에게 전송"
          >
            <VscCommentDiscussion size={18} />
          </button>
        </div>
        <code
          className={`hljs ${language}`}
          style={{
            display: 'block',
            paddingRight: '120px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            lineHeight: '1.6',
            fontSize: '1em',
            color: 'var(--vscode-editor-foreground)'
          }}
          dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(value).value }}
        />
      </pre>
    </div>
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