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
import RoadmapContentView from './components/edu/roadmap/RoadmapContentView';
import EducationLayout from './components/edu/EducationLayout';
import EducationHome from './pages/educationHome';
import CurriculumList from './components/edu/CurriculumList';
import CurriculumCategories from './pages/curriculumCategories';
import GuideContent from './pages/guideContent';
import RoadmapList from './pages/roadmapList';
import { educationRoutes } from './routes/educationRoutes';

declare global {
  interface Window {
    initialRoute?: string;
    isFirstLaunch?: boolean;
    isPearOverlay?: boolean;
    viewType?: 'pearai.chatView' | 'pearai.mem0View' | 'pearai.searchView';
  }
}




// 라우터 설정에서 경로 업데이트
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
        ...educationRoutes,
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
