import pythonRoadmapData from './data/pythonRoadmap.json';
import { Node as FlowNode, Edge as FlowEdge } from '@xyflow/react';

// 데이터와 일치하는 커스텀 타입 정의
interface RoadmapNode {
  id: string;
  type: string;
  data: {
    title: string;
    description: string;
    status: string;
    column: string;
  };
}

interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  data: {
    type: string;
  };
}

// 커스텀 RoadmapData 타입 정의
interface RoadmapData {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

// pythonRoadmapData가 유효한지 확인하고 처리
const roadmapData: RoadmapData = pythonRoadmapData || { nodes: [], edges: [] };

// 파이썬 로드맵 데이터 내보내기
export const pythonNodes: RoadmapNode[] = roadmapData.nodes;
export const pythonEdges: RoadmapEdge[] = roadmapData.edges;

// 다른 로드맵 데이터도 비슷한 방식으로 처리 가능
// export const javascriptNodes = ...
// export const javascriptEdges = ... 