import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
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
import { loadPyodide } from 'pyodide';
import { setBottomMessage } from '@/redux/slices/uiStateSlice';
import { initializeCodeBlock } from '../../../redux/codeBlockSlice';
import CodeBlock from './CodeBlock';

interface ContentData {
  title: string;
  description: string;
  content: string;
}

// 코드 블록 ID를 localStorage에 저장하기 위한 키
const BLOCK_IDS_STORAGE_KEY = 'roadmap-code-block-ids';

const RoadmapContentView: React.FC = () => {
  const params = useParams();
  const { roadmapId, contentId } = params;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pyodideState, setPyodideState] = useState<{
    instance: any;
    status: 'loading' | 'ready' | 'error';
  }>({ instance: null, status: 'loading' });
  const [initStatus, setInitStatus] = useState('로드 중...');

  // 코드 블록 ID 매핑을 위한 ref 사용
  const blockIdsRef = useRef<Map<string, string>>(new Map());
  const codeBlockCounterRef = useRef<number>(0);

  // 컴포넌트 마운트 시 저장된 블록 ID 복원
  useEffect(() => {
    if (!contentId) return;
    
    try {
      const savedBlockIds = localStorage.getItem(`${BLOCK_IDS_STORAGE_KEY}-${contentId}`);
      if (savedBlockIds) {
        const parsedBlockIds = JSON.parse(savedBlockIds);
        blockIdsRef.current = new Map(Object.entries(parsedBlockIds));
        // 저장된 ID 중 가장 큰 인덱스 값을 찾아서 카운터 초기화
        const maxIndex = Math.max(...Array.from(blockIdsRef.current.values())
          .map(id => parseInt(id.split('-').pop() || '0')));
        codeBlockCounterRef.current = maxIndex + 1;
      } else {
        blockIdsRef.current = new Map();
        codeBlockCounterRef.current = 0;
      }
    } catch (error) {
      console.error('블록 ID 복원 실패:', error);
      blockIdsRef.current = new Map();
      codeBlockCounterRef.current = 0;
    }
  }, [contentId]);

  // 블록 ID 저장 함수
  const saveBlockIds = useCallback(() => {
    if (!contentId) return;
    
    try {
      const blockIdsObject = Object.fromEntries(blockIdsRef.current);
      localStorage.setItem(`${BLOCK_IDS_STORAGE_KEY}-${contentId}`, 
        JSON.stringify(blockIdsObject));
    } catch (error) {
      console.error('블록 ID 저장 실패:', error);
    }
  }, [contentId]);

  // 코드 블록 ID 생성 함수
  const getBlockId = useCallback((code: string) => {
    if (!contentId) return `temp-block-${Date.now()}`;
    
    const codeKey = `${contentId}-${code.slice(0, 50)}`;
    if (!blockIdsRef.current.has(codeKey)) {
      const blockIndex = codeBlockCounterRef.current++;
      const newBlockId = `${contentId}-block-${blockIndex}`;
      blockIdsRef.current.set(codeKey, newBlockId);
      saveBlockIds();
    }
    return blockIdsRef.current.get(codeKey)!;
  }, [contentId, saveBlockIds]);

  // Markdown 컴포넌트의 코드 블록 렌더링
  const renderCodeBlock = useCallback(({className, children}: {className?: string, children: any}) => {
    const code = String(children).trim();
    const blockId = getBlockId(code);
    const lang = className?.replace('language-', '') || 'text';
    
    return (
      <CodeBlock 
        language={lang}
        value={code}
        blockId={blockId}
        pyodideState={pyodideState}
      />
    );
  }, [getBlockId, pyodideState]);

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

  useEffect(() => {
    let isMounted = true;
    const initPyodide = async () => {
      try {
        setPyodideState(prev => ({ ...prev, status: 'loading' }));
        
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.3/full/",
          stdout: console.log,
          stderr: console.error
        });
        
        await pyodideInstance.loadPackage(["micropip", "ssl", "pyodide-http"]);
        
        if (isMounted) {
          setPyodideState({
            instance: pyodideInstance,
            status: 'ready'
          });
          dispatch(setBottomMessage(<div>Python 환경 준비 완료 🎉</div>));
        }
        
      } catch (error) {
        if (isMounted) {
          setPyodideState(prev => ({ ...prev, status: 'error' }));
          dispatch(setBottomMessage(<div>초기화 실패: {error instanceof Error ? error.message : '네트워크 오류'}</div>));
        }
      }
    };

    if (typeof WebAssembly === 'undefined' || !WebAssembly.validate) {
      dispatch(setBottomMessage(<div>이 브라우저는 WebAssembly를 지원하지 않습니다 (버전 0.27.3 요구)</div>));
      return;
    }

    initPyodide();

    return () => {
      isMounted = false;
      if (pyodideState.instance) {
        pyodideState.instance.runPython('import sys; sys.modules.clear()');
      }
    };
  }, [dispatch]);

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
            code: renderCodeBlock
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
      `}</style>
    </div>
  );
};

export default RoadmapContentView; 