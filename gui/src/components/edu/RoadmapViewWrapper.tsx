import { useParams } from 'react-router-dom';
import RoadmapView from './roadmap/views/RoadmapView';
const RoadmapViewWrapper = () => {
  const { roadmapId, categoryId } = useParams();
  return <RoadmapView roadmapId={roadmapId || 'python'} parentCategoryId={categoryId} />;
};

export default RoadmapViewWrapper; 