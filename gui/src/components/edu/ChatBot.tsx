import React, { useState, useRef, useEffect } from 'react';

// Window 인터페이스에 vscode 속성 추가
declare global {
  interface Window {
    vscode: any;
  }
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  context?: string;
}

interface ChatContext {
  currentTopic?: string;
  messageHistory: Message[];
  lastUpdateTime: Date;
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
}

interface InputBadge {
  id: string;
  label: string;
  icon: string;
}

const CONTEXT_MENU_ITEMS: ContextMenuItem[] = [
  { id: 'prerequisites', label: '사전 요구사항', icon: '📋' },
  { id: 'objectives', label: '학습 목표', icon: '🎯' },
  { id: 'theory', label: '이론', icon: '📚' },
  { id: 'practice', label: '실습', icon: '💻' },
  { id: 'exercises', label: '연습 문제', icon: '✏️' },
  { id: 'all', label: '전체 내용', icon: '📑' }
];

function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const contextRef = useRef<ChatContext>({
    messageHistory: [],
    lastUpdateTime: new Date()
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [inputBadge, setInputBadge] = useState<InputBadge | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateContext = (newMessage: Message) => {
    const context = contextRef.current;
    context.messageHistory = [...context.messageHistory, newMessage].slice(-5);
    context.lastUpdateTime = new Date();

    if (newMessage.sender === 'user') {
      const keywords = {
        'HTML': ['html', 'tag', 'element', 'dom'],
        'CSS': ['css', 'style', 'design', 'layout'],
        'JavaScript': ['javascript', 'js', 'function', 'variable'],
      };

      const messageText = newMessage.text.toLowerCase();
      for (const [topic, words] of Object.entries(keywords)) {
        if (words.some(word => messageText.includes(word))) {
          context.currentTopic = topic;
          break;
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !inputBadge) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputBadge ? `${inputBadge.label}: ${inputText}` : inputText,
      sender: 'user',
      timestamp: new Date(),
      context: contextRef.current.currentTopic
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setInputBadge(null);
    updateContext(userMessage);

    window.vscode.postMessage({
      action: 'SEND_CHAT_MESSAGE',
      data: {
        message: userMessage.text,
        context: {
          currentTopic: contextRef.current.currentTopic,
          recentMessages: contextRef.current.messageHistory.map(m => ({
            text: m.text,
            sender: m.sender,
            timestamp: m.timestamp
          }))
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Backspace' && inputText === '' && inputBadge) {
      setInputBadge(null);
    }
  };

  const handleContextMenuItemClick = (item: ContextMenuItem) => {
    setInputBadge({
      id: item.id,
      label: item.label,
      icon: item.icon
    });
    setInputText('');
    setIsContextMenuOpen(false);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'BOT_RESPONSE') {
        const botMessage: Message = {
          id: Date.now().toString(),
          text: event.data.message,
          sender: 'bot',
          timestamp: new Date(),
          context: contextRef.current.currentTopic
        };
        setMessages(prev => [...prev, botMessage]);
        updateContext(botMessage);
      } else if (event.data.type === 'ADD_CONTEXT') {
        addContextToChat(event.data.context, event.data.category);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    // 1. 텍스트 드롭 처리
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'string' &&
            e.dataTransfer.items[i].type === 'text/plain') {
          e.dataTransfer.items[i].getAsString((text) => {
            // 텍스트 내용 분석하여 카테고리 추정
            const category = detectCategory(text);
            addContextToChat(text, category);
          });
        }
      }
    }

    // 2. 파일 드롭 처리
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // 파일 유형에 따른 처리
      if (file.type.startsWith('image/')) {
        // 이미지 파일 처리
        addSystemMessage(`이미지 파일 "${file.name}"이(가) 추가되었습니다.`);
        // 이미지 설명 생성 로직 (예: "이 이미지는 HTML 구조를 보여주는 다이어그램입니다")
      }
      else if (file.name.endsWith('.html') || file.name.endsWith('.js') || file.name.endsWith('.css')) {
        // 코드 파일 - 확장자로 언어 감지
        const extension = file.name.split('.').pop() || '';
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const content = event.target.result.toString();
            addContextToChat(content, extension.toUpperCase());
          }
        };
        reader.readAsText(file);
      }
      else if (file.type === 'application/pdf') {
        // PDF 파일 알림
        addSystemMessage(`PDF 파일은 아직 지원되지 않습니다: ${file.name}`);
      }
      else {
        // 일반 텍스트 파일
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            addContextToChat(event.target.result.toString());
          }
        };
        reader.readAsText(file);
      }
    }
  };

  // 카테고리 감지 함수
  const detectCategory = (text: string): string | undefined => {
    // HTML 감지
    if (text.includes('<html') || text.includes('<div') || text.includes('<body')) {
      return 'HTML';
    }
    // CSS 감지
    else if (text.includes('{') && (text.includes('margin:') || text.includes('padding:'))) {
      return 'CSS';
    }
    // JavaScript 감지
    else if (text.includes('function') || text.includes('const ') || text.includes('let ')) {
      return 'JavaScript';
    }
    return undefined;
  };

  // 시스템 메시지 추가 함수
  const addSystemMessage = (text: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'system',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const addContextToChat = (text: string, category?: string) => {
    const contextMessage: Message = {
      id: Date.now().toString(),
      text: "새로운 문맥이 추가되었습니다.",
      sender: 'system',
      timestamp: new Date(),
      context: text.substring(0, 50) + (text.length > 50 ? '...' : '')
    };

    window.vscode.postMessage({
      type: 'ADD_CONTEXT',
      context: text
    });

    setMessages(prev => [...prev, contextMessage]);
  };

  return (
    <div className={`chatbot ${isMinimized ? 'minimized' : ''}`}>
      <style>{`
        .chatbot {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 300px;
          height: 400px;
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          z-index: 9999;
        }

        .chatbot.minimized {
          width: 48px;
          height: 48px;
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: var(--vscode-editor-selectionBackground);
          border-bottom: 1px solid var(--vscode-panel-border);
        }

        .chatbot.minimized .chat-header {
          padding: 0;
          width: 100%;
          height: 100%;
        }

        .chat-title {
          font-weight: 500;
          color: var(--vscode-editor-foreground);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-title::before {
          content: '🤖';
          font-size: 16px;
        }

        .chatbot.minimized .chat-title {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .chatbot.minimized .chat-title::before {
          content: '🤖';
          font-size: 24px;
          margin: 0;
        }

        .chatbot.minimized .chat-title span {
          display: none;
        }

        .minimize-button {
          background: none;
          border: none;
          color: var(--vscode-editor-foreground);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
        }

        .chatbot.minimized .minimize-button {
          display: none;
        }

        .minimize-button:hover {
          opacity: 0.8;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          display: ${isMinimized ? 'none' : 'flex'};
        }

        .message {
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 12px;
          margin: 4px 0;
        }

        .user-message {
          align-self: flex-end;
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }

        .bot-message {
          align-self: flex-start;
          background-color: var(--vscode-editor-selectionBackground);
          color: var(--vscode-editor-foreground);
        }

        .chat-input {
          display: ${isMinimized ? 'none' : 'flex'};
          padding: 12px;
          border-top: 1px solid var(--vscode-panel-border);
          align-items: center;
          position: relative;
        }

        .chat-input textarea {
          flex: 1;
          padding: 8px;
          padding-right: 32px;
          border: 1px solid var(--vscode-input-border);
          border-radius: 4px;
          background-color: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          resize: none;
          height: 40px;
          padding-left: ${inputBadge ? '70px' : '8px'};
          line-height: 24px;
          width: 100%;
        }

        .chat-input button {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px 8px;
          background: none;
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          height: 24px;
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
        }

        .chat-input button:hover {
          opacity: 1;
        }

        .unread-badge {
          background-color: var(--vscode-badge-background);
          color: var(--vscode-badge-foreground);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 12px;
          margin-left: 8px;
          display: none;
        }

        .chatbot.minimized .unread-badge {
          display: ${messages.length > 0 ? 'flex' : 'none'};
          position: absolute;
          top: -5px;
          right: -5px;
          margin: 0;
          min-width: 18px;
          height: 18px;
          justify-content: center;
          align-items: center;
        }

        .current-topic {
          font-size: 12px;
          color: var(--vscode-badge-foreground);
          background-color: var(--vscode-badge-background);
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
        }

        .message-context {
          font-size: 10px;
          opacity: 0.7;
          display: block;
          margin-top: 4px;
        }

        .context-menu-button {
          background: none;
          border: none;
          color: var(--vscode-editor-foreground);
          cursor: pointer;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          border-radius: 4px;
          margin-right: 8px;
        }

        .context-menu-button:hover {
          background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .context-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 4px;
          min-width: 200px;
          z-index: 10000;
        }

        .context-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          color: var(--vscode-editor-foreground);
        }

        .context-menu-item:hover {
          background-color: var(--vscode-list-hoverBackground);
        }

        .context-menu-item-icon {
          font-size: 16px;
        }

        .context-menu-item-label {
          flex: 1;
        }

        .chatbot.minimized .context-menu-button {
          display: none;
        }

        .input-badge {
          display: flex;
          align-items: center;
          background-color: var(--vscode-badge-background);
          color: var(--vscode-badge-foreground);
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 9px;
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          max-width: 50px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 16px;
          line-height: 16px;
        }

        .input-badge-label {
          margin-right: 3px;
        }

        .input-badge-remove {
          cursor: pointer;
          font-size: 10px;
          margin-left: 0;
          opacity: 0.7;
        }

        .drop-zone {
          border: 2px dashed var(--vscode-panel-border);
          border-radius: 6px;
          padding: 12px;
          margin: 8px;
          text-align: center;
          font-size: 12px;
          color: var(--vscode-descriptionForeground);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .drop-zone.active {
          border-color: var(--vscode-focusBorder);
          background-color: var(--vscode-editor-hoverHighlightBackground);
        }

        .drop-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .supported-types {
          display: flex;
          gap: 8px;
          font-size: 10px;
        }

        .file-type {
          padding: 4px 8px;
          background-color: var(--vscode-badge-background);
          color: var(--vscode-badge-foreground);
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
      <div className="chat-header" onClick={() => isMinimized && setIsMinimized(false)}>
        <div className="chat-title">
          <span>학습 도우미</span>
          {contextRef.current.currentTopic && (
            <span className="current-topic">
              {contextRef.current.currentTopic}
            </span>
          )}
          <span className="unread-badge">{messages.length}</span>
        </div>
        {!isMinimized && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button
                className="context-menu-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsContextMenuOpen(!isContextMenuOpen);
                }}
              >
                <span>📝</span>
                <span>문맥 추가</span>
              </button>
              {isContextMenuOpen && (
                <div className="context-menu">
                  {CONTEXT_MENU_ITEMS.map(item => (
                    <div
                      key={item.id}
                      className="context-menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenuItemClick(item);
                      }}
                    >
                      <span className="context-menu-item-icon">{item.icon}</span>
                      <span className="context-menu-item-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className="minimize-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
            >
              ▼
            </button>
          </div>
        )}
      </div>
      <div className="chat-messages">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : message.sender === 'bot' ? 'bot-message' : 'system-message'}`}
          >
            {message.text}
            {message.context && (
              <span className="message-context">
                Topic: {message.context}
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        {inputBadge && (
          <div className="input-badge">
            <span className="input-badge-label">{inputBadge.label}</span>
            <span
              className="input-badge-remove"
              onClick={() => setInputBadge(null)}
            >
              ✕
            </span>
          </div>
        )}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문하세요..."
        />
        <button onClick={handleSendMessage}>
          →
        </button>
      </div>
      {!isMinimized && (
        <div
          className={`drop-zone ${isDragOver ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-icon">📄</div>
          <p>교육 자료를 여기에 끌어다 놓으세요</p>
          <div className="supported-types">
            <span className="file-type">📝 텍스트</span>
            <span className="file-type">💻 코드</span>
            <span className="file-type">🖼️ 이미지</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;
