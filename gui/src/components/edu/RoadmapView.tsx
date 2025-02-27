import React from 'react';

interface RoadmapViewProps {
  roadmapId: string | null;
  onBack: () => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmapId, onBack }) => {
  // 로드맵 ID가 없으면 기본 메시지 표시
  if (!roadmapId) {
    return (
      <div className="roadmap-empty-state">
        <h2>로드맵을 선택하세요</h2>
        <p>학습 경로를 시각화한 로드맵을 통해 체계적인 학습을 진행할 수 있습니다.</p>
        <p>좌측의 로드맵 목록에서 원하는 항목을 선택하세요.</p>
      </div>
    );
  }

  // 로드맵 ID를 기반으로 제목 추출
  const getRoadmapTitle = (id: string): string => {
    // ID를 대시로 구분된 문자열로 가정하고 각 단어의 첫 글자를 대문자로 변환
    return id.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
        <button onClick={onBack} className="back-button">
          ← 뒤로
        </button>
        <h2>{getRoadmapTitle(roadmapId)} 로드맵</h2>
      </div>
      
      <div className="roadmap-info">
        <p>
          이 로드맵은 {getRoadmapTitle(roadmapId)}을(를) 배우기 위한 체계적인 학습 경로를 제공합니다.
          각 단계는 선행 학습이 필요한 내용을 기준으로 구성되어 있습니다.
        </p>
      </div>
      
      <div className="roadmap-content">
        <div className="roadmap-placeholder">
          <div className="placeholder-icon">🚧</div>
          <h3>로드맵 준비 중</h3>
          <p>
            현재 {getRoadmapTitle(roadmapId)} 로드맵을 구성하고 있습니다.
            곧 더 체계적인 학습 경로를 제공해 드리겠습니다.
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .roadmap-container {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .roadmap-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .back-button {
          background: none;
          border: none;
          color: var(--vscode-button-foreground);
          cursor: pointer;
          padding: 8px;
          margin-right: 16px;
          display: flex;
          align-items: center;
          font-size: 14px;
        }
        
        .roadmap-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
        }
        
        .roadmap-info {
          color: var(--vscode-descriptionForeground);
          margin-bottom: 24px;
          padding: 16px;
          background-color: var(--vscode-editor-background);
          border-radius: 8px;
          border: 1px solid var(--vscode-panel-border);
        }
        
        .roadmap-info p {
          margin: 0;
          line-height: 1.5;
        }
        
        .roadmap-content {
          min-height: 500px;
          background-color: var(--vscode-editor-background);
          border-radius: 8px;
          border: 1px solid var(--vscode-panel-border);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .roadmap-placeholder {
          text-align: center;
          padding: 40px;
        }
        
        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .roadmap-placeholder h3 {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 500;
        }
        
        .roadmap-placeholder p {
          margin: 0;
          color: var(--vscode-descriptionForeground);
          max-width: 400px;
          line-height: 1.5;
        }
        
        .roadmap-empty-state {
          text-align: center;
          padding: 40px;
        }
        
        .roadmap-empty-state h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 500;
        }
        
        .roadmap-empty-state p {
          margin: 0 0 8px 0;
          color: var(--vscode-descriptionForeground);
          max-width: 400px;
          line-height: 1.5;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </div>
  );
};

export default RoadmapView; 