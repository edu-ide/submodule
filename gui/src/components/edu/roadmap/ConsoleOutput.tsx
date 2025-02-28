import React from 'react';

interface ConsoleOutputProps {
  content: string;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ content }) => {
  const lines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="console-output">
      <div className="console-header">
        <span className="console-title">출력</span>
        <div className="console-buttons">
          <div className="console-button red"></div>
          <div className="console-button yellow"></div>
          <div className="console-button green"></div>
        </div>
      </div>
      <div className="console-content">
        {lines.map((line, index) => (
          <div key={index} className="console-line">
            <span className="console-prompt">{'>'}</span>
            <span className="console-text">{line}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .console-output {
          background-color: #1e1e1e;
          border-radius: 6px;
          margin: 16px 0;
          overflow: hidden;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .console-header {
          background-color: #323232;
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #424242;
        }

        .console-title {
          color: #cccccc;
          font-size: 12px;
        }

        .console-buttons {
          display: flex;
          gap: 6px;
        }

        .console-button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .console-button.red {
          background-color: #ff5f56;
        }

        .console-button.yellow {
          background-color: #ffbd2e;
        }

        .console-button.green {
          background-color: #27c93f;
        }

        .console-content {
          padding: 12px;
        }

        .console-line {
          display: flex;
          gap: 8px;
          color: #ffffff;
          line-height: 1.5;
        }

        .console-prompt {
          color: #666666;
        }

        .console-text {
          color: #ffffff;
          white-space: pre-wrap;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
};

export default ConsoleOutput; 