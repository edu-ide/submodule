import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import pythonContent from './data/pythonRoadmapContent.json';
import { useDispatch } from 'react-redux';
import { setNodeProgress } from '../../../redux/roadmapSlice';

interface Resource {
  title: string;
  url: string;
}

interface Challenge {
  title: string;
  description: string;
}

interface ContentData {
  title: string;
  description: string;
  content: string;
  resources?: Resource[];
  challenges?: Challenge[];
}

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

  useEffect(() => {
    setIsLoading(true);
    try {
      if (!contentId) {
        throw new Error('콘텐츠 ID가 없습니다.');
      }
      
      // 콘텐츠 데이터가 있는지 확인
      console.log('전체 콘텐츠 데이터:', pythonContent);
      
      // 문자열 키로 데이터 접근
      const content = pythonContent[contentId as string];
      
      if (!content) {
        throw new Error(`ID가 ${contentId}인 콘텐츠를 찾을 수 없습니다.`);
      }
      
      console.log('선택된 콘텐츠:', content);
      setContentData(content as ContentData);
      setError(null);
    } catch (err) {
      console.error('콘텐츠 로드 오류:', err);
      setError(err instanceof Error ? err.message : '콘텐츠를 불러오는 중 오류가 발생했습니다.');
      setContentData(null);
    } finally {
      setIsLoading(false);
    }
  }, [contentId]);

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

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!contentData) return <div>콘텐츠를 찾을 수 없습니다.</div>;

  return (
    <div className="roadmap-content-view">
      <div className="roadmap-content-header">
 
        <h1>{contentData.title}</h1>
        <p className="description">{contentData.description}</p>
      </div>
      
      <div className="roadmap-content-body">
        <div className="markdown-content">
          <Markdown>{contentData.content}</Markdown>
        </div>
        
        {contentData.resources && contentData.resources.length > 0 && (
          <div className="resources-section">
            <h2>참고 자료</h2>
            <ul>
              {contentData.resources.map((resource, index) => (
                <li key={index}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {contentData.challenges && contentData.challenges.length > 0 && (
          <div className="challenges-section">
            <h2>도전 과제</h2>
            <ul>
              {contentData.challenges.map((challenge, index) => (
                <li key={index}>
                  <h3>{challenge.title}</h3>
                  <p>{challenge.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button onClick={handleCompleteContent}>
        학습 완료 표시하기
      </button>
      
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