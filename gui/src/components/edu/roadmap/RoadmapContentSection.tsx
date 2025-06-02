interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const RoadmapContentSection: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <div className="content-section">
      <h2>{title}</h2>
      {children}
      <style jsx>{`
        .content-section {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: var(--vscode-sideBar-background);
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--vscode-editor-foreground);
        }
      `}</style>
    </div>
  );
};

export default RoadmapContentSection; 