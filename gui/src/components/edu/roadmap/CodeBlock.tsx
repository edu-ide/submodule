import React, { useContext, useState } from 'react';
import { VscCopy, VscFile, VscCommentDiscussion, VscCode, VscTerminal } from 'react-icons/vsc';
import hljs from 'highlight.js';
import { IdeMessengerContext } from '@/context/IdeMessenger';

interface CodeBlockProps {
  language: string;
  value: string;
}

interface ThemeStyles {
  background: string;
  color: string;
  border: string;
  buttonBackground: string;
  buttonColor: string;
  buttonHoverBackground: string;
  actionButtonBackground: string;
  actionButtonColor: string;
  actionButtonHoverBackground: string;
  boxShadow: string;
  headerBackground: string;
  headerColor: string;
  terminalBackground: string;
}

const themes: { [key: string]: ThemeStyles } = {
  light: {
    background: '#ffffff',
    color: '#333333',
    border: '1px solid #e0e0e0',
    buttonBackground: '#f0f0f0',
    buttonColor: '#666666',
    buttonHoverBackground: '#e0e0e0',
    actionButtonBackground: '#0066cc',
    actionButtonColor: '#ffffff',
    actionButtonHoverBackground: '#0052a3',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    headerBackground: '#f8f9fa',
    headerColor: '#666666',
    terminalBackground: '#1e1e1e'
  },
  dark: {
    background: '#1e1e1e',
    color: '#d4d4d4',
    border: '1px solid #404040',
    buttonBackground: '#333333',
    buttonColor: '#d4d4d4',
    buttonHoverBackground: '#404040',
    actionButtonBackground: '#0066cc',
    actionButtonColor: '#ffffff',
    actionButtonHoverBackground: '#0052a3',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    headerBackground: '#252526',
    headerColor: '#cccccc',
    terminalBackground: '#1e1e1e'
  }
};

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language, 
  value
}) => {
  const ideMessenger = useContext(IdeMessengerContext);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const theme = themes[currentTheme];
  
  const isTerminal = language === 'bash' || language === 'shell' || language === 'sh';

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



  const buttonStyle = (isAction: boolean = false) => ({
    background: isAction ? theme.actionButtonBackground : theme.buttonBackground,
    color: isAction ? theme.actionButtonColor : theme.buttonColor,
    border: 'none',
    borderRadius: '4px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    ':hover': {
      background: isAction ? theme.actionButtonHoverBackground : theme.buttonHoverBackground,
    }
  });

  const renderHeader = () => (
    <div style={{
      background: theme.headerBackground,
      color: theme.headerColor,
      padding: '8px 16px',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottom: theme.border,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9em'
    }}>
      {isTerminal ? <VscTerminal size={16} /> : <VscCode size={16} />}
      <span>{isTerminal ? '터미널' : `${language} 코드`}</span>
    </div>
  );

  const renderButtons = () => (
    <div style={{
      position: 'absolute',
      right: '12px',
      top: '12px',
      display: 'flex',
      gap: '8px',
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      maxWidth: '60%',
      justifyContent: 'flex-end'
    }}>
      <button
        onClick={handleCopy}
        style={buttonStyle(true)}
        title="코드 복사"
      >
        <VscCopy size={18} />
      </button>
      <button
        onClick={handlePasteToEditor}
        style={buttonStyle()}
        title="메모리 파일시스템에 생성"
      >
        <VscFile size={18} />
      </button>
      <button
        onClick={handleSendToHelper}
        style={buttonStyle()}
        title="학습 도우미에게 전송"
      >
        <VscCommentDiscussion size={18} />
      </button>
 
    </div>
  );

  return (
    <div style={{ 
      position: 'relative',
      margin: '16px 0',
      fontSize: '1.1em'
    }}>
      <div style={{
        border: theme.border,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: theme.boxShadow
      }}>
        {renderHeader()}
        <pre style={{
          position: 'relative',
          padding: '20px 20px 40px 20px',
          backgroundColor: isTerminal ? theme.terminalBackground : theme.background,
          color: theme.color,
          margin: 0,
          overflowX: 'auto'
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
              color: isTerminal ? '#ffffff' : theme.color,
              marginTop: '30px'
            }}
            dangerouslySetInnerHTML={{ 
              __html: hljs.highlightAuto(value, [language]).value 
            }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock; 