import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setNodeProgress } from '../../../../redux/roadmapSlice';
import { setBottomMessage } from '../../../../redux/slices/uiStateSlice';

interface ContentNavigationProps {
  roadmapId: string | undefined;
  contentId: string | null;
  getNodeTitleForUrl: (nodeId: string) => Promise<string>;
  getNextContentId: () => Promise<string | null>;
  getPrevContentId: () => Promise<string | null>;
  vsCodeTheme: any;
}

/**
 * 콘텐츠 네비게이션 버튼 컴포넌트
 */
const ContentNavigation: React.FC<ContentNavigationProps> = ({
  roadmapId,
  contentId,
  getNodeTitleForUrl,
  getNextContentId,
  getPrevContentId,
  vsCodeTheme
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleBack = () => {
    if (roadmapId) {
      navigate(`/education/roadmap/${roadmapId}`);
    }
  };

  const handleCompleteContent = () => {
    if (contentId && roadmapId) {
      dispatch(setNodeProgress({ 
        id: contentId, 
        status: 'completed' 
      }));
      navigate(`/education/roadmap/${roadmapId}`);
    }
  };

  // 다음 콘텐츠로 이동
  const handleNextContent = async () => {
    if (!roadmapId) return;

    try {
      const nextContentId = await getNextContentId();
      
      if (nextContentId) {
        // ID를 타이틀로 변환
        const nextContentTitle = await getNodeTitleForUrl(nextContentId);
        console.log('다음 콘텐츠 네비게이션:', {
          id: nextContentId,
          title: nextContentTitle,
          url: `/education/roadmap/${roadmapId}/content/${nextContentTitle}`
        });
        
        navigate(`/education/roadmap/${roadmapId}/content/${nextContentTitle}`);
      } else {
        dispatch(setBottomMessage(
          <div>마지막 콘텐츠입니다.</div>
        ));
      }
    } catch (error) {
      console.error('다음 콘텐츠 이동 실패:', error);
    }
  };

  // 이전 콘텐츠로 이동
  const handlePrevContent = async () => {
    if (!roadmapId) return;

    try {
      const prevContentId = await getPrevContentId();
      
      if (prevContentId) {
        // ID를 타이틀로 변환
        const prevContentTitle = await getNodeTitleForUrl(prevContentId);
        console.log('이전 콘텐츠 네비게이션:', {
          id: prevContentId,
          title: prevContentTitle,
          url: `/education/roadmap/${roadmapId}/content/${prevContentTitle}`
        });
        
        navigate(`/education/roadmap/${roadmapId}/content/${prevContentTitle}`);
      } else {
        dispatch(setBottomMessage(
          <div>첫 번째 콘텐츠입니다.</div>
        ));
      }
    } catch (error) {
      console.error('이전 콘텐츠 이동 실패:', error);
    }
  };

  return (
    <div className="navigation-buttons">
      <div className="left-buttons">
        <button onClick={handleBack} className="back-button">
          이전으로
        </button>
        <button onClick={handlePrevContent} className="nav-button">
          ◀ 이전 콘텐츠
        </button>
      </div>
      <div className="right-buttons">
        <button onClick={handleNextContent} className="nav-button">
          다음 콘텐츠 ▶
        </button>
        <button onClick={handleCompleteContent} className="complete-button">
          완료
        </button>
      </div>
      
      <style jsx>{`
        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: ${vsCodeTheme.editorBackground};
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid ${vsCodeTheme.border};
        }

        .left-buttons,
        .right-buttons {
          display: flex;
          gap: 12px;
        }
        
        .back-button,
        .nav-button,
        .complete-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .nav-button {
          background: ${vsCodeTheme.button.background};
          color: ${vsCodeTheme.button.foreground};
        }
        
        .complete-button {
          background: ${vsCodeTheme.button.background};
          color: ${vsCodeTheme.button.foreground};
        }
        
        .nav-button:hover {
          background: ${vsCodeTheme.button.hover};
        }
        
        .complete-button:hover {
          background: ${vsCodeTheme.button.hover};
        }
      `}</style>
    </div>
  );
};

export default ContentNavigation; 