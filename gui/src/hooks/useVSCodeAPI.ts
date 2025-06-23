import { useState, useEffect, useCallback } from 'react';

// VSCode API 타입 정의
interface VSCodeAPI {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
}

// 전역 Window 타입 확장
declare global {
  interface Window {
    acquireVsCodeApi?: () => VSCodeAPI;
    vscodeApi?: VSCodeAPI;
    ide?: "vscode" | undefined;
  }
}

// 전역 VSCode API 인스턴스 (한 번만 생성)
let globalVSCodeAPI: VSCodeAPI | null = null;

/**
 * VSCode API를 안전하게 획득하는 함수
 */
const getVSCodeAPI = (): VSCodeAPI | null => {
  try {
    // 이미 초기화된 API가 있다면 재사용
    if (globalVSCodeAPI) {
      return globalVSCodeAPI;
    }

    // VSCode 환경 체크
    if (typeof window === 'undefined') {
      console.warn("Window object not available");
      return null;
    }

    // 미리 초기화된 VSCode API 확인
    if (window.vscodeApi) {
      globalVSCodeAPI = window.vscodeApi;
      console.debug("Using pre-initialized VSCode API");
      return globalVSCodeAPI;
    }

    // acquireVsCodeApi 함수 존재 여부 확인
    if (typeof window.acquireVsCodeApi !== 'function') {
      console.debug("acquireVsCodeApi is not available - not in VSCode webview context");
      return null;
    }

    // VSCode API 획득 시도
    const vscodeApi = window.acquireVsCodeApi();
    
    if (!vscodeApi) {
      console.warn("Failed to acquire VSCode API - returned null");
      return null;
    }

    // 전역 인스턴스에 저장 (한 번만 생성)
    globalVSCodeAPI = vscodeApi;
    console.debug("Successfully acquired VSCode API");
    return vscodeApi;
  } catch (error) {
    console.error("Could not acquire vscode API:", error);
    return null;
  }
};

/**
 * VSCode API 준비 상태를 확인하는 함수
 */
const waitForVSCodeAPI = (maxRetries: number = 10, delay: number = 100): Promise<VSCodeAPI | null> => {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const checkAPI = () => {
      const api = getVSCodeAPI();
      if (api) {
        resolve(api);
        return;
      }
      
      attempts++;
      if (attempts >= maxRetries) {
        console.debug(`VSCode API not available after ${maxRetries} attempts`);
        resolve(null);
        return;
      }
      
      setTimeout(checkAPI, delay);
    };
    
    checkAPI();
  });
};

/**
 * VSCode API를 관리하는 커스텀 훅
 */
export const useVSCodeAPI = () => {
  const [vscode, setVscode] = useState<VSCodeAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVSCodeEnv, setIsVSCodeEnv] = useState(false);

  useEffect(() => {
    const initializeVSCodeAPI = async () => {
      try {
        setIsLoading(true);
        
        // VSCode 환경 확인
        const isVSCode = window.ide === 'vscode' || typeof window.acquireVsCodeApi === 'function';
        setIsVSCodeEnv(isVSCode);
        
        if (isVSCode) {
          const api = await waitForVSCodeAPI();
          if (api) {
            setVscode(api);
            console.log("VSCode API initialized successfully");
          } else {
            console.warn("VSCode API initialization failed");
          }
        } else {
          console.debug("Not running in VSCode environment");
        }
      } catch (error) {
        console.error("Error initializing VSCode API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeVSCodeAPI();
  }, []);

  // VSCode에 메시지를 안전하게 전송하는 함수
  const postMessage = useCallback((message: any) => {
    if (vscode) {
      try {
        vscode.postMessage(message);
        return true;
      } catch (error) {
        console.error("Failed to send message to VSCode:", error);
        return false;
      }
    }
    console.debug("VSCode API not available - message not sent:", message);
    return false;
  }, [vscode]);

  // 테마 정보를 요청하는 함수
  const requestTheme = useCallback(() => {
    if (vscode) {
      try {
        // 새 형식으로 요청
        vscode.postMessage({ messageType: 'request-theme' });
        
        // 이전 형식도 함께 요청 (하위 호환성)
        setTimeout(() => {
          vscode.postMessage({ type: 'request-theme' });
        }, 300);
        
        return true;
      } catch (error) {
        console.error("Failed to request theme from VSCode:", error);
        return false;
      }
    }
    return false;
  }, [vscode]);

  // 로그 메시지를 VSCode에 전송하는 함수
  const sendLog = useCallback((level: string, message: string) => {
    return postMessage({
      type: 'webviewLog',
      level,
      message
    });
  }, [postMessage]);

  return {
    vscode,
    isLoading,
    isVSCodeEnv,
    postMessage,
    requestTheme,
    sendLog
  };
};

export default useVSCodeAPI;