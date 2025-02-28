import React, { useContext } from 'react';
import { VscCopy, VscFile, VscCommentDiscussion } from 'react-icons/vsc';
import hljs from 'highlight.js';
import { IdeMessengerContext } from '@/context/IdeMessenger';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language, 
  value
}) => {
  const ideMessenger = useContext(IdeMessengerContext);

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
      .then(() => alert('코드가 복사되었습니다!'))
      .catch(err => console.error('복사 실패:', err));
  };

  const handlePasteToEditor = () => {
    ideMessenger.post('createPracticeFile', {
      language,
      code: value
    });
  };

  const handleSendToHelper = () => {
    ideMessenger?.post('addEducationContextToChat', {
      content: {
        type: "doc",
        content: [{
          type: "educationBlock",
          attrs: {
            title: `코드 분석 요청 - ${new Date().toLocaleString()}`,
            content: value,
            category: "roadmap",
            markdown: `\`\`\`${language}\n${value}\n\`\`\``
          }
        }]
      },
      shouldRun: true,
      prompt: "이 코드를 분석하고 설명해주세요"
    });
  };

  // 버튼 컨테이너 렌더링
  const renderButtons = () => (
    <div style={{
      position: 'absolute',
      right: '12px',
      top: '12px',
      display: 'flex',
      gap: '4px',
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      maxWidth: '60%',
      justifyContent: 'flex-end'
    }}>
      <button
        onClick={handleCopy}
        style={{
          background: 'var(--vscode-button-background)',
          color: 'var(--vscode-button-foreground)',
          border: 'none',
          borderRadius: '4px',
          padding: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s ease',
        }}
        title="코드 복사"
      >
        <VscCopy size={18} />
      </button>
      <button
        onClick={handlePasteToEditor}
        style={{
          background: 'var(--vscode-editorInfo-foreground)',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s ease',
        }}
        title="메모리 파일시스템에 생성"
      >
        <VscFile size={18} />
      </button>
      <button
        onClick={handleSendToHelper}
        style={{
          background: 'var(--vscode-editorInfo-foreground)',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s ease',
        }}
        title="학습 도우미에게 전송"
      >
        <VscCommentDiscussion size={18} />
      </button>
    </div>
  );

  // 코드 블록 렌더링
  return (
    <div style={{ 
      position: 'relative',
      margin: '16px 0',
      fontSize: '1.1em'
    }}>
      <pre style={{
        position: 'relative',
        padding: '20px 20px 40px 20px',
        backgroundColor: 'var(--vscode-editor-background)',
        borderRadius: '6px',
        overflowX: 'auto',
        border: '1px solid var(--vscode-editor-lineHighlightBorder)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {renderButtons()}
        <code
          className={`hljs ${language}`}
          style={{
            display: 'block',
            paddingRight: '120px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            lineHeight: '1.6',
            fontSize: '1em',
            color: 'var(--vscode-editor-foreground)',
            marginTop: '30px'
          }}
          dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(value).value }}
        />
      </pre>
    </div>
  );
};

export default CodeBlock; 