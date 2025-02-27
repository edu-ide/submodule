import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoadmapView from './RoadmapView';
import RoadmapContentView from './roadmap/RoadmapContentView';
import EducationHome from './EducationHome';
import { RoadmapProvider } from './roadmap/RoadmapContext';

const EducationRouter: React.FC = () => {
  return (
    <RoadmapProvider>
      <Routes>
        <Route path="/" element={<EducationHome />} />
        <Route path="/roadmap/:roadmapId" element={<RoadmapView />} />
        <Route path="/roadmap/:roadmapId/content/:contentId" element={<RoadmapContentView />} />
        <Route path="*" element={<Navigate to="/education" replace />} />
      </Routes>
    </RoadmapProvider>
  );
};

export default EducationRouter; 