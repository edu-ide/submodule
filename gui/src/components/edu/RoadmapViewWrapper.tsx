import { useParams } from 'react-router-dom';
import RoadmapView from './RoadmapView';

const RoadmapViewWrapper = () => {
  const { roadmapId } = useParams();
  return <RoadmapView roadmapId={roadmapId || 'python'} />;
};

export default RoadmapViewWrapper; 