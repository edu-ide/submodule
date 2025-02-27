import { useDispatch } from "react-redux";
import { RouterProvider, createMemoryRouter, Navigate, useParams, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import { SubmenuContextProvidersContext } from "./context/SubmenuContextProviders";
import { VscThemeContext } from "./context/VscTheme";
import useSetup from "./hooks/useSetup";
import useSubmenuContextProviders from "./hooks/useSubmenuContextProviders";
import { useVscTheme } from "./hooks/useVscTheme";
import { AddNewModel, ConfigureProvider } from "./pages/AddNewModel";
import ErrorPage from "./pages/error";
import GUI from "./pages/gui";
import History from "./pages/history";
import { default as Help, default as HelpPage } from "./pages/help";
import MigrationPage from "./pages/migration";
import MonacoPage from "./pages/monaco";
import ApiKeyAutocompleteOnboarding from "./pages/onboarding/apiKeyAutocompleteOnboarding";
import ApiKeysOnboarding from "./pages/onboarding/ApiKeysOnboarding";
import LocalOnboarding from "./pages/onboarding/LocalOnboarding";
import Onboarding from "./pages/onboarding/Onboarding";
import SettingsPage from "./pages/settings";
import Stats from "./pages/stats";
import Inventory from "./pages/inventory";
import PerplexityGUI from "./integrations/perplexity/perplexitygui";
import Welcome from "./pages/welcome/welcomeGui";
import { ContextMenuProvider } from './components/ContextMenuProvider';
import Mem0GUI from "./integrations/mem0/mem0gui";
// import PerplexitySidebarGUI from "./integrations/perplexity/PerplexitySidebarGUI";
import Mem0SidebarGUI from "./integrations/mem0/Mem0SidebarGUI";
import EducationGUI from './pages/education';
import LeftPanel from './components/edu/LeftPanel';
import RoadmapView from './components/edu/RoadmapView';
import LearningContentView from './components/edu/roadmap/LearningContentView';
import EducationLayout from './components/edu/EducationLayout';
import EducationHome from './pages/educationHome';
import CurriculumList from './components/edu/CurriculumList';
import CurriculumCategories from './pages/curriculumCategories';
import GuideContent from './pages/guideContent';
import RoadmapList from './pages/roadmapList';

declare global {
  interface Window {
    initialRoute?: string;
    isFirstLaunch?: boolean;
    isPearOverlay?: boolean;
    viewType?: 'pearai.chatView' | 'pearai.mem0View' | 'pearai.searchView';
  }
}

// RoadmapView 래퍼
const RoadmapViewWrapper = () => {
  const { roadmapId } = useParams();
  return <RoadmapView roadmapId={roadmapId || 'python'} />;
};

// LearningContentView 래퍼 수정
const LearningContentViewWrapper = () => {
  const { roadmapId, nodeId } = useParams();
  const navigate = useNavigate();
  
  // 학습 콘텐츠 데이터 생성
  const content = {
    title: `${nodeId} 학습 콘텐츠`,
    introduction: "이 학습 콘텐츠는 해당 주제에 대한 안내입니다.",
    theory: "이론적 내용이 여기에 표시됩니다.",
    examples: [
      {
        title: "예제 1",
        code: "console.log('Hello, world!');",
        explanation: "기본 출력 예제입니다."
      },
      {
        title: "예제 2",
        code: "const sum = (a, b) => a + b;",
        explanation: "간단한 함수 예제입니다."
      }
    ],
    practice: {
      question: "연습 문제",
      hints: ["힌트 1", "힌트 2"],
      solution: "문제 해결 방법"
    },
    quiz: [
      {
        question: "문제 1",
        options: ["선택지 1", "선택지 2", "선택지 3"],
        answer: 0, // 첫 번째 선택지가 정답
        explanation: "이 문제에 대한 설명입니다."
      },
      {
        question: "문제 2",
        options: ["선택지 A", "선택지 B", "선택지 C"],
        answer: 1, // 두 번째 선택지가 정답
        explanation: "이 문제에 대한 설명입니다."
      }
    ],
    resources: [
      {
        title: "참고자료 1",
        url: "https://example.com/resource1",
        type: "article" as "video" | "article" | "tutorial"
      },
      {
        title: "참고자료 2",
        url: "https://example.com/resource2",
        type: "video" as "video" | "article" | "tutorial"
      }
    ]
  };
  
  // 노드 데이터 생성
  const nodeData = {
    title: `${nodeId} 노드`,
    description: "노드 설명",
    status: "in-progress" as "completed" | "in-progress" | "not-started",
    column: "0"
  };
  
  return (
    <LearningContentView 
      content={content} 
      nodeData={nodeData} 
      onBack={() => navigate(`/education/roadmap/${roadmapId}`)} 
    />
  );
};

const router = createMemoryRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/index.html",
          element: <GUI />,
        },
        {
          path: "/",
          element: window.viewType === 'pearai.chatView' ? <GUI /> :
                   window.viewType === 'pearai.searchView' ? <PerplexityGUI /> :
                   window.viewType === 'pearai.mem0View' ? <Mem0SidebarGUI /> :
                  <GUI />, // default to GUI if viewType is undefined or different
        },
        {
          path: "/education",
          element: <EducationLayout />,
          children: [
            {
              path: "",
              element: <Navigate to="/education/home" replace />
            },
            {
              path: "home",
              element: <EducationHome />
            },
            {
              path: "curriculum",
              element: <CurriculumList />
            },
            {
              path: "curriculum/:curriculumId",
              element: <CurriculumCategories />
            },
            {
              path: "curriculum/:curriculumId/category/:categoryIndex",
              element: <GuideContent />
            },
            {
              path: "roadmap",
              element: <RoadmapList />
            },
            {
              path: "roadmap/:roadmapId",
              element: <RoadmapViewWrapper />
            },
            {
              path: "roadmap/:roadmapId/content/:nodeId",
              element: <LearningContentViewWrapper />
            }
          ]
        },
        {
          path: "/perplexityMode",
          element: <PerplexityGUI />,
        },
        {
          path: "/history",
          element: <History from={
            window.viewType === 'pearai.chatView' ? 'continue' :
            window.viewType === 'pearai.searchView' ? 'perplexity' :
            'continue' // default fallback
          }/>
        },
        {
          path: "/stats",
          element: <Stats />,
        },
        {
          path: "/help",
          element: <Help />,
        },
        {
          path: "/settings",
          element: <SettingsPage />,
        },
        {
          path: "/addModel",
          element: <AddNewModel />,
        },
        {
          path: "/addModel/provider/:providerName",
          element: <ConfigureProvider />,
        },
        {
          path: "/help",
          element: <HelpPage />,
        },
        {
          path: "/monaco",
          element: <MonacoPage />,
        },
        {
          path: "/onboarding",
          element: <Onboarding />,
        },
        {
          path: "/localOnboarding",
          element: <LocalOnboarding />,
        },
        {
          path: "/migration",
          element: <MigrationPage />,
        },
        {
          path: "/apiKeysOnboarding",
          element: <ApiKeysOnboarding />,
        },
        {
          path: "/apiKeyAutocompleteOnboarding",
          element: <ApiKeyAutocompleteOnboarding />,
        },
        {
          path: "/inventory/*",
          element: <Inventory />,
        },
        {
          path: "/welcome",
          element: <Welcome/>
        },
      ],
    },
  ],
  // TODO: Remove replace /welcome with /inventory when done testing
  {
    initialEntries: [
      window.isPearOverlay
        ? (window.isFirstLaunch ? "/welcome" : "/inventory/home")
        : window.initialRoute
    ],
    // FOR DEV'ing welcome:
    // initialEntries: [window.isPearOverlay ? "/welcome" : window.initialRoute],
  },
);

function App() {
  const dispatch = useDispatch();
  useSetup(dispatch);

  const vscTheme = useVscTheme();
  const submenuContextProvidersMethods = useSubmenuContextProviders();
  return (
    <ContextMenuProvider>
      <VscThemeContext.Provider value={vscTheme}>
        <SubmenuContextProvidersContext.Provider
          value={submenuContextProvidersMethods}
        >
          <RouterProvider router={router} />
        </SubmenuContextProvidersContext.Provider>
      </VscThemeContext.Provider>
    </ContextMenuProvider>
  );
}

export default App;
