import React, { useEffect, useState, ReactNode, useCallback, useRef, lazy, Suspense, useContext } from 'react';
import { Navigate, useParams, RouteObject, useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@microblog/components/ThemeProvider';
import MainLayout from '@microblog/components/template/layout/MainLayout';
import { darkTheme, lightTheme } from '@microblog/styles/theme';
import GlobalStyle from '@microblog/styles/GlobalStyle';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from '@microblog/components/atoms/feedback/LoadingScreen/LoadingScreen';
import LearnEntryWrapper from '../components/edu/LearnEntryWrapper'; // LearnEntryWrapper 임포트 추가

// VSCode 테마 감지 및 연동을 위한 글로벌 이벤트 리스너
declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
    ide?: "vscode" | undefined;
  }
}

// vscode api를 안전하게 가져오는 함수
const getVSCodeAPI = () => {
  try {
    // @ts-ignore
    return window.acquireVsCodeApi();
  } catch (error) {
    console.error("Could not acquire vscode API:", error);
    return null;
  }
};

// 색상이 어두운지 판단하는 함수
const isColorDark = (color: string): boolean => {
  // 헥스 포맷 (#RRGGBB)
  if (color.startsWith('#')) {
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    // 휘도 계산 (인간의 눈은 녹색에 더 민감)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  // RGB 포맷 (rgb(r, g, b))
  if (color.startsWith('rgb')) {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
  }
  // 기본적으로 라이트 테마로 가정
  return false;
};

// @microblog 경로 사용
// import LoginPage from '@microblog/components/pages/auth/LoginPage/LoginPage'; // 주석 처리 또는 삭제
// import SignupPage from '@microblog/components/pages/auth/SignupPage/SignupPage'; // 주석 처리 또는 삭제
// // 각 페이지 컴포넌트를 개별적으로 임포트
// import { HomePage } from '@microblog/components/pages/main'; // 주석 처리 또는 삭제
// import { NotificationsPage } from '@microblog/components/pages/communication'; // 주석 처리 또는 삭제
// import { PostPage } from '@microblog/components/pages/post'; // 주석 처리 또는 삭제
// import ExplorePage from '@microblog/components/pages/discovery/ExplorePage/Explore'; // 주석 처리 또는 삭제
// import SettingsPage from '@microblog/components/pages/system/SettingsPage'; // 주석 처리 또는 삭제
// import DiscoverPage from '@microblog/components/pages/discovery/DiscoverPage'; // 주석 처리 또는 삭제
// import MessagesPage from '@microblog/components/pages/communication/MessagesPage'; // 주석 처리 또는 삭제
// import ProfilePage from '@microblog/components/pages/user/ProfilePage'; // 주석 처리 또는 삭제
// import ProfileEditPage from '@microblog/components/pages/user/ProfileEditPage'; // 주석 처리 또는 삭제
// import ProjectUploadPage from '@microblog/components/pages/project/ProjectUploadPage/ProjectUploadPage'; // 주석 처리 또는 삭제
// import ProjectDetailPage from '@microblog/components/pages/project/ProjectDetailPage/ProjectDetailPage'; // 주석 처리 또는 삭제
// import SharePage from '@microblog/components/pages/project/SharePage/SharePage'; // 주석 처리 또는 삭제

// React.lazy를 사용한 페이지 컴포넌트 지연 로딩
const LoginPage = lazy(() => import('@microblog/components/pages/auth/LoginPage/LoginPage'));
const SignupPage = lazy(() => import('@microblog/components/pages/auth/SignupPage/SignupPage'));
const HomePage = lazy(() => import('@microblog/components/pages/main').then(module => ({ default: module.HomePage }))); // HomePage는 named export일 수 있음
const NotificationsPage = lazy(() => import('@microblog/components/pages/communication').then(module => ({ default: module.NotificationsPage }))); // NotificationsPage는 named export일 수 있음
const PostPage = lazy(() => import('@microblog/components/pages/post').then(module => ({ default: module.PostPage }))); // PostPage는 named export일 수 있음
const ExplorePage = lazy(() => import('@microblog/components/pages/discovery/ExplorePage/Explore'));
const SettingsPage = lazy(() => import('@microblog/components/pages/system/SettingsPage'));
const DiscoverPage = lazy(() => import('@microblog/components/pages/discovery/DiscoverPage'));
const MessagesPage = lazy(() => import('@microblog/components/pages/communication/MessagesPage'));
const ProfilePage = lazy(() => import('@microblog/components/pages/user/ProfilePage'));
const ProfileEditPage = lazy(() => import('@microblog/components/pages/user/ProfileEditPage'));
const ProjectUploadPage = lazy(() => import('@microblog/components/pages/project/ProjectUploadPage/ProjectUploadPage'));
const ProjectDetailPage = lazy(() => import('@microblog/components/pages/project/ProjectDetailPage/ProjectDetailPage'));
const SharePage = lazy(() => import('@microblog/components/pages/project/SharePage/SharePage'));

// React.lazy를 사용한 페이지 컴포넌트 지연 로딩 (education)
// const LazyEducationLayout = lazy(() => import('../components/edu/EducationLayout')); // 제거
const CoursesPage = lazy(() => import('@microblog/components/pages/CoursesPage'));
const CourseCreatePage = lazy(() => import('@microblog/components/pages/CourseCreatePage'));
const CourseEditPage = lazy(() => import('@microblog/components/pages/CourseEditPage'));
const CourseDetailPage = lazy(() => import('@microblog/components/pages/CourseDetailPage'));
const CourseReviewsPage = lazy(() => import('@microblog/components/pages/CourseReviewsPage'));
const LecturePage = lazy(() => import('@microblog/components/pages/LecturePage'));
const RoadmapDetailPage = lazy(() => import('@microblog/components/pages/RoadmapDetailPage'));

// 나머지는 스텁 컴포넌트 사용
const ForgotPasswordPage = () => <div>비밀번호 찾기 페이지</div>;

// VSCode 테마를 감지하여 ThemeProvider에 전달하는 래퍼 컴포넌트
const VSCodeThemedMainLayout = ({ children }: { children: any }) => {
  const location = useLocation();
  const vscode = getVSCodeAPI(); // vscode API 가져오기

  useEffect(() => {
    const logMessage = `[VSCodeThemedMainLayout] Current Path: ${location.pathname}`;
    console.log(logMessage); // 웹뷰 개발자 도구용 로그 (유지)

    // 확장 호스트로 로그 메시지 전송
    if (vscode) {
      vscode.postMessage({
        type: 'webviewLog', // 메시지 타입 지정
        message: logMessage
      });
    }
  }, [location.pathname, vscode]); // vscode 추가

  // 테마 감지 로직 개선
  const detectInitialTheme = useCallback((): 'light' | 'dark' => {
    // 감지 결과를 저장할 변수들
    const results: { method: string; result: 'light' | 'dark'; priority: number }[] = [];

    // 1. VSCode 클래스 확인 (우선순위: 높음)
    const bodyHasDarkClass = document.body.classList.contains('vscode-dark') ||
      document.body.classList.contains('vscode-high-contrast');
    results.push({
      method: 'vscode-class',
      result: bodyHasDarkClass ? 'dark' : 'light',
      priority: 4
    });

    // 2. CSS 변수 확인 (우선순위: 가장 높음)
    try {
      const editorBg = getComputedStyle(document.documentElement)
        .getPropertyValue('--vscode-editor-background')
        .trim();

      if (editorBg) {
        results.push({
          method: 'css-variable',
          result: isColorDark(editorBg) ? 'dark' : 'light',
          priority: 5
        });
      }
    } catch (e) {
      // CSS 변수 확인 중 오류 처리
    }

    // 3. HTML/Body 테마 클래스 확인 (우선순위: 중간)
    const htmlHasDarkClass = document.documentElement.classList.contains('dark');
    const htmlHasLightClass = document.documentElement.classList.contains('light');
    const bodyHasDarkThemeClass = document.body.classList.contains('dark');
    const bodyHasLightThemeClass = document.body.classList.contains('light');

    if (htmlHasDarkClass || bodyHasDarkThemeClass) {
      results.push({
        method: 'theme-class',
        result: 'dark',
        priority: 3
      });
    } else if (htmlHasLightClass || bodyHasLightThemeClass) {
      results.push({
        method: 'theme-class',
        result: 'light',
        priority: 3
      });
    }

    // 4. HTML 또는 BODY 배경색 확인 (우선순위: 낮음)
    try {
      const bodyBgColor = getComputedStyle(document.body).backgroundColor;
      if (bodyBgColor && bodyBgColor !== 'transparent') {
        results.push({
          method: 'body-bg-color',
          result: isColorDark(bodyBgColor) ? 'dark' : 'light',
          priority: 2
        });
      }

      const htmlBgColor = getComputedStyle(document.documentElement).backgroundColor;
      if (htmlBgColor && htmlBgColor !== 'transparent') {
        results.push({
          method: 'html-bg-color',
          result: isColorDark(htmlBgColor) ? 'dark' : 'light',
          priority: 1
        });
      }
    } catch (e) {
      // 배경색 확인 중 오류 처리
    }

    // 우선순위에 따라 정렬하고 가장 높은 우선순위의 결과 반환
    if (results.length > 0) {
      results.sort((a, b) => b.priority - a.priority);
      const topResult = results[0];
      return topResult.result;
    }

    // 기본값 (감지 실패 시)
    return 'light';
  }, []);

  // 기본값을 동적으로 설정 (컴포넌트 첫 렌더링 전)
  const [vsCodeTheme, setVSCodeTheme] = useState<'light' | 'dark'>(() => detectInitialTheme());
  const updatingRef = useRef(false); // 레퍼런스로 업데이트 상태 추적 (비동기 문제 방지)

  // 테마 설정 함수
  const setTheme = useCallback((newTheme: 'light' | 'dark', source: string) => {
    // 레퍼런스를 통한 업데이트 상태 확인
    if (updatingRef.current) {
      return;
    }

    setVSCodeTheme(prev => {
      if (prev !== newTheme) {
        updatingRef.current = true;

        // 테마 변경 완료 후 일정 시간 후에 업데이트 상태 해제
        const timeoutId = setTimeout(() => {
          updatingRef.current = false;
        }, 800); // 테마 전환에 충분한 시간을 줍니다

        return newTheme;
      }
      return prev;
    });
  }, []);

  // 테마 상태를 모든 레이어에 동기화하는 함수
  const syncThemeState = useCallback((theme: 'light' | 'dark') => {
    // 이미 업데이트 중이면 중복 방지
    if (updatingRef.current) return;

    updatingRef.current = true;

    // 트랜지션 일시 중지
    document.documentElement.style.setProperty('transition', 'none');

    try {
      // 1. HTML/Body 클래스 적용
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);

      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);

      // 2. VSCode 클래스 적용
      if (theme === 'dark') {
        document.body.classList.add('vscode-dark');
        document.body.classList.remove('vscode-light');
      } else {
        document.body.classList.add('vscode-light');
        document.body.classList.remove('vscode-dark');
      }

      // 아래 직접 스타일 설정 로직 제거
      /*
      // 3. 적용할 테마 객체 가져오기
      const themeObj = theme === 'dark' ? darkTheme : lightTheme;

      // 4. CSS 변수 적용
      document.body.style.setProperty('--theme-bg', themeObj.background);
      document.body.style.setProperty('--theme-text', themeObj.text);
      document.body.style.setProperty('--theme-border', themeObj.border);
      document.body.style.setProperty('--theme-paper', themeObj.paper);

      // 5. 폴백 스타일 적용
      document.body.style.backgroundColor = themeObj.background;
      document.body.style.color = themeObj.text;
      */
    } catch (e) {
      // 테마 동기화 오류 처리 (클래스 적용 중 오류 발생 시)
      console.error("Error syncing theme state (class application):", e);
    }

    // 트랜지션 복원
    setTimeout(() => {
      document.documentElement.style.setProperty('transition', '');

      // 업데이트 상태 해제
      setTimeout(() => {
        updatingRef.current = false;
      }, 200);
    }, 50);
  }, []);

  // 초기 설정 및 이벤트 리스너
  useEffect(() => {
    // 초기 테마 감지 및 적용
    const initialTheme = detectInitialTheme();

    // 초기 테마 동기화 (모든 레이어에 일관되게 적용)
    syncThemeState(initialTheme);

    // VSCode 테마 변경 메시지 수신 설정
    const handleThemeChange = (event: MessageEvent) => {
      const message = event.data;

      // messageType이 'theme-changed'인 경우 (익스텐션에서 보내는 형식)
      if (message && message.messageType === 'theme-changed' && message.data) {
        const themeInfo = message.data;
        const newTheme = themeInfo.kind === 'dark' || themeInfo.kind === 'high-contrast' ? 'dark' : 'light';
        syncThemeState(newTheme);
      }
      // type이 'theme-changed'인 경우 (예전 형식 지원)
      else if (message && message.type === 'theme-changed') {
        const newTheme = message.theme === 'dark' ? 'dark' : 'light';
        syncThemeState(newTheme);
      }
    };

    window.addEventListener('message', handleThemeChange);

    // VSCode API를 사용하여 현재 테마 요청
    const vscodeApi = getVSCodeAPI();
    if (vscodeApi) {
      // 현재 익스텐션에서 지원하는 형식으로 요청
      vscodeApi.postMessage({ messageType: 'request-theme' });
      // 예전 형식도 함께 요청 (하위 호환성)
      setTimeout(() => {
        vscodeApi.postMessage({ type: 'request-theme' });
      }, 300);
    }

    // 테마 변경 자동 감지 - body 클래스 변경 감시
    const bodyObserver = new MutationObserver((mutations) => {
      // 업데이트 중이면 MutationObserver 이벤트를 무시
      if (updatingRef.current) {
        return;
      }

      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          // 클래스 변경이 내부 로직에 의한 것인지 확인
          const isDarkTheme = document.body.classList.contains('vscode-dark') ||
            document.body.classList.contains('vscode-high-contrast');
          const newTheme = isDarkTheme ? 'dark' : 'light';

          // 현재 테마와 다른 경우에만 동기화
          if (newTheme !== vsCodeTheme) {
            syncThemeState(newTheme);
          }
        }
      }
    });

    bodyObserver.observe(document.body, { attributes: true });

    return () => {
      window.removeEventListener('message', handleThemeChange);
      bodyObserver.disconnect();
    };
  }, [detectInitialTheme, syncThemeState, vsCodeTheme]);

  // VSCode 환경인지 확인 (window.ide 전역 변수 사용)
  const isVSCodeEnv = window.ide === 'vscode';
  console.log('isVSCodeEnv', isVSCodeEnv);
  return (
    <ThemeProvider initialTheme={vsCodeTheme} isVSCodeThemed={true}>
      <GlobalStyle />
      {/* <Toaster position="bottom-center" /> */}
      <MainLayout isVSCodeEnv={isVSCodeEnv}>
        <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
      </MainLayout>
    </ThemeProvider>
  );
};

// 로그인/회원가입 페이지를 위한 MainLayout 없는 레이아웃 컴포넌트
const VSCodeThemedOnlyLayout = ({ children }: { children: any }) => {
  const location = useLocation();
  const vscode = getVSCodeAPI(); // vscode API 가져오기

  useEffect(() => {
    const logMessage = `[VSCodeThemedOnlyLayout] Current Path: ${location.pathname}`;
    console.log(logMessage); // 웹뷰 개발자 도구용 로그 (유지)

    // 확장 호스트로 로그 메시지 전송
    if (vscode) {
      vscode.postMessage({
        type: 'webviewLog', // 메시지 타입 지정
        message: logMessage
      });
    }
  }, [location.pathname, vscode]); // vscode 추가

  // 테마 감지 로직 개선
  const detectInitialTheme = useCallback((): 'light' | 'dark' => {
    // 감지 결과를 저장할 변수들
    const results: { method: string; result: 'light' | 'dark'; priority: number }[] = [];

    // 1. VSCode 클래스 확인 (우선순위: 높음)
    const bodyHasDarkClass = document.body.classList.contains('vscode-dark') ||
      document.body.classList.contains('vscode-high-contrast');
    results.push({
      method: 'vscode-class',
      result: bodyHasDarkClass ? 'dark' : 'light',
      priority: 4
    });

    // 2. CSS 변수 확인 (우선순위: 가장 높음)
    try {
      const editorBg = getComputedStyle(document.documentElement)
        .getPropertyValue('--vscode-editor-background')
        .trim();

      if (editorBg) {
        results.push({
          method: 'css-variable',
          result: isColorDark(editorBg) ? 'dark' : 'light',
          priority: 5
        });
      }
    } catch (e) {
      // CSS 변수 확인 중 오류 처리
    }

    // 3. HTML/Body 테마 클래스 확인 (우선순위: 중간)
    const htmlHasDarkClass = document.documentElement.classList.contains('dark');
    const htmlHasLightClass = document.documentElement.classList.contains('light');
    const bodyHasDarkThemeClass = document.body.classList.contains('dark');
    const bodyHasLightThemeClass = document.body.classList.contains('light');

    if (htmlHasDarkClass || bodyHasDarkThemeClass) {
      results.push({
        method: 'theme-class',
        result: 'dark',
        priority: 3
      });
    } else if (htmlHasLightClass || bodyHasLightThemeClass) {
      results.push({
        method: 'theme-class',
        result: 'light',
        priority: 3
      });
    }

    // 4. HTML 또는 BODY 배경색 확인 (우선순위: 낮음)
    try {
      const bodyBgColor = getComputedStyle(document.body).backgroundColor;
      if (bodyBgColor && bodyBgColor !== 'transparent') {
        results.push({
          method: 'body-bg-color',
          result: isColorDark(bodyBgColor) ? 'dark' : 'light',
          priority: 2
        });
      }

      const htmlBgColor = getComputedStyle(document.documentElement).backgroundColor;
      if (htmlBgColor && htmlBgColor !== 'transparent') {
        results.push({
          method: 'html-bg-color',
          result: isColorDark(htmlBgColor) ? 'dark' : 'light',
          priority: 1
        });
      }
    } catch (e) {
      // 배경색 확인 중 오류 처리
    }

    // 우선순위에 따라 정렬하고 가장 높은 우선순위의 결과 반환
    if (results.length > 0) {
      results.sort((a, b) => b.priority - a.priority);
      const topResult = results[0];
      return topResult.result;
    }

    // 기본값 (감지 실패 시)
    return 'light';
  }, []);

  // 기본값을 동적으로 설정 (컴포넌트 첫 렌더링 전)
  const [vsCodeTheme, setVSCodeTheme] = useState<'light' | 'dark'>(() => detectInitialTheme());
  const updatingRef = useRef(false); // 레퍼런스로 업데이트 상태 추적 (비동기 문제 방지)

  // 테마 설정 함수
  const setTheme = useCallback((newTheme: 'light' | 'dark', source: string) => {
    // 레퍼런스를 통한 업데이트 상태 확인
    if (updatingRef.current) {
      return;
    }

    setVSCodeTheme(prev => {
      if (prev !== newTheme) {
        updatingRef.current = true;

        // 테마 변경 완료 후 일정 시간 후에 업데이트 상태 해제
        const timeoutId = setTimeout(() => {
          updatingRef.current = false;
        }, 800); // 테마 전환에 충분한 시간을 줍니다

        return newTheme;
      }
      return prev;
    });
  }, []);

  // 테마 상태를 모든 레이어에 동기화하는 함수
  const syncThemeState = useCallback((theme: 'light' | 'dark') => {
    // 이미 업데이트 중이면 중복 방지
    if (updatingRef.current) return;

    updatingRef.current = true;

    // 트랜지션 일시 중지
    document.documentElement.style.setProperty('transition', 'none');

    try {
      // 1. HTML/Body 클래스 적용
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);

      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);

      // 2. VSCode 클래스 적용
      if (theme === 'dark') {
        document.body.classList.add('vscode-dark');
        document.body.classList.remove('vscode-light');
      } else {
        document.body.classList.add('vscode-light');
        document.body.classList.remove('vscode-dark');
      }

      // 아래 직접 스타일 설정 로직 제거
      /*
      // 3. 적용할 테마 객체 가져오기
      const themeObj = theme === 'dark' ? darkTheme : lightTheme;

      // 4. CSS 변수 적용
      document.body.style.setProperty('--theme-bg', themeObj.background);
      document.body.style.setProperty('--theme-text', themeObj.text);
      document.body.style.setProperty('--theme-border', themeObj.border);
      document.body.style.setProperty('--theme-paper', themeObj.paper);

      // 5. 폴백 스타일 적용
      document.body.style.backgroundColor = themeObj.background;
      document.body.style.color = themeObj.text;
      */
    } catch (e) {
      // 테마 동기화 오류 처리 (클래스 적용 중 오류 발생 시)
      console.error("Error syncing theme state (class application):", e);
    }

    // 트랜지션 복원
    setTimeout(() => {
      document.documentElement.style.setProperty('transition', '');

      // 업데이트 상태 해제
      setTimeout(() => {
        updatingRef.current = false;
      }, 200);
    }, 50);
  }, []);

  // 초기 설정 및 이벤트 리스너
  useEffect(() => {
    // 초기 테마 감지 및 적용
    const initialTheme = detectInitialTheme();

    // 초기 테마 동기화 (모든 레이어에 일관되게 적용)
    syncThemeState(initialTheme);

    // VSCode 테마 변경 메시지 수신 설정
    const handleThemeChange = (event: MessageEvent) => {
      const message = event.data;

      // messageType이 'theme-changed'인 경우 (익스텐션에서 보내는 형식)
      if (message && message.messageType === 'theme-changed' && message.data) {
        const themeInfo = message.data;
        const newTheme = themeInfo.kind === 'dark' || themeInfo.kind === 'high-contrast' ? 'dark' : 'light';
        syncThemeState(newTheme);
      }
      // type이 'theme-changed'인 경우 (예전 형식 지원)
      else if (message && message.type === 'theme-changed') {
        const newTheme = message.theme === 'dark' ? 'dark' : 'light';
        syncThemeState(newTheme);
      }
    };

    window.addEventListener('message', handleThemeChange);

    // VSCode API를 사용하여 현재 테마 요청
    const vscodeApi = getVSCodeAPI();
    if (vscodeApi) {
      // 현재 익스텐션에서 지원하는 형식으로 요청
      vscodeApi.postMessage({ messageType: 'request-theme' });
      // 예전 형식도 함께 요청 (하위 호환성)
      setTimeout(() => {
        vscodeApi.postMessage({ type: 'request-theme' });
      }, 300);
    }

    // 테마 변경 자동 감지 - body 클래스 변경 감시
    const bodyObserver = new MutationObserver((mutations) => {
      // 업데이트 중이면 MutationObserver 이벤트를 무시
      if (updatingRef.current) {
        return;
      }

      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          // 클래스 변경이 내부 로직에 의한 것인지 확인
          const isDarkTheme = document.body.classList.contains('vscode-dark') ||
            document.body.classList.contains('vscode-high-contrast');
          const newTheme = isDarkTheme ? 'dark' : 'light';

          // 현재 테마와 다른 경우에만 동기화
          if (newTheme !== vsCodeTheme) {
            syncThemeState(newTheme);
          }
        }
      }
    });

    bodyObserver.observe(document.body, { attributes: true });

    return () => {
      window.removeEventListener('message', handleThemeChange);
      bodyObserver.disconnect();
    };
  }, [detectInitialTheme, syncThemeState, vsCodeTheme]);

  // MainLayout 없이 ThemeProvider만 반환
  return (
    <ThemeProvider initialTheme={vsCodeTheme} isVSCodeThemed={true}>
      <GlobalStyle />
      <Toaster position="bottom-center" />
      <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
    </ThemeProvider>
  );
};

// Microblog-LMS 라우트 설정 - routes.tsx 기반으로 수정
export const microblogRoutes: RouteObject[] = [
  // 최상위 /education 경로 설정 (VSCode 테마 및 Microblog 기본 레이아웃 적용)
  {
    path: "/education",
    element: <VSCodeThemedMainLayout><Outlet /></VSCodeThemedMainLayout>,
    children: [
      // --- Microblog 관련 직접 자식 라우트 ---
      { index: true, element: <HomePage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "post/:postId", element: <PostPage /> },
      { path: "user/:username", element: <ProfilePage /> },
      { path: "user/edit", element: <ProfileEditPage /> },
      { path: "discover", element: <DiscoverPage /> },
      { path: "project/new", element: <ProjectUploadPage /> },
      { path: "project/:projectId", element: <ProjectDetailPage /> },
      { path: "share/:userId", element: <SharePage /> },

      // --- Education 관련 중첩 라우트 ---
      {
        path: "learn", // /education/learn 경로
        // element는 EducationLayout을 제거하고 Outlet으로 변경
        element: <LearnEntryWrapper />, // <Outlet /> 대신 LearnEntryWrapper 사용
        children: [
          // routes.tsx의 /learn 경로 구조 반영
          { index: true, element: <CoursesPage /> }, // /education/learn 의 기본 페이지
          { path: "create", element: <CourseCreatePage /> }, // /education/learn/create
          {
            path: "course/:courseId", // /education/learn/course/:courseId
            element: <Outlet />, // 중첩 라우트를 위한 Outlet
            children: [
              { index: true, element: <CourseDetailPage /> }, // /education/learn/course/:courseId
              { path: "edit", element: <CourseEditPage /> }, // /education/learn/course/:courseId/edit
              { path: "lecture/:lectureId", element: <LecturePage /> }, // /education/learn/course/:courseId/lecture/:lectureId
              { path: "reviews", element: <CourseReviewsPage /> }, // /education/learn/course/:courseId/reviews
              { path: "roadmap/:roadmapId", element: <RoadmapDetailPage /> } // /education/learn/roadmap/:roadmapId
            ]
          },
          // RoadmapDetailPage 경로 추가 (course/:courseId와 동일 레벨)
          {
            path: "roadmap/:roadmapId", // /education/learn/roadmap/:roadmapId
            element: <RoadmapDetailPage />
          }
          // ... removed curriculum/roadmap routes ...
        ]
      }
    ]
  },
  // 인증 페이지는 별도의 레이아웃 사용 (경로 유지)
  {
    path: "/education",
    element: <VSCodeThemedOnlyLayout><Outlet /></VSCodeThemedOnlyLayout>,
    children: [
      { path: "home", element: <LoginPage /> },
    ]
  }
];

export default microblogRoutes; 