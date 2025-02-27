import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLearningContent, generateLearningContent } from './utils';
import { LearningContentViewProps } from './types';

const LearningContentView: React.FC<LearningContentViewProps> = ({ content: initialContent, nodeData, onBack }) => {
  const { roadmapId, nodeId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('introduction');
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!nodeId) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const fetchedContent = getLearningContent(nodeId) || generateLearningContent({
        title: nodeId,
        description: '노드 설명',
        status: 'in-progress',
        column: '0'
      });
      
      setContent(fetchedContent);
      setIsLoading(false);
    }, 600);
  }, [nodeId]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return <div className="loading">콘텐츠를 불러오는 중...</div>;
  }

  return (
    <div className="learning-content-container">
      {/* 뒤로가기 버튼 추가 */}
      <div className="learning-header">
        <button className="back-button" onClick={() => navigate(`/education/roadmap/${roadmapId}`)}>
          <span className="codicon codicon-arrow-left"></span>
          로드맵으로 돌아가기
        </button>
        <h2 className="content-title">{content?.title}</h2>
      </div>

      {/* 탭 메뉴 */}
      <div className="content-tabs">
        <button 
          className={`tab-button ${activeTab === 'introduction' ? 'active' : ''}`}
          onClick={() => handleTabChange('introduction')}
        >
          소개
        </button>
        <button 
          className={`tab-button ${activeTab === 'theory' ? 'active' : ''}`}
          onClick={() => handleTabChange('theory')}
        >
          이론
        </button>
        <button 
          className={`tab-button ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => handleTabChange('examples')}
        >
          예제
        </button>
        <button 
          className={`tab-button ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => handleTabChange('practice')}
        >
          실습
        </button>
        <button 
          className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => handleTabChange('quiz')}
        >
          퀴즈
        </button>
        <button 
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => handleTabChange('resources')}
        >
          참고자료
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="content-body">
        {activeTab === 'introduction' && (
          <div className="content-section">
            <p>{content?.introduction}</p>
          </div>
        )}
        
        {activeTab === 'theory' && (
          <div className="content-section markdown-content">
            <div dangerouslySetInnerHTML={{ __html: content?.theory }}></div>
          </div>
        )}
        
        {activeTab === 'examples' && (
          <div className="content-section">
            {content?.examples.map((example, index) => (
              <div key={index} className="example-item">
                <h3>{example.title}</h3>
                <pre className="code-block">
                  <code>{example.code}</code>
                </pre>
                <p>{example.explanation}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'practice' && (
          <div className="content-section">
            <h3>실습 문제</h3>
            <p>{content?.practice.question}</p>
            
            <div className="hints-section">
              <h4>힌트</h4>
              <ul>
                {content?.practice.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
            
            <details>
              <summary>정답 보기</summary>
              <pre className="code-block solution">
                <code>{content?.practice.solution}</code>
              </pre>
            </details>
          </div>
        )}
        
        {activeTab === 'quiz' && (
          <div className="content-section">
            {content?.quiz.map((quizItem, index) => (
              <div key={index} className="quiz-item">
                <h3>문제 {index + 1}</h3>
                <p>{quizItem.question}</p>
                
                <div className="quiz-options">
                  {quizItem.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="quiz-option">
                      <input 
                        type="radio" 
                        id={`quiz-${index}-option-${optionIndex}`} 
                        name={`quiz-${index}`} 
                      />
                      <label htmlFor={`quiz-${index}-option-${optionIndex}`}>{option}</label>
                    </div>
                  ))}
                </div>
                
                <details>
                  <summary>정답과 설명</summary>
                  <div className="quiz-answer">
                    <p><strong>정답:</strong> {quizItem.options[quizItem.answer]}</p>
                    <p>{quizItem.explanation}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div className="content-section">
            <h3>참고 자료</h3>
            <ul className="resources-list">
              {content?.resources.map((resource, index) => (
                <li key={index} className={`resource-item ${resource.type}`}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.type === 'video' && <span className="resource-icon">🎬</span>}
                    {resource.type === 'article' && <span className="resource-icon">📄</span>}
                    {resource.type === 'tutorial' && <span className="resource-icon">📚</span>}
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        .learning-content-container {
          padding: 20px;
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
          height: 100vh;
          overflow-y: auto;
        }
        
        .learning-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--vscode-panel-border);
          padding-bottom: 15px;
        }
        
        .back-button {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          color: var(--vscode-button-foreground);
          background-color: var(--vscode-button-background);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 15px;
          transition: background-color 0.2s;
        }
        
        .back-button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
        
        .back-button span {
          margin-right: 6px;
        }
        
        .content-title {
          font-size: 24px;
          margin: 0;
        }
        
        .content-tabs {
          display: flex;
          border-bottom: 1px solid var(--vscode-panel-border);
          margin-bottom: 20px;
        }
        
        .tab-button {
          padding: 10px 15px;
          background: none;
          border: none;
          color: var(--vscode-editor-foreground);
          cursor: pointer;
          font-size: 14px;
          position: relative;
          transition: color 0.2s;
        }
        
        .tab-button:hover {
          color: var(--vscode-textLink-foreground);
        }
        
        .tab-button.active {
          color: var(--vscode-textLink-activeForeground, var(--vscode-textLink-foreground));
          font-weight: 500;
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--vscode-textLink-activeForeground, var(--vscode-textLink-foreground));
        }
        
        .content-body {
          padding: 15px 0;
        }
        
        .content-section {
          line-height: 1.6;
        }
        
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
        }
        
        .markdown-content h1 {
          font-size: 2em;
          border-bottom: 1px solid var(--vscode-panel-border);
          padding-bottom: 0.3em;
        }
        
        .markdown-content h2 {
          font-size: 1.5em;
          border-bottom: 1px solid var(--vscode-panel-border);
          padding-bottom: 0.3em;
        }
        
        .code-block {
          background-color: var(--vscode-editor-inactiveSelectionBackground);
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
          font-family: var(--vscode-editor-font-family, monospace);
          font-size: var(--vscode-editor-font-size, 14px);
          line-height: 1.5;
          margin: 16px 0;
        }
        
        .example-item,
        .quiz-item {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .example-item:last-child,
        .quiz-item:last-child {
          border-bottom: none;
        }
        
        .hints-section {
          margin: 20px 0;
          padding: 15px;
          background-color: var(--vscode-editor-inactiveSelectionBackground);
          border-radius: 4px;
        }
        
        .hints-section h4 {
          margin-top: 0;
          margin-bottom: 10px;
        }
        
        .quiz-options {
          margin: 15px 0;
        }
        
        .quiz-option {
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        
        .quiz-option input {
          margin-right: 10px;
        }
        
        details {
          margin: 16px 0;
          padding: 10px;
          background-color: var(--vscode-editor-inactiveSelectionBackground);
          border-radius: 4px;
        }
        
        summary {
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .quiz-answer {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--vscode-panel-border);
        }
        
        .resources-list {
          list-style-type: none;
          padding: 0;
        }
        
        .resource-item {
          margin-bottom: 12px;
        }
        
        .resource-item a {
          display: flex;
          align-items: center;
          color: var(--vscode-textLink-foreground);
          text-decoration: none;
        }
        
        .resource-item a:hover {
          text-decoration: underline;
        }
        
        .resource-icon {
          margin-right: 8px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default LearningContentView; 