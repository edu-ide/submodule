import React, { useState, useEffect } from 'react';
import Layout from '../components/edu/Layout';
import EducationGUI from '../components/edu/EducationGUI';
import GuideView from '../components/edu/GuideView';
import { CURRICULUM_DATA } from '../data/curriculumData';

const EducationPage: React.FC = () => {
  console.log('교육 페이지 렌더링 중...');
  const [selectedTutorial, setSelectedTutorial] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState<Array<{id: string, title: string, type: 'curriculum' | 'category'}>>([]);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  // 커리큘럼을 선택했을 때 호출되는 함수
  const handleTutorialSelect = (tutorialId: string) => {
    // 빈 문자열이면 선택 취소
    if (!tutorialId) {
      setSelectedTutorial(undefined);
      setNavigationStack([]);
      return;
    }
    
    // 선택된 커리큘럼 정보 찾기
    const tutorial = CURRICULUM_DATA.find(item => item.id === tutorialId);
    if (tutorial) {
      setSlideDirection('forward');
      setSelectedTutorial(tutorialId);
      // 가이드 열지 않고 중간 단계(카테고리 목록)만 표시
      setIsGuideOpen(false);
      setSelectedCategory(undefined);
      setNavigationStack(prev => [...prev, {id: tutorialId, title: tutorial.title, type: 'curriculum'}]);
    }
  };

  // 카테고리를 선택했을 때 호출되는 함수
  const handleCategorySelect = (tutorialId: string, categoryIndex: number) => {
    const tutorial = CURRICULUM_DATA.find(item => item.id === tutorialId);
    if (tutorial) {
      const categoryTitle = tutorial.steps[categoryIndex].title;
      setSlideDirection('forward');
      setSelectedTutorial(tutorialId);
      setSelectedCategory(categoryIndex);
      setIsGuideOpen(true);
      setNavigationStack(prev => [...prev, {
        id: `${tutorialId}-${categoryIndex}`, 
        title: categoryTitle, 
        type: 'category'
      }]);
    }
  };

  // 뒤로가기 버튼 처리
  const handleBack = () => {
    setSlideDirection('backward');
    
    // 애니메이션을 위한 짧은 딜레이 추가
    setTimeout(() => {
      const newStack = [...navigationStack];
      const popped = newStack.pop();
      
      if (popped?.type === 'category') {
        setIsGuideOpen(false);
        setSelectedCategory(undefined);
      } else if (popped?.type === 'curriculum') {
        setSelectedTutorial(undefined);
      }
      
      setNavigationStack(newStack);
    }, 300);
  };

  // 가이드 화면에서 뒤로 갈 때 호출되는 함수
  const handleGuideClose = () => {
    handleBack();
  };

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    const handlePopState = () => {
      if (navigationStack.length > 0) {
        handleBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigationStack]);

  return (
    <Layout>
      <div className="education-page-container">
        <div className={`screen-container ${navigationStack.length > 0 ? 'shifted-' + navigationStack.length : ''} ${slideDirection}`}>
          {/* 첫 번째 화면: 커리큘럼 목록 */}
          <div className="screen main-screen">
            <EducationGUI 
              onSelectCurriculum={handleTutorialSelect} 
              onSelectCategory={handleCategorySelect}
              selectedCurriculumId={undefined} // 항상 메인 목록 표시
            />
          </div>
          
          {/* 두 번째 화면: 카테고리 선택 */}
          <div className="screen category-screen">
            {selectedTutorial && !isGuideOpen && (
              <EducationGUI 
                onSelectCurriculum={handleTutorialSelect}
                onSelectCategory={handleCategorySelect}
                selectedCurriculumId={selectedTutorial}
              />
            )}
          </div>
          
          {/* 세 번째 화면: 가이드 콘텐츠 */}
          <div className="screen guide-screen">
            {isGuideOpen && selectedTutorial && selectedCategory !== undefined && (
              <>
                <div className="mobile-header">
                  <button className="back-button" onClick={handleGuideClose}>
                    ← 뒤로
                  </button>
                  <h2 className="screen-title">
                    {navigationStack.length > 0 ? navigationStack[navigationStack.length - 1].title : ''}
                  </h2>
                </div>
                <div className="guide-content">
                  <GuideView 
                    tutorialId={selectedTutorial} 
                    onClose={handleGuideClose} 
                    isMobileView={true}
                    initialStep={selectedCategory}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .education-page-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        
        .screen-container {
          display: flex;
          width: 300%;
          height: 100%;
          transition: transform 0.3s ease-in-out;
        }
        
        .screen-container.shifted-1 {
          transform: translateX(-33.33%);
        }
        
        .screen-container.shifted-2 {
          transform: translateX(-66.66%);
        }
        
        .screen {
          width: 33.33%;
          height: 100%;
          overflow: auto;
        }
        
        .category-screen {
          display: flex;
          flex-direction: column;
        }
        
        .guide-screen {
          display: flex;
          flex-direction: column;
        }
        
        .mobile-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background-color: var(--vscode-editor-background);
          border-bottom: 1px solid var(--vscode-panel-border);
          z-index: 100;
        }
        
        .back-button {
          background: none;
          border: none;
          color: var(--vscode-button-foreground);
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          font-size: 14px;
        }
        
        .screen-title {
          margin: 0 0 0 16px;
          font-size: 16px;
          font-weight: 500;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .guide-content {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </Layout>
  );
};

export default EducationPage;
