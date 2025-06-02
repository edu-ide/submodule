import React, { useState } from 'react';

// 마법사 단계 정의
const wizardSteps = [
  {
    id: 'role',
    title: '역할 선택',
    description: '목표로 하는 개발자 역할을 선택하세요',
    options: ['프론트엔드', '백엔드', '풀스택', 'DevOps', 'AI 엔지니어', '데이터 사이언티스트']
  },
  {
    id: 'skill',
    title: '기술 선택',
    description: '관심 있는 기술을 선택하세요 (여러 개 선택 가능)',
    options: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Cloud']
  },
  {
    id: 'level',
    title: '현재 수준',
    description: '현재 프로그래밍 수준을 선택하세요',
    options: ['입문자', '초급', '중급', '고급']
  },
  {
    id: 'time',
    title: '학습 시간',
    description: '학습에 투자할 수 있는 시간을 선택하세요',
    options: ['주 5시간 미만', '주 5-10시간', '주 10-20시간', '주 20시간 이상']
  },
  {
    id: 'goal',
    title: '학습 목표',
    description: '주요 학습 목표를 선택하세요',
    options: ['취업/이직', '업무 역량 강화', '사이드 프로젝트', '새로운 분야 탐색']
  }
];

interface RoadmapWizardProps {
  onComplete: (selections: Record<string, string | string[]>) => void;
}

const RoadmapWizard: React.FC<RoadmapWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const [isMultiSelect, setIsMultiSelect] = useState<boolean[]>([false, true, false, false, false]);

  // 다음 단계로 이동
  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(selections);
    }
  };

  // 이전 단계로 이동
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 선택 항목 처리
  const handleSelection = (option: string) => {
    const stepId = wizardSteps[currentStep].id;
    
    if (isMultiSelect[currentStep]) {
      // 다중 선택인 경우
      setSelections(prev => {
        const current = prev[stepId] as string[] || [];
        if (current.includes(option)) {
          return {
            ...prev,
            [stepId]: current.filter(item => item !== option)
          };
        } else {
          return {
            ...prev,
            [stepId]: [...current, option]
          };
        }
      });
    } else {
      // 단일 선택인 경우
      setSelections(prev => ({
        ...prev,
        [stepId]: option
      }));
      
      // 자동으로 다음 단계로 이동 (단일 선택의 경우)
      setTimeout(nextStep, 300);
    }
  };

  const currentStepData = wizardSteps[currentStep];
  const isLastStep = currentStep === wizardSteps.length - 1;

  return (
    <div className="roadmap-wizard">
      <div className="wizard-progress">
        {wizardSteps.map((step, index) => (
          <div 
            key={step.id} 
            className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>
      
      <div className="wizard-content">
        <h2>{currentStepData.title}</h2>
        <p className="description">{currentStepData.description}</p>
        
        <div className="options-container">
          {currentStepData.options.map(option => {
            const isSelected = isMultiSelect[currentStep]
              ? (selections[currentStepData.id] as string[] || []).includes(option)
              : selections[currentStepData.id] === option;
              
            return (
              <button
                key={option}
                className={`option-button ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelection(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="wizard-navigation">
        {currentStep > 0 && (
          <button className="nav-button prev" onClick={prevStep}>
            이전
          </button>
        )}
        
        {isMultiSelect[currentStep] && (
          <button 
            className="nav-button next" 
            onClick={nextStep}
            disabled={!selections[currentStepData.id] || 
                      (Array.isArray(selections[currentStepData.id]) && 
                       (selections[currentStepData.id] as string[]).length === 0)}
          >
            {isLastStep ? '로드맵 생성' : '다음'}
          </button>
        )}
      </div>
      
      {isMultiSelect[currentStep] && 
        <p className="helper-text">여러 항목을 선택한 후 다음 버튼을 클릭하세요</p>
      }
    </div>
  );
};

export default RoadmapWizard; 