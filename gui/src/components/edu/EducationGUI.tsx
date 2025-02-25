import React, { useState } from 'react';
import { CURRICULUM_DATA } from '../../data/curriculumData';
import { CurriculumItem, CurriculumStep } from '../../types/curriculum';
import './edu.css';

const EducationGUI: React.FC = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumItem | null>(null);
  const [selectedStep, setSelectedStep] = useState<CurriculumStep | null>(null);

  const handleCurriculumSelect = (curriculum: CurriculumItem) => {
    setSelectedCurriculum(curriculum);
    setSelectedStep(curriculum.steps[0]);
  };

  const handleStepSelect = (step: CurriculumStep) => {
    setSelectedStep(step);
  };

  const handleMarkComplete = (stepIndex: number) => {
    if (!selectedCurriculum) return;

    const updatedCurriculum = {...selectedCurriculum};
    updatedCurriculum.steps[stepIndex].completed = true;
    setSelectedCurriculum(updatedCurriculum);
  };

  return (
    <div className="education-container">
      <div className="curriculum-sidebar">
        <h2>학습 커리큘럼</h2>
        <ul className="curriculum-list">
          {CURRICULUM_DATA.map((curriculum) => (
            <li
              key={curriculum.id}
              className={`curriculum-item ${selectedCurriculum?.id === curriculum.id ? 'active' : ''}`}
              onClick={() => handleCurriculumSelect(curriculum)}
            >
              <div className="curriculum-title">
                {curriculum.title}
              </div>
              <div className="curriculum-meta">
                <span className={`difficulty ${curriculum.difficulty}`}>{curriculum.difficulty}</span>
                <span className="category">{curriculum.category}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedCurriculum && (
        <div className="curriculum-content">
          <div className="curriculum-header">
            <h1>{selectedCurriculum.title}</h1>
            <p>{selectedCurriculum.description}</p>
          </div>

          <div className="curriculum-steps">
            <div className="steps-nav">
              {selectedCurriculum.steps.map((step, index) => (
                <div
                  key={index}
                  className={`step ${selectedStep === step ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
                  onClick={() => handleStepSelect(step)}
                >
                  <span className="step-number">{index + 1}</span>
                  <span className="step-title">{step.title}</span>
                </div>
              ))}
            </div>

            {selectedStep && (
              <div className="step-content">
                <div dangerouslySetInnerHTML={{ __html: selectedStep.content.replace(/\n/g, '<br>') }} />

                {!selectedStep.completed && (
                  <button
                    className="mark-complete-btn"
                    onClick={() => handleMarkComplete(selectedCurriculum.steps.indexOf(selectedStep))}
                  >
                    완료 표시하기
                  </button>
                )}

                {selectedStep.evaluation && (
                  <div className="evaluation-section">
                    <h3>평가</h3>
                    <button className="start-evaluation-btn">평가 시작하기</button>
                  </div>
                )}

                {selectedStep.codingTask && (
                  <div className="coding-task-section">
                    <h3>코딩 과제</h3>
                    <button className="start-coding-btn">과제 시작하기</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedCurriculum && (
        <div className="empty-state">
          <h2>학습 커리큘럼을 선택해주세요</h2>
          <p>왼쪽 목록에서 학습하고 싶은 커리큘럼을 선택하세요.</p>
        </div>
      )}
    </div>
  );
};

export default EducationGUI;
