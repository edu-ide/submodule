import React, { useContext, useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CurriculumItem } from '../../types/curriculum';
import type { Components } from 'react-markdown';
import { IdeMessengerContext } from '@ide/context/IdeMessenger';
import { useWebviewListener } from '../../hooks/useWebviewListener';
// core 프로토콜에서 정의된 타입 임포트
import { EditorContent } from 'core/protocol/types.js';
import axios from 'axios';

interface GuideViewProps {
  tutorialId?: string;
  onClose: () => void;
  isMobileView?: boolean;
  initialStep?: number;
}

// API 응답 타입 정의 추가
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  error: string | null;
}

// CurriculumDocument 타입 정의 (백엔드와 일치)
interface CurriculumDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  students: number;
  progress: number;
  status: string;
  lastUpdated: string;
  source: string;
  sourceId: string;
  type: string;
  uniqueId: string;
  tags: string[];
  steps: {
    title: string;
    content: string;
    completed: boolean;
    codingTask?: {
      prompt: string;
      hint: string;
      initialFiles: {
        name: string;
        content: string;
      }[];
      expectedFiles: string[];
    };
    evaluation?: {
      criteria: string;
      successMessage: string;
      failureMessage: string;
    };
    duration: string;
  }[];
}

function GuideView({ tutorialId, onClose, isMobileView = false, initialStep = 0 }: GuideViewProps) {
  console.log('GuideView 컴포넌트 렌더링 시작');

  const ideMessenger = useContext(IdeMessengerContext);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [evaluationStarted, setEvaluationStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [feedback, setFeedback] = useState<{ score: number; comments: string[]; suggestions: string[]; } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [curriculumData, setCurriculumData] = useState<CurriculumDocument[]>([]);
  const [curriculumList, setCurriculumList] = useState<CurriculumDocument[]>([]);
  const [showList, setShowList] = useState(!tutorialId);

  // 직접 DOM 조작으로 토스트 메시지 표시 (React 렌더링과 독립적)
  const showToastDirectly = useCallback((message: string) => {
    // 기존 토스트 제거
    const existingToast = document.getElementById('direct-toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }

    // 새 토스트 생성 및 추가
    const toast = document.createElement('div');
    toast.id = 'direct-toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '8px 16px';
    toast.style.backgroundColor = 'var(--vscode-editor-background)';
    toast.style.color = 'var(--vscode-editor-foreground)';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);

    // 일정 시간 후 토스트 제거
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 2000);
  }, []);



  // 백엔드에서 커리큘럼 데이터 가져오기
  useEffect(() => {
    const fetchCurriculumData = async () => {
      if (!tutorialId) return;

      setLoading(true);
      setError(null);

      try {
        // API 엔드포인트 호출
        const response = await axios.get<ApiResponse<CurriculumDocument>>(`/api/v1/curriculums/${tutorialId}`);

        if (response.data.success && response.data.data) {
          // 단일 커리큘럼 데이터 설정
          setCurriculumData([response.data.data]);
          console.log('커리큘럼 데이터 로드 완료:', response.data.data);
        } else {
          setError(response.data.message || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('커리큘럼 데이터 로딩 중 오류 발생:', err);
        setError('커리큘럼 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculumData();
  }, [tutorialId]);

  // 전체 커리큘럼 목록 가져오기
  useEffect(() => {
    const fetchCurriculumList = async () => {
      if (tutorialId) return; // 특정 튜토리얼 ID가 있으면 목록을 가져오지 않음

      setLoading(true);
      setError(null);

      try {
        // 전체 커리큘럼 API 엔드포인트 호출
        const response = await axios.get<ApiResponse<CurriculumDocument[]>>('/api/v1/curriculums');

        if (response.data.success && response.data.data) {
          setCurriculumList(response.data.data);
          console.log('커리큘럼 목록 로드 완료:', response.data.data);
        } else {
          setError(response.data.message || '목록을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('커리큘럼 목록 로딩 중 오류 발생:', err);
        setError('커리큘럼 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculumList();
  }, [tutorialId]);

  const tutorial = React.useMemo(() => {
    if (!tutorialId || curriculumData.length === 0) return null;

    // API에서 가져온 데이터를 CurriculumItem 형식으로 변환
    const apiData = curriculumData[0];

    // difficulty 타입 변환 함수
    const convertDifficulty = (diff: string): "beginner" | "intermediate" | "advanced" => {
      switch (diff.toLowerCase()) {
        case "beginner":
        case "초급":
          return "beginner";
        case "intermediate":
        case "중급":
          return "intermediate";
        case "advanced":
        case "고급":
          return "advanced";
        default:
          return "beginner"; // 기본값
      }
    };

    const convertedTutorial: CurriculumItem = {
      id: apiData.id,
      title: apiData.title,
      description: apiData.description,
      category: apiData.category,
      difficulty: convertDifficulty(apiData.difficulty), // 타입 변환
      duration: apiData.duration,
      steps: apiData.steps.map(step => ({
        title: step.title,
        content: step.content,
        codingTask: step.codingTask ? {
          description: step.codingTask.prompt || "", // prompt를 description으로 사용
          requirements: [step.codingTask.prompt],
          initialFiles: Object.fromEntries(
            (step.codingTask.initialFiles || []).map(file => [file.name, file.content])
          ), // 파일 형식 변환
          expectedFiles: step.codingTask.expectedFiles
        } : undefined
      }))
    };

    console.log('변환된 튜토리얼 데이터:', convertedTutorial);
    return convertedTutorial;
  }, [tutorialId, curriculumData]);

  // 특정 튜토리얼 선택 처리
  const handleSelectTutorial = (id: string) => {
    // 선택한 튜토리얼로 이동하는 로직 (URL 변경 등)
    // 예: window.location.href = `/tutorial/${id}`;

    // 또는 상태로 관리
    const selected = curriculumList.find(item => item.id === id);
    if (selected) {
      setCurriculumData([selected]);
      setShowList(false);
    }
  };

  if (loading) {
    return (
      <div className="guide-view-loading">
        <p>커리큘럼 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guide-view-error">
        <p>오류: {error}</p>
        <button onClick={onClose} className="nav-button">닫기</button>
      </div>
    );
  }

  if (showList) {
    return (
      <div className={`guide-view ${isMobileView ? 'mobile-view' : ''}`}>
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
            padding-bottom: 60px;
            position: relative;
          }

          .guide-view-header {
            padding: 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: var(--vscode-editor-background);
          }

          .curriculum-list {
            padding: 20px;
            overflow-y: auto;
          }

          .curriculum-card {
            padding: 16px;
            margin-bottom: 16px;
            border-radius: 8px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            cursor: pointer;
            transition: all 0.2s;
          }

          .curriculum-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .curriculum-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 8px;
          }

          .curriculum-description {
            font-size: 0.9rem;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 12px;
          }

          .curriculum-meta {
            display: flex;
            gap: 12px;
            font-size: 0.8rem;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .difficulty-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 500;
          }

          .difficulty-beginner {
            background-color: #4caf50;
            color: white;
          }

          .difficulty-intermediate {
            background-color: #ff9800;
            color: white;
          }

          .difficulty-advanced {
            background-color: #f44336;
            color: white;
          }
        `}</style>

        {!isMobileView && (
          <div className="guide-view-header">
            <div className="header-content">
              <h2>커리큘럼 목록</h2>
            </div>
            <button onClick={onClose} className="close-button">
              ×
            </button>
          </div>
        )}

        <div className="curriculum-list">
          {curriculumList.length === 0 ? (
            <div className="no-results">
              <p>사용 가능한 커리큘럼이 없습니다.</p>
            </div>
          ) : (
            curriculumList.map(curriculum => (
              <div
                key={curriculum.id}
                className="curriculum-card"
                onClick={() => handleSelectTutorial(curriculum.id)}
              >
                <div className="curriculum-title">{curriculum.title}</div>
                <div className="curriculum-description">{curriculum.description}</div>
                <div className="curriculum-meta">
                  <div className="meta-item">
                    <span className={`difficulty-badge difficulty-${curriculum.difficulty.toLowerCase()}`}>
                      {curriculum.difficulty}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span>⏱️ {curriculum.duration}</span>
                  </div>
                  <div className="meta-item">
                    <span>📚 {curriculum.category}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (!tutorial) {
    console.log('No tutorial found, returning null');
    return null;
  }

  const currentStepData = tutorial.steps[currentStep];
  console.log('Current step data:', currentStepData);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorial.steps.length - 1;

  // addToStudyHelper 함수를 useCallback으로 감싸서 정의
  const addToStudyHelper = useCallback(() => {
    // 완전한 editorContent 형식으로 준비 (TipTap 에디터 형식)
    const editorContent: EditorContent = {
      type: "doc",
      content: [
        {
          type: "educationBlock",
          attrs: {
            title: `${tutorial?.title || ""} - ${currentStepData?.title || ""}`,
            content: currentStepData?.content || "",
            category: tutorial?.category || "",
            markdown: currentStepData?.content || ""
          }
        }
      ]
    };

    console.log('[GuideView] 학습 도우미에 콘텐츠 구조:', JSON.stringify(editorContent));

    // 수정된 데이터 형식으로 전달
    ideMessenger?.post('addEducationContextToChat', {
      content: editorContent,
      shouldRun: true,
      prompt: "이 내용을 분석하고 도움을 주세요"
    });

  }, [currentStepData, tutorial, ideMessenger]);

  // showToast 웹뷰 리스너 복원
  useWebviewListener(
    "showToast",
    async (data) => {
      console.log('[GuideView] 토스트 메시지 수신:', data);
      showToastDirectly(data.message);
    },
    [showToastDirectly]
  );

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

  // initialStep이 변경되면 현재 스텝 업데이트
  React.useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  // 튜토리얼 보기에서 목록으로 돌아가는 버튼 추가
  const handleBackToList = () => {
    setShowList(true);
  };

  return (
    <div className={`guide-view ${isMobileView ? 'mobile-view' : ''}`}>
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
          padding-bottom: 60px;
          position: relative;
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
          position: sticky;
          bottom: 0;
          width: 100%;
          background-color: var(--vscode-editor-background);
          border-top: 1px solid var(--vscode-panel-border);
          padding: 12px 0;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }

        .navigation-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .nav-button {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          min-width: 80px;
          justify-content: center;
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-button:not(:disabled):hover {
          background-color: var(--vscode-button-hoverBackground);
        }

        .prev-button {
          border-radius: 20px 4px 4px 20px;
        }

        .next-button {
          border-radius: 4px 20px 20px 4px;
        }

        .step-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          align-items: center;
        }

        .step-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--vscode-badge-background);
          opacity: 0.5;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }

        .step-dot.active {
          opacity: 1;
          transform: scale(1.2);
          background-color: var(--vscode-button-background);
        }

        .guide-view.mobile-view {
          position: relative;
          height: 100%;
          border: none;
          padding-bottom: 0;
        }
        
        .guide-view.mobile-view .guide-view-header {
          display: none;
        }
        
        .guide-view.mobile-view .navigation-buttons {
          bottom: 0;
          width: 100%;
          border-radius: 0;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
        }

        .help-button-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }
        
        .add-to-helper-button {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s;
        }
        
        .add-to-helper-button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }

        .guide-navigation-container {
          position: sticky;
          bottom: 0;
          width: 100%;
          background-color: var(--vscode-editor-background);
          border-top: 1px solid var(--vscode-panel-border);
          padding: 12px 0;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
          z-index: 100;
          margin-top: auto;
        }

        .bottom-navigation {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          background-color: var(--vscode-editor-background);
          border-top: 1px solid var(--vscode-panel-border);
          padding: 12px 0;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
          z-index: 100;
        }

        .code-actions {
          position: absolute;
          top: 5px;
          right: 5px;
          z-index: 10;
        }

        .icon-buttons {
          display: flex;
          gap: 5px;
        }
        
        .icon-button {
          background: transparent;
          border: none;
          color: var(--vscode-editor-foreground);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0.7;
        }
        
        .icon-button:hover {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }
      `}</style>
      {!isMobileView && (
        <div className="guide-view-header">
          <div className="header-content">
            <h2>{tutorial.title}</h2>
            <div className="step-indicator">
              Step {currentStep + 1} of {tutorial.steps.length}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleBackToList}
              style={{
                background: 'transparent',
                border: '1px solid var(--vscode-button-background)',
                color: 'var(--vscode-button-background)',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              목록으로
            </button>
            <button onClick={onClose} className="close-button">
              ×
            </button>
          </div>
        </div>
      )}
      <div className="guide-view-content">
        <h3 className="step-title">{currentStepData.title}</h3>
        <div className="guide-content-wrapper">
          <div className="help-button-container" style={{ margin: '20px 0', zIndex: 1000 }}>
            <button
              className="add-to-helper-button"
              style={{
                padding: '10px 15px',
                fontSize: '14px',
                cursor: 'pointer',
                background: 'var(--vscode-button-background)',
                color: 'var(--vscode-button-foreground)',
                border: 'none',
                borderRadius: '4px'
              }}
              onClick={(e) => {
                e.preventDefault();
                ideMessenger?.post('showMessage' as any, {
                  type: 'info',
                  message: '버튼 클릭됨!'
                });
                addToStudyHelper();
              }}
              title="현재 학습 내용을 PearAI Chat에 추가합니다"
            >
              💬 학습 도우미에 추가
            </button>
          </div>
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                code: ({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode; }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div style={{ position: 'relative' }}>
                      <div className="code-actions" style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 10 }}>
                        <div className="icon-buttons">
                          <button
                            className="icon-button"
                            title="코드 복사하기"
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));

                              // 복사 성공 알림
                              const toast = document.createElement('div');
                              toast.textContent = '코드가 복사되었습니다';
                              toast.style.position = 'fixed';
                              toast.style.bottom = '20px';
                              toast.style.left = '50%';
                              toast.style.transform = 'translateX(-50%)';
                              toast.style.padding = '8px 16px';
                              toast.style.backgroundColor = 'var(--vscode-editor-background)';
                              toast.style.color = 'var(--vscode-editor-foreground)';
                              toast.style.borderRadius = '4px';
                              toast.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                              toast.style.zIndex = '1000';
                              document.body.appendChild(toast);

                              // 2초 후 토스트 메시지 제거
                              setTimeout(() => {
                                document.body.removeChild(toast);
                              }, 2000);
                            }}
                          >
                            📋
                          </button>

                          <button
                            className="icon-button"
                            title="학습 도우미에 추가"
                            onClick={() => {
                              // 해당 코드 스니펫만 도우미에 추가
                              const content: EditorContent = {
                                type: "doc",
                                content: [
                                  {
                                    type: "educationBlock",
                                    attrs: {
                                      title: `${tutorial.title} - ${currentStepData.title} (코드 예제)`,
                                      content: '```' + match[1] + '\n' + String(children).replace(/\n$/, '') + '\n```',
                                      category: tutorial.category,
                                      markdown: '```' + match[1] + '\n' + String(children).replace(/\n$/, '') + '\n```'
                                    }
                                  }
                                ]
                              };

                              // 타입 캐스팅 제거
                              ideMessenger.post('addEducationContextToChat', { content });
                            }}
                          >
                            💬
                          </button>
                        </div>
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
                p: ({ node, children, ...props }) => (
                  <p
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', children as string);
                      e.dataTransfer.setData('text/curriculum-content', JSON.stringify({
                        type: 'paragraph',
                        stepTitle: currentStepData.title
                      }));
                    }}
                    style={{ cursor: 'grab' }}
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
      </div>
      <div className="guide-navigation-container">
        <div className="navigation-buttons">
          <button
            onClick={handlePrevStep}
            disabled={isFirstStep}
            className="nav-button prev-button"
          >
            ← 이전
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
            className="nav-button next-button"
          >
            다음 →
          </button>
        </div>
      </div>

      {/* 토스트 메시지 UI (React 상태 기반) */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            backgroundColor: 'var(--vscode-editor-background)',
            color: 'var(--vscode-editor-foreground)',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            zIndex: '9999'
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default GuideView;
