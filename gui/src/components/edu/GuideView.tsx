import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CurriculumItem } from '../../types/curriculum';
import { CURRICULUM_DATA } from '../../data/curriculumData';
import type { Components } from 'react-markdown';
import React from 'react';
interface GuideViewProps {
  tutorialId?: string;
  onClose: () => void;
}

function GuideView({ tutorialId, onClose }: GuideViewProps) {
  console.log('GuideView rendering with tutorialId:', tutorialId);
  console.log('Available tutorials:', CURRICULUM_DATA);

  const [currentStep, setCurrentStep] = React.useState(0);
  const [evaluationStarted, setEvaluationStarted] = React.useState(false);
  const [remainingTime, setRemainingTime] = React.useState<number | null>(null);
  const [answers, setAnswers] = React.useState<{ [key: string]: string }>({});
  const [feedback, setFeedback] = React.useState<{ score: number; comments: string[]; suggestions: string[]; } | null>(null);

  const tutorial = React.useMemo(() => {
    if (!tutorialId) return null;
    const found = CURRICULUM_DATA.find(item => item.id === tutorialId);
    console.log('Found tutorial:', found);
    return found;
  }, [tutorialId]);

  if (!tutorial) {
    console.log('No tutorial found, returning null');
    return null;
  }

  const currentStepData = tutorial.steps[currentStep];
  console.log('Current step data:', currentStepData);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorial.steps.length - 1;

  const handlePrevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNextStep = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStartEvaluation = () => {
    if (currentStepData.codingTask) {
      // 초기 파일들을 메모리 파일시스템에 생성하는 것처럼 시뮬레이션
      console.log('Creating initial files:', currentStepData.codingTask.initialFiles);
      setEvaluationStarted(true);
      setRemainingTime(30 * 60); // 30분
      setFeedback(null);
    }
  };

  const handleSubmitEvaluation = () => {
    // 제출된 파일들을 AI가 평가하는 것처럼 시뮬레이션
    const mockFeedback = {
      score: 85,
      comments: [
        '전반적으로 잘 구현되었습니다.',
        '요구사항의 대부분을 충족했습니다.',
        '코드 구조가 깔끔합니다.'
      ],
      suggestions: [
        '에러 처리를 추가하면 좋을 것 같습니다.',
        '코드 주석을 더 추가하면 좋을 것 같습니다.'
      ]
    };

    setFeedback(mockFeedback);
    setEvaluationStarted(false);
    setRemainingTime(null);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (evaluationStarted && remainingTime !== null && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [evaluationStarted, remainingTime]);

  return (
    <div className="guide-view">
      <style>{`
        .guide-view {
          position: fixed;
          left: 0;
          top: 0;
          width: 100%;
          height: 100vh;
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
          z-index: 1000;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        .guide-view-header {
          padding: 20px;
          border-bottom: 1px solid var(--vscode-panel-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--vscode-editor-background);
        }

        .header-content {
          flex: 1;
        }

        .header-content h2 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--vscode-editor-foreground);
        }

        .step-indicator {
          font-size: 0.9rem;
          color: var(--vscode-descriptionForeground);
          margin-top: 4px;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--vscode-editor-foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 4px;
        }

        .close-button:hover {
          background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .guide-view-content {
          overflow-y: auto;
          padding: 20px;
        }

        .step-title {
          margin: 0 0 20px 0;
          color: var(--vscode-editor-foreground);
        }

        .markdown-content {
          line-height: 1.6;
          color: var(--vscode-editor-foreground);
        }

        .markdown-content pre {
          max-width: 100%;
          overflow-x: auto;
        }

        .guide-view-footer {
          border-top: 1px solid var(--vscode-panel-border);
          padding: 20px;
          background-color: var(--vscode-editor-background);
          padding-bottom: 100px;
        }

        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--vscode-editor-background);
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 9998;
        }

        .nav-button {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 8px 16px;
          border-radius: 3px;
          cursor: pointer;
          min-width: 80px;
          font-size: 14px;
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: var(--vscode-button-secondaryBackground);
        }

        .nav-button:not(:disabled):hover {
          background-color: var(--vscode-button-hoverBackground);
        }

        .step-dots {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--vscode-button-secondaryBackground);
          cursor: pointer;
          border: none;
          padding: 0;
        }

        .step-dot.active {
          background-color: var(--vscode-button-background);
          transform: scale(1.2);
        }

        .step-dot:hover {
          background-color: var(--vscode-button-hoverBackground);
        }

        @media (max-width: 768px) {
          .guide-view {
            width: 100%;
          }

          .nav-button {
            padding: 6px 12px;
            min-width: 70px;
          }
        }

        .evaluation-section {
          margin-top: 2rem;
          padding: 1rem;
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
        }

        .evaluation-button {
          display: block;
          margin: 0 auto;
          font-size: 1rem;
          padding: 12px 24px;
        }

        .evaluation-content {
          margin-top: 1rem;
        }

        .timer {
          text-align: center;
          font-size: 1.2rem;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background-color: var(--vscode-button-secondaryBackground);
          border-radius: 4px;
        }

        .question {
          margin-bottom: 2rem;
        }

        .question h4 {
          margin: 0 0 1rem 0;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .option input[type="radio"] {
          margin: 0;
        }

        textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
          background-color: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          resize: vertical;
        }

        .evaluation-submit {
          display: block;
          margin: 2rem auto 0;
          font-size: 1rem;
          padding: 12px 24px;
        }

        .requirements {
          margin-bottom: 1.5rem;
        }

        .requirements ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        .file-status {
          margin: 1rem 0;
        }

        .file-status ul {
          list-style: none;
          padding: 0;
        }

        .file-status li {
          padding: 0.5rem;
          background: var(--vscode-input-background);
          margin: 0.5rem 0;
          border-radius: 4px;
        }

        .feedback-section {
          background: var(--vscode-input-background);
          padding: 1rem;
          border-radius: 4px;
        }

        .score {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 1rem 0;
          color: var(--vscode-textLink-foreground);
        }

        .feedback-comments, .feedback-suggestions {
          margin: 1rem 0;
        }

        .feedback-comments h5, .feedback-suggestions h5 {
          margin: 0.5rem 0;
        }

        .feedback-comments ul, .feedback-suggestions ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        .draggable-content {
          position: relative;
          cursor: grab;
        }

        .draggable-content:hover::before {
          content: '↓ 챗봇에 끌어다 놓기';
          position: absolute;
          right: 8px;
          top: 8px;
          background-color: var(--vscode-editor-selectionBackground);
          color: var(--vscode-editor-selectionForeground);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          opacity: 0.9;
          z-index: 10;
        }

        .draggable-content:active {
          cursor: grabbing;
        }
      `}</style>
      <div className="guide-view-header">
        <div className="header-content">
          <h2>{tutorial.title}</h2>
          <div className="step-indicator">
            Step {currentStep + 1} of {tutorial.steps.length}
          </div>
        </div>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>
      <div className="guide-view-content">
        <h3 className="step-title">{currentStepData.title}</h3>
        <div className="markdown-content">
          <ReactMarkdown
            components={{
              code: ({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode; }) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div style={{ position: 'relative' }}>
                    <div className="code-actions" style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 10 }}>
                      <button
                        className="add-to-chat-btn"
                        onClick={() => {
                          window.parent.postMessage({
                            type: 'ADD_CONTEXT',
                            context: String(children).replace(/\n$/, ''),
                            category: match[1].toUpperCase()
                          }, '*');
                        }}
                      >
                        학습 도우미에 추가 🤖
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={{
                        ...vscDarkPlus,
                        'pre[class*="language-"]': {
                          ...vscDarkPlus['pre[class*="language-"]'],
                          background: '#1e1e1e',
                        },
                        'pre[class*="language-"] code': {
                          ...vscDarkPlus['pre[class*="language-"] code'],
                          borderSpacing: '0',
                        }
                      }}
                      language={match[1]}
                      PreTag="div"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(children).replace(/\n$/, ''));
                        e.dataTransfer.setData('text/curriculum-code', JSON.stringify({
                          language: match[1],
                          stepTitle: currentStepData.title
                        }));
                      }}
                      customStyle={{
                        padding: '1rem',
                        margin: '1rem 0',
                        borderRadius: '8px',
                        border: '1px solid #30363d',
                        backgroundColor: '#1e1e1e',
                        fontSize: '0.9em',
                        lineHeight: '1.5',
                        overflow: 'auto',
                        cursor: 'grab'
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code
                    className={className}
                    style={{
                      padding: '0.2em 0.4em',
                      borderRadius: '4px',
                      backgroundColor: '#1e1e1e',
                      fontSize: '0.9em'
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p: ({node, children, ...props}) => (
                <p
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', children as string);
                    e.dataTransfer.setData('text/curriculum-content', JSON.stringify({
                      type: 'paragraph',
                      stepTitle: currentStepData.title
                    }));
                  }}
                  style={{cursor: 'grab'}}
                  {...props}
                >
                  {children}
                </p>
              ),
            }}
          >
            {currentStepData.content}
          </ReactMarkdown>
          {currentStepData.codingTask && (
            <div className="evaluation-section">
              <div className="requirements">
                <h4>요구사항:</h4>
                <ul>
                  {currentStepData.codingTask.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              {!evaluationStarted && !feedback ? (
                <button onClick={handleStartEvaluation} className="nav-button evaluation-button">
                  평가 시작하기
                </button>
              ) : evaluationStarted ? (
                <div className="evaluation-content">
                  <div className="timer">
                    남은 시간: {Math.floor(remainingTime! / 60)}:{String(remainingTime! % 60).padStart(2, '0')}
                  </div>
                  <div className="file-status">
                    <h4>작업할 파일:</h4>
                    <ul>
                      {currentStepData.codingTask.expectedFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={handleSubmitEvaluation} className="nav-button evaluation-submit">
                    과제 제출하기
                  </button>
                </div>
              ) : feedback ? (
                <div className="feedback-section">
                  <h4>평가 결과</h4>
                  <div className="score">점수: {feedback.score}점</div>
                  <div className="feedback-comments">
                    <h5>피드백:</h5>
                    <ul>
                      {feedback.comments.map((comment, index) => (
                        <li key={index}>{comment}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="feedback-suggestions">
                    <h5>개선사항:</h5>
                    <ul>
                      {feedback.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <div className="guide-view-footer">
        <div className="navigation-buttons">
          <button
            onClick={handlePrevStep}
            disabled={isFirstStep}
            className="nav-button"
          >
            이전
          </button>
          <div className="step-dots">
            {tutorial.steps.map((_, index) => (
              <span
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
          <button
            onClick={handleNextStep}
            disabled={isLastStep}
            className="nav-button"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuideView;
