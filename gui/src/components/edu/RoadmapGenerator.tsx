import React, { useState, useEffect, useRef } from 'react';

// 카테고리 그룹
interface OptionGroup {
  id: string;
  title: string;
  multiSelect: boolean;
  options: Option[];
  customizable?: boolean;
}

// 선택 옵션
interface Option {
  id: string;
  label: string;
  icon?: string;
}

// 필터 카테고리와 옵션 구조 개선 - 모든 그룹에 id 추가
const filterCategories: Record<string, OptionGroup[]> = {
  '기본 관점': [
    {
      id: 'role',
      title: '역할',
      multiSelect: false,
      customizable: true,
      options: [
        { id: 'frontend', label: '프론트엔드', icon: 'browser' },
        { id: 'backend', label: '백엔드', icon: 'server' },
        { id: 'fullstack', label: '풀스택', icon: 'layers' },
        { id: 'devops', label: '데브옵스', icon: 'gear' },
        { id: 'ai-engineer', label: 'AI 엔지니어', icon: 'circuit-board' },
        { id: 'data-analyst', label: '데이터 분석가', icon: 'graph' },
        { id: 'role-other', label: '기타', icon: 'add' }
      ]
    },
    {
      id: 'tech',
      title: '기술',
      multiSelect: true,
      options: [
        { id: 'javascript', label: '자바스크립트', icon: 'symbol-event' },
        { id: 'python', label: '파이썬', icon: 'symbol-namespace' },
        { id: 'java', label: '자바', icon: 'coffee' },
        { id: 'csharp', label: 'C#', icon: 'symbol-namespace' },
        { id: 'cpp', label: 'C++', icon: 'symbol-operator' },
        { id: 'go', label: 'Go', icon: 'symbol-namespace' },
        { id: 'react', label: 'React', icon: 'react' },
        { id: 'angular', label: 'Angular', icon: 'symbol-event' },
        { id: 'vue', label: 'Vue.js', icon: 'symbol-variable' },
        { id: 'nodejs', label: 'Node.js', icon: 'nodejs' },
        { id: 'django', label: 'Django', icon: 'symbol-namespace' },
        { id: 'flask', label: 'Flask', icon: 'beaker' },
        { id: 'sql', label: 'SQL', icon: 'database' }
      ]
    },
    {
      id: 'foundation',
      title: '기초 지식',
      multiSelect: true,
      options: [
        { id: 'cs-foundation', label: '컴퓨터 과학', icon: 'library' },
        { id: 'software-principles', label: '소프트웨어 원칙', icon: 'checklist' },
        { id: 'problem-solving', label: '문제 해결 능력', icon: 'lightbulb' },
        { id: 'data-structures', label: '자료구조', icon: 'list-tree' },
        { id: 'algorithms', label: '알고리즘', icon: 'list-ordered' }
      ]
    }
  ],
  '응용 관점': [
    {
      id: 'application-area',
      title: '응용 영역',
      multiSelect: true,
      options: [
        { id: 'web-dev', label: '웹 개발', icon: 'globe' },
        { id: 'mobile-dev', label: '모바일 개발', icon: 'device-mobile' },
        { id: 'ai-ml', label: 'AI & 머신러닝', icon: 'brain' },
        { id: 'game-dev', label: '게임 개발', icon: 'game' },
        { id: 'fintech', label: '핀테크', icon: 'credit-card' },
        { id: 'devops-area', label: '데브옵스', icon: 'server-process' },
        { id: 'security', label: '보안', icon: 'shield' }
      ]
    },
    {
      id: 'methodology',
      title: '개발 방법론',
      multiSelect: true,
      options: [
        { id: 'agile', label: '애자일', icon: 'iterations' },
        { id: 'tdd', label: 'TDD', icon: 'beaker' },
        { id: 'ci-cd', label: 'CI/CD', icon: 'sync' },
        { id: 'microservices', label: '마이크로서비스', icon: 'server-process' },
        { id: 'design-patterns', label: '디자인 패턴', icon: 'symbol-class' }
      ]
    },
    {
      id: 'project-type',
      title: '프로젝트 유형',
      multiSelect: false,
      options: [
        { id: 'ecommerce', label: '이커머스', icon: 'package' },
        { id: 'saas', label: 'SaaS', icon: 'cloud' },
        { id: 'social', label: '소셜 네트워크', icon: 'account' },
        { id: 'crm', label: 'CRM', icon: 'organization' },
        { id: 'cms', label: 'CMS', icon: 'files' }
      ]
    }
  ],
  '학습자 관점': [
    {
      id: 'learner-level',
      title: '학습자 수준',
      multiSelect: false,
      options: [
        { id: 'beginner', label: '입문자', icon: 'smiley' },
        { id: 'intermediate', label: '중급자', icon: 'thumbsup' },
        { id: 'expert', label: '전문가', icon: 'star-full' }
      ]
    },
    {
      id: 'learning-goal',
      title: '학습 목표',
      multiSelect: false,
      options: [
        { id: 'job-ready', label: '취업 준비', icon: 'briefcase' },
        { id: 'skill-upgrade', label: '역량 강화', icon: 'graph-line' },
        { id: 'certification', label: '자격증 취득', icon: 'verified' },
        { id: 'side-project', label: '사이드 프로젝트', icon: 'code' }
      ]
    },
    {
      id: 'learning-style',
      title: '학습 방식',
      multiSelect: false,
      options: [
        { id: 'hands-on', label: '실습 중심', icon: 'tools' },
        { id: 'theory-first', label: '이론 중심', icon: 'book' },
        { id: 'challenge-based', label: '도전 과제 기반', icon: 'puzzle' },
        { id: 'project-based', label: '프로젝트 기반', icon: 'project' }
      ]
    },
    {
      id: 'time-investment',
      title: '시간 투자',
      multiSelect: false,
      options: [
        { id: 'quick-path', label: '빠른 경로 (3개월)', icon: 'clock' },
        { id: 'balanced-path', label: '균형 잡힌 경로 (6개월)', icon: 'balance-scale' },
        { id: 'deep-path', label: '심화 경로 (1년+)', icon: 'milestone' }
      ]
    }
  ]
};

interface RoadmapGeneratorProps {
  onGenerateRoadmap: (filters: any) => void;
}

interface CustomOption {
  groupId: string;
  value: string;
}

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ onGenerateRoadmap }) => {
  const [activeTab, setActiveTab] = useState<string>('기본 관점');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  const [showCustomInput, setShowCustomInput] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);
  const [customRequirements, setCustomRequirements] = useState<string>('');

  // 필터 선택 토글 함수 - 직접 상태 업데이트
  const toggleFilter = (groupId: string, optionId: string, multiSelect: boolean) => {
    console.log(`[토글 시작] 그룹ID: ${groupId}, 옵션ID: ${optionId}, 다중선택: ${multiSelect}`);
    console.log(`[현재 상태] ${JSON.stringify(selectedFilters)}`);
    
    // 기타 옵션은 특별 처리
    if (optionId.endsWith('-other')) {
      setShowCustomInput(groupId);
      return;
    }
    
    // 현재 상태 복사
    const newFilters = {...selectedFilters};
    
    // 그룹이 없으면 초기화
    if (!newFilters[groupId]) {
      newFilters[groupId] = [];
    }
    
    // 옵션이 이미 선택되어 있는지 확인
    const isSelected = newFilters[groupId].includes(optionId);
    console.log(`[선택 확인] 그룹: ${groupId}, 옵션: ${optionId}, 선택됨: ${isSelected}`);
    
    if (isSelected) {
      // 이미 선택된 옵션이면 제거
      newFilters[groupId] = newFilters[groupId].filter(id => id !== optionId);
    } else {
      // 새로 선택
      if (multiSelect) {
        // 다중 선택이면 추가
        newFilters[groupId].push(optionId);
      } else {
        // 단일 선택이면 다른 것 제거하고 이것만 추가
        newFilters[groupId] = [optionId];
      }
    }
    
    console.log(`[새 상태] ${JSON.stringify(newFilters)}`);
    setSelectedFilters(newFilters);
  };

  // 커스텀 옵션 추가
  const addCustomOption = () => {
    if (!showCustomInput || !customValue.trim()) return;
    
    // 커스텀 옵션 ID 생성
    const customId = `custom-${showCustomInput}-${Date.now()}`;
    
    // 커스텀 옵션 추가
    setCustomOptions(prev => [
      ...prev,
      { groupId: showCustomInput, value: customValue.trim() }
    ]);
    
    // 선택된 필터에 추가
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (!newFilters[showCustomInput]) {
        newFilters[showCustomInput] = [];
      }
      
      // 단일 선택 그룹인 경우 기존 선택 제거
      const group = findGroup(showCustomInput);
      if (group && !group.multiSelect) {
        newFilters[showCustomInput] = [customId];
      } else {
        newFilters[showCustomInput].push(customId);
      }
      
      return newFilters;
    });
    
    // 입력창 초기화 및 닫기
    setCustomValue('');
    setShowCustomInput(null);
  };

  // 커스텀 입력 취소
  const cancelCustomInput = () => {
    setCustomValue('');
    setShowCustomInput(null);
  };

  // 커스텀 입력에서 Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomOption();
    } else if (e.key === 'Escape') {
      cancelCustomInput();
    }
  };

  // 주어진 그룹 ID에 해당하는 그룹 찾기
  const findGroup = (groupId: string): OptionGroup | undefined => {
    for (const tabKey in filterCategories) {
      for (const group of filterCategories[tabKey]) {
        if (group.id === groupId) {
          return group;
        }
      }
    }
    return undefined;
  };

  // 선택 항목 삭제
  const removeSelection = (groupId: string, optionId: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[groupId]) {
        newFilters[groupId] = newFilters[groupId].filter(id => id !== optionId);
        if (newFilters[groupId].length === 0) {
          delete newFilters[groupId];
        }
      }
      return newFilters;
    });
  };

  // 커스텀 옵션 삭제
  const removeCustomOption = (groupId: string, customId: string) => {
    removeSelection(groupId, customId);
    setCustomOptions(prev => prev.filter(opt => 
      !(opt.groupId === groupId && `custom-${groupId}-${customId}` === customId)
    ));
  };

  // 모든 선택 초기화
  const clearAllSelections = () => {
    setSelectedFilters({});
    setCustomOptions([]);
  };

  // 커스텀 입력창이 열리면 포커스
  useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [showCustomInput]);

  // 로드맵 생성 함수
  const generateRoadmap = () => {
    setIsGenerating(true);
    
    // 선택된 필터와 사용자 정의 요구사항을 함께 전달
    onGenerateRoadmap({
      filters: selectedFilters,
      customOptions,
      requirements: customRequirements
    });
    
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  // 옵션 ID로 옵션 찾기
  const findOptionById = (optionId: string): Option | undefined => {
    for (const tabKey in filterCategories) {
      for (const group of filterCategories[tabKey]) {
        const option = group.options.find(opt => opt.id === optionId);
        if (option) return option;
      }
    }
    return undefined;
  };

  // 그룹별 옵션 렌더링 함수 추가 - 디버그 로깅 추가
  const renderGroupOptions = (group: OptionGroup) => {
    console.log(`[그룹 렌더링] ${group.id}, ${group.title}, 다중선택: ${group.multiSelect}`);
    
    return (
      <div key={group.id} className="options-group">
        <div className="group-header">
          <h3>{group.title}</h3>
          <span className="selection-type">
            {group.multiSelect ? '(다중 선택 가능)' : '(단일 선택)'}
          </span>
        </div>
        
        <div className="options-grid">
          {group.options.map(option => {
            // 디버그 로깅
            const isSelected = selectedFilters[group.id]?.includes(option.id) || false;
            console.log(`   [옵션] ${option.id}, 선택됨: ${isSelected}`);
            
            return renderOptionCard(group, option);
          })}
        </div>
      </div>
    );
  };

  // 옵션 카드 렌더링 함수 - 디버그 추가
  const renderOptionCard = (group: OptionGroup, option: Option) => {
    const isSelected = selectedFilters[group.id]?.includes(option.id) || false;
    
    // 상세 디버그 로깅
    console.log(`[카드 렌더링] 그룹ID: ${group.id}, 옵션ID: ${option.id}, 선택됨: ${isSelected}`);
    console.log(`   선택 배열: ${JSON.stringify(selectedFilters[group.id] || [])}`);
    
    return (
      <div 
        key={option.id} 
        className={`option-card ${isSelected ? 'selected' : ''}`}
        onClick={(e) => {
          e.preventDefault(); // 이벤트 버블링 방지
          console.log(`[클릭] 그룹: ${group.id}, 옵션: ${option.id}`);
          toggleFilter(group.id, option.id, group.multiSelect);
        }}
      >
        {option.icon && <i className={`codicon codicon-${option.icon} card-icon`}></i>}
        <div className="card-content">
          <div className="card-title">{option.label}</div>
        </div>
        {isSelected && <div className="check-mark">✓</div>}
      </div>
    );
  };

  // 선택된 옵션 표시 함수 수정 - 그룹 정보 찾는 로직 개선
  const renderSelectedTags = () => {
    if (Object.keys(selectedFilters).length === 0) {
      return <p className="empty-selection">선택된 필터가 없습니다. 위에서 옵션을 선택해주세요.</p>;
    }
    
    return (
      <div className="selected-tags">
        {Object.entries(selectedFilters).map(([groupId, optionIds]) => {
          // 그룹 정보 찾기
          let groupTitle = groupId;
          for (const tabKey in filterCategories) {
            const foundGroup = filterCategories[tabKey].find(g => g.id === groupId);
            if (foundGroup) {
              groupTitle = foundGroup.title;
              break;
            }
          }
          
          return optionIds.map(optionId => {
            let label = '';
            let isCustom = false;
            
            // 커스텀 옵션인 경우
            if (optionId.startsWith('custom-')) {
              const customOption = customOptions.find(opt => 
                opt.groupId === groupId && `custom-${groupId}-${optionId.split('-').pop()}` === optionId);
              if (customOption) {
                label = customOption.value;
                isCustom = true;
              }
            } else {
              // 일반 옵션인 경우
              const option = findOptionById(optionId);
              if (option) {
                label = option.label;
              }
            }
            
            if (!label) return null;
            
            return (
              <div key={`${groupId}-${optionId}`} className="selected-tag">
                <span className="tag-group">{groupTitle}:</span>
                <span className="tag-value">{label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCustom) {
                      removeCustomOption(groupId, optionId);
                    } else {
                      removeSelection(groupId, optionId);
                    }
                  }}
                  className="remove-tag"
                >
                  ×
                </button>
              </div>
            );
          });
        })}
      </div>
    );
  };

  // 커스텀 입력 UI 렌더링
  const renderCustomInput = () => {
    if (!showCustomInput) return null;
    
    return (
      <div className="custom-input-container">
        <div className="custom-input-header">
          <h3>"{showCustomInput}" 커스텀 항목 추가</h3>
          <button className="close-button" onClick={cancelCustomInput}>×</button>
        </div>
        <div className="custom-input-form">
          <input
            ref={customInputRef}
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="커스텀 항목 이름 입력..."
            className="custom-input"
          />
          <div className="custom-input-buttons">
            <button
              className="custom-cancel-button"
              onClick={cancelCustomInput}
            >
              취소
            </button>
            <button
              className="custom-add-button"
              onClick={addCustomOption}
              disabled={!customValue.trim()}
            >
              추가
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 요구사항 렌더링 함수 추가
  const renderCustomRequirements = () => {
    return (
      <div className="custom-requirements-container">
        <h3 className="requirements-title">추가 요구사항</h3>
        <p className="requirements-description">
          선택하신 옵션 외에 로드맵에 반영되었으면 하는 추가 요구사항이 있다면 작성해 주세요.
        </p>
        <textarea
          className="requirements-textarea"
          placeholder="예: '자바 백엔드 개발자로 취업하기 위한 로드맵을 만들어주세요.' 또는 '클라우드 기술에 중점을 두고 싶습니다.'"
          value={customRequirements}
          onChange={(e) => setCustomRequirements(e.target.value)}
          rows={4}
        />
      </div>
    );
  };

  // 디버그 정보 추가 (문제 해결 시 제거)
  const renderDebugInfo = () => {
    return (
      <div className="debug-info" style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc', fontSize: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>디버그 정보</h4>
        <details>
          <summary>선택된 필터</summary>
          <pre>{JSON.stringify(selectedFilters, null, 2)}</pre>
        </details>
        <details>
          <summary>커스텀 옵션</summary>
          <pre>{JSON.stringify(customOptions, null, 2)}</pre>
        </details>
      </div>
    );
  };

  return (
    <div className="roadmap-generator">
      <h2 className="generator-title">맞춤형 로드맵 생성</h2>
      <div className="tab-container">
        {Object.keys(filterCategories).map(group => (
          <button 
            key={group}
            className={`tab-button ${activeTab === group ? 'active' : ''}`}
            onClick={() => setActiveTab(group)}
          >
            {group}
          </button>
        ))}
      </div>
      
      {/* 현재 탭의 그룹들 렌더링 */}
      <div className="groups-container">
        {filterCategories[activeTab].map(group => renderGroupOptions(group))}
      </div>
      
      {/* 커스텀 입력 UI */}
      {renderCustomInput()}
      
      {/* 선택된 항목들 표시 */}
      <div className="selected-items-container">
        <h3 className="selected-title">
          선택된 항목
          <button 
            className="clear-button" 
            onClick={clearAllSelections}
            disabled={Object.keys(selectedFilters).length === 0}
          >
            모두 지우기
          </button>
        </h3>
        {renderSelectedTags()}
      </div>
      
      {/* 추가 요구사항 입력 */}
      {renderCustomRequirements()}
      
      {/* 로드맵 생성 버튼 */}
      <button
        className="generate-button"
        onClick={generateRoadmap}
        disabled={isGenerating || Object.keys(selectedFilters).length === 0}
      >
        {isGenerating ? '생성 중...' : '로드맵 생성하기'}
      </button>
      
      <style jsx>{`
        .roadmap-generator {
          padding: 16px;
          max-width: 100%;
          overflow-x: hidden;
        }
        
        .generator-title {
          font-size: 18px;
          margin-bottom: 20px;
        }
        
        .tab-container {
          display: flex;
          border-bottom: 1px solid var(--vscode-panel-border);
          margin-bottom: 20px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        
        .tab-button {
          background: none;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
          color: var(--vscode-editor-foreground);
          font-size: 13px;
          position: relative;
          white-space: nowrap;
        }
        
        .tab-button.active {
          color: var(--vscode-button-foreground);
        }
        
        .tab-button.active::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--vscode-button-background);
        }
        
        .groups-container {
          margin-bottom: 20px;
          max-height: 400px;
          overflow-y: auto;
          padding: 4px;
        }
        
        .option-group {
          margin-bottom: 24px;
        }
        
        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .group-header h3 {
          margin: 0;
          font-size: 14px;
        }
        
        .selection-type {
          font-size: 11px;
          color: var(--vscode-descriptionForeground);
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
        }
        
        .option-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 8px;
          border-radius: 6px;
          background-color: var(--vscode-editorWidget-background);
          border: 1px solid var(--vscode-widget-border);
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
          min-height: 70px;
          text-align: center;
        }
        
        .option-card:hover {
          background-color: var(--vscode-list-hoverBackground);
        }
        
        .option-card.selected {
          border-color: var(--vscode-button-background);
          background-color: var(--vscode-list-activeSelectionBackground);
        }
        
        .card-icon {
          font-size: 18px;
          margin-bottom: 6px;
          color: var(--vscode-symbolIcon-classForeground);
        }
        
        .card-content {
          text-align: center;
        }
        
        .card-title {
          font-size: 12px;
          font-weight: 500;
          word-break: keep-all;
          line-height: 1.3;
        }
        
        .check-mark {
          position: absolute;
          top: 8px;
          right: 8px;
          color: var(--vscode-charts-green);
          font-weight: bold;
        }
        
        .custom-input-container {
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .custom-input-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .custom-input-header h3 {
          margin: 0;
          font-size: 14px;
        }
        
        .close-button {
          background: none;
          border: none;
          color: var(--vscode-errorForeground);
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
        }
        
        .custom-input-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .custom-input {
          padding: 8px 12px;
          border: 1px solid var(--vscode-input-border);
          background-color: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          border-radius: 4px;
          font-size: 14px;
        }
        
        .custom-input-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        
        .custom-cancel-button {
          background: none;
          border: 1px solid var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .custom-add-button {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .custom-add-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .selected-items-container {
          margin-bottom: 16px;
          border: 1px solid var(--vscode-panel-border);
          border-radius: 6px;
          padding: 12px;
        }
        
        .selected-title {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .clear-button {
          background: none;
          border: none;
          color: var(--vscode-errorForeground);
          cursor: pointer;
          font-size: 12px;
          padding: 2px 4px;
        }
        
        .clear-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .empty-selection {
          color: var(--vscode-descriptionForeground);
          font-style: italic;
          margin: 0;
        }
        
        .selected-tag {
          background-color: var(--vscode-badge-background);
          color: var(--vscode-badge-foreground);
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 11px;
          display: flex;
          align-items: center;
        }
        
        .tag-group {
          font-weight: bold;
          margin-right: 3px;
          font-size: 10px;
        }
        
        .remove-tag {
          background: none;
          border: none;
          color: var(--vscode-badge-foreground);
          cursor: pointer;
          font-size: 14px;
          margin-left: 4px;
          display: flex;
          align-items: center;
          padding: 0 2px;
        }
        
        .custom-requirements-container {
          margin: 20px 0;
          padding: 15px;
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
        }
        
        .requirements-title {
          font-size: 14px;
          margin: 0 0 8px 0;
          color: var(--vscode-editor-foreground);
        }
        
        .requirements-description {
          font-size: 12px;
          color: var(--vscode-descriptionForeground);
          margin-bottom: 10px;
        }
        
        .requirements-textarea {
          width: 100%;
          padding: 8px;
          font-size: 13px;
          color: var(--vscode-input-foreground);
          background-color: var(--vscode-input-background);
          border: 1px solid var(--vscode-input-border);
          border-radius: 2px;
          resize: vertical;
          min-height: 80px;
          font-family: var(--vscode-font-family);
        }
        
        .requirements-textarea:focus {
          outline: 1px solid var(--vscode-focusBorder);
          border-color: var(--vscode-focusBorder);
        }
        
        .generate-button {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 2px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          width: 100%;
        }
        
        .generate-button:hover:not(:disabled) {
          background-color: var(--vscode-button-hoverBackground);
        }
        
        .generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default RoadmapGenerator; 