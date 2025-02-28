interface NavigatorProps {
  onComplete: () => void;
  onBack: () => void;
}

const RoadmapContentNavigator: React.FC<NavigatorProps> = ({ onComplete, onBack }) => {
  return (
    <div className="navigator">
      <button onClick={onBack} className="back-button">
        ← 뒤로 가기
      </button>
      <button onClick={onComplete} className="complete-button">
        학습 완료 표시
      </button>
      <style jsx>{`
        .navigator {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          padding: 1rem 0;
          border-top: 1px solid var(--vscode-panel-border);
        }
        .back-button, .complete-button {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .back-button {
          background-color: var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
        }
        .complete-button {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }
      `}</style>
    </div>
  );
};

export default RoadmapContentNavigator; 