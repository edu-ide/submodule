import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import EducationLayout from '../components/edu/EducationLayout';
import EducationHome from '../pages/educationHome';
import CurriculumList from '../components/edu/CurriculumList';
import CurriculumCategories from '../pages/curriculumCategories';
import GuideContent from '../pages/guideContent';
import RoadmapList from '../pages/roadmapList';
import RoadmapViewWrapper from '../components/edu/RoadmapViewWrapper';
import RoadmapContentView from '../components/edu/roadmap/RoadmapContentView';

export const educationRoutes: RouteObject[] = [
  {
    path: "/education",
    element: <EducationLayout />,
    children: [
      { index: true, element: <Navigate to="/education/home" replace /> },
      { path: "home", element: <EducationHome /> },
      { path: "curriculum", element: <CurriculumList /> },
      { path: "curriculum/:curriculumId", element: <CurriculumCategories /> },
      { path: "curriculum/:curriculumId/category/:categoryIndex", element: <GuideContent /> },
      { path: "roadmap", element: <RoadmapList /> },
      { path: "roadmap/:roadmapId", element: <RoadmapViewWrapper /> },
      { path: "roadmap/:roadmapId/content/:contentId", element: <RoadmapContentView /> }
    ]
  }
]; 