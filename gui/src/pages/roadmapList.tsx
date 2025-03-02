import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 이 페이지는 이전 버전과의 호환성을 위해 유지되며,
// 새 로드맵 목록 페이지로 리디렉션합니다.
const RoadmapList = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // 새로운 로드맵 목록 경로로 리디렉션
    navigate('/education/roadmaps', { replace: true });
  }, [navigate]);
  
  return (
    <div className="loading-container">
      <div>로드맵 목록으로 리디렉션하는 중...</div>
    </div>
  );
};

export default RoadmapList; 