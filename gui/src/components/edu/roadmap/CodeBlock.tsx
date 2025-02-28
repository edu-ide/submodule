import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VscCopy, VscOpenPreview, VscFile, VscCommentDiscussion, VscPlay, VscClearAll } from 'react-icons/vsc';
import hljs from 'highlight.js';
import { IdeMessengerContext } from '@/context/IdeMessenger';
import { addOutput, clearOutput, removeCodeBlock, initializeCodeBlock } from '../../../redux/codeBlockSlice';
import { RootState, store } from '../../../redux/store';

interface CodeBlockProps {
  language: string;
  value: string;
  blockId: string;
  pyodideState: {
    instance: any;
    status: 'loading' | 'ready' | 'error';
  };
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language, 
  value,
  blockId,
  pyodideState
}) => {
  const dispatch = useDispatch();
  const [isExecuting, setIsExecuting] = useState(false);
  const isInitializedRef = useRef(false);
  const mountedRef = useRef(true);
  
  const codeBlock = useSelector((state: RootState) => 
    state.codeBlocks[blockId]
  );
  
  const outputHistory = codeBlock?.outputHistory || [];

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    mountedRef.current = true;
    
    if (!codeBlock && !isInitializedRef.current) {
      dispatch(initializeCodeBlock(blockId));
      isInitializedRef.current = true;
    }
    
    return () => {
      mountedRef.current = false;
      if (isExecuting) {
        setIsExecuting(false);
      }
    };
  }, [blockId, dispatch, codeBlock, isExecuting]);

  // Python 환경 초기화
  useEffect(() => {
    let isMounted = true;
    
    const initializePythonEnv = async () => {
      if (!mountedRef.current) return;
      
      if (pyodideState.status === 'ready' && pyodideState.instance) {
        try {
          await pyodideState.instance.runPythonAsync(`
            import sys
            from io import StringIO
            import pyodide_http
            pyodide_http.patch_all()
          `);
        } catch (error) {
          if (mountedRef.current) {
            console.error('Python 환경 초기화 실패:', error);
          }
        }
      }
    };

    initializePythonEnv();
    
    return () => {
      isMounted = false;
    };
  }, [pyodideState.status, pyodideState.instance]);

  const updateOutput = (newText: string, type: 'success' | 'error' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    dispatch(addOutput({
      blockId,
      log: {
        timestamp,
        text: newText,
        type
      }
    }));
  };

  const handleRunCode = async () => {
    if (isExecuting) {
      updateOutput('\n⚠️ 이미 코드가 실행 중입니다', 'info');
      return;
    }

    if (pyodideState.status !== 'ready' || !pyodideState.instance) {
      updateOutput('\n⚠️ Python 환경을 사용할 수 없는 상태입니다', 'error');
      return;
    }

    setIsExecuting(true);

    try {
      // 실행 환경 초기화
      await pyodideState.instance.runPythonAsync(`
        sys.stdout = StringIO()
        sys.stderr = StringIO()
        
        import os
        if not os.path.exists('/virtual_fs'):
            os.makedirs('/virtual_fs', exist_ok=True)
        os.chdir('/virtual_fs')
      `);

      // 코드 실행
      await pyodideState.instance.runPythonAsync(`
        try:
            ${value}
        except Exception as e:
            import traceback
            traceback_str = traceback.format_exc()
            print(f"\\n❌ 에러 발생:\\n{traceback_str}")
            raise
      `);
      
      // 출력 결과 가져오기
      const stdoutOutput = await pyodideState.instance.runPythonAsync("sys.stdout.getvalue()");
      const outputText = stdoutOutput ? stdoutOutput.toString() : '출력 없음';
      updateOutput(`\n✅ 결과:\n${outputText}`, 'success');

    } catch (err) {
      const stderrOutput = await pyodideState.instance.runPythonAsync("sys.stderr.getvalue()");
      const errorMsg = stderrOutput ? stderrOutput.toString() 
                     : err instanceof Error ? err.message 
                     : '알 수 없는 오류';
      updateOutput(`\n❌ 시스템 에러:\n${errorMsg}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const ideMessenger = useContext(IdeMessengerContext);

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
      .then(() => alert('코드가 복사되었습니다!'))
      .catch(err => console.error('복사 실패:', err));
  };

  const handlePasteToEditor = () => {
    ideMessenger.post('createPracticeWorkspace', {
      url: "http://localhost:9000/edu/content/test/test2.zip"
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

  const handleClearOutput = useCallback(() => {
      try {
        dispatch(clearOutput(blockId));
        dispatch(removeCodeBlock(blockId));
        dispatch(initializeCodeBlock(blockId));
      } catch (error) {
        console.error('기록 지우기 실패:', error);
        alert('기록 삭제에 실패했습니다. 다시 시도해주세요.');
      }
  }, [blockId, dispatch]);

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
          opacity: isExecuting ? 0.7 : 1,
        }}
        disabled={isExecuting}
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
          opacity: isExecuting ? 0.7 : 1,
        }}
        disabled={isExecuting}
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
          opacity: isExecuting ? 0.7 : 1,
        }}
        disabled={isExecuting}
        title="학습 도우미에게 전송"
      >
        <VscCommentDiscussion size={18} />
      </button>
      <button
        onClick={handleRunCode}
        style={{
          background: isExecuting ? '#666' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px',
          cursor: isExecuting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s ease'
        }}
        disabled={isExecuting}
        title={isExecuting ? "실행 중..." : "코드 실행"}
      >
        <VscPlay size={18} />
      </button>
    </div>
  );

  // 실행 기록이 없어도 코드 블록은 항상 렌더링
  const renderCodeBlock = () => (
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
  );

  return (
    <div style={{ 
      position: 'relative',
      margin: '16px 0',
      fontSize: '1.1em'
    }}>
      {renderCodeBlock()}
      {outputHistory.length > 0 && (
        <div style={{ 
          marginTop: '10px',
          padding: '10px',
          backgroundColor: 'var(--vscode-editor-background)',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid var(--vscode-inputValidation-infoBorder)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <strong>실행 기록 ({outputHistory.length}개)</strong>
            <button 
              onClick={handleClearOutput}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--vscode-icon-foreground)',
                cursor: 'pointer',
                padding: '4px',
                opacity: isExecuting ? 0.7 : 1,
              }}
              disabled={isExecuting}
              title="기록 지우기"
            >
              <VscClearAll size={16} />
            </button>
          </div>
          {outputHistory.map((log, index) => (
            <pre 
              key={`${blockId}-${index}-${log.timestamp}`}
              style={{ 
                margin: '5px 0',
                padding: '10px',
                backgroundColor: log.type === 'error'
                  ? 'var(--vscode-inputValidation-errorBackground)' 
                  : 'var(--vscode-inputValidation-infoBackground)',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: log.type === 'error'
                  ? 'var(--vscode-errorForeground)' 
                  : log.type === 'success'
                  ? 'var(--vscode-terminal-ansiGreen)'
                  : 'var(--vscode-terminal-ansiBrightBlue)'
              }}
            >
              [{log.timestamp}] {log.text}
            </pre>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeBlock; 