import React, { useState, useEffect } from 'react';
import { CURRICULUM_DATA } from '../../data/curriculumData';
import { CurriculumItem, CurriculumStep } from '../../types/curriculum';
import './edu.css';
import LeftPanel from './LeftPanel';

// 로드맵 타입 정의
export type RoadmapType = 'role' | 'skill';

interface EducationGUIProps {
  onSelectCurriculum?: (curriculumId: string) => void;
  onSelectCategory?: (curriculumId: string, categoryIndex: number) => void;
  selectedCurriculumId?: string;
  onSelectRoadmap?: (roadmapId: string) => void;
  selectedRoadmapId?: string | null;
  activeView?: 'curriculum' | 'roadmap';
  onChangeView?: (view: 'curriculum' | 'roadmap') => void;
}

const EducationGUI: React.FC<EducationGUIProps> = ({ 
  onSelectCurriculum,
  onSelectCategory,
  selectedCurriculumId,
  onSelectRoadmap,
  selectedRoadmapId = null,
  activeView = 'curriculum',
  onChangeView
}) => {
  // 로컬 상태 변경 - 외부 상태 사용으로 변경
  const [selectedView, setSelectedView] = useState<'curriculum' | 'roadmap'>(activeView);
  
  // activeView prop이 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    setSelectedView(activeView);
  }, [activeView]);

  // 뷰 변경 처리
  const handleViewChange = (view: 'curriculum' | 'roadmap') => {
    setSelectedView(view);
    if (onChangeView) {
      onChangeView(view);
    }
  };

  // 로드맵 선택 핸들러 수정
  const handleRoadmapSelect = (roadmapId: string) => {
    // 로드맵 ID 저장
    if (onSelectRoadmap) {
      onSelectRoadmap(roadmapId);
    }
    
    // 여기서 로드맵 뷰 표시 상태도 관리하는 것이 좋음
    // 예: setShowRoadmapView(true);
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (curriculumId: string, stepIndex: number) => {
    if (onSelectCategory) {
      onSelectCategory(curriculumId, stepIndex);
    }
  };

  // 사이드바만 표시하는 레이아웃
  return (
    <div className="education-sidebar-layout">
      {/* 사이드바 */}
      <div className="sidebar-header">
        <h2>학습 자료</h2>
        <div className="view-selector">
          <button 
            className={`view-button ${selectedView === 'curriculum' ? 'active' : ''}`}
            onClick={() => handleViewChange('curriculum')}
          >
            커리큘럼
          </button>
          <button 
            className={`view-button ${selectedView === 'roadmap' ? 'active' : ''}`}
            onClick={() => handleViewChange('roadmap')}
          >
            로드맵
          </button>
        </div>
      </div>
      
      <LeftPanel 
        selectedId={selectedView === 'curriculum' ? selectedCurriculumId || null : selectedRoadmapId}
        onSelect={selectedView === 'curriculum' ? 
          (id) => onSelectCurriculum && onSelectCurriculum(id) : 
          handleRoadmapSelect
        }
        items={selectedView === 'curriculum' ? CURRICULUM_DATA : undefined}
        viewType={selectedView}
      />
      
      <style jsx>{`
        .education-sidebar-layout {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--vscode-panel-border);
        }
        
        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .sidebar-header h2 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .view-selector {
          display: flex;
          background-color: var(--vscode-editor-background);
          border-radius: 4px;
          padding: 2px;
          border: 1px solid var(--vscode-panel-border);
        }
        
        .view-button {
          flex: 1;
          background: none;
          border: none;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          border-radius: 3px;
          color: var(--vscode-foreground);
        }
        
        .view-button.active {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }
      `}</style>
    </div>
  );
};

export default EducationGUI;
