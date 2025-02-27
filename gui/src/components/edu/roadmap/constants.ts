import pythonRoadmapData from './data/pythonRoadmap.json';
import { RoadmapNode, RoadmapEdge, RoadmapData } from './types';

// 인터페이스 정의 삭제하고 types.ts에서 import한 타입 사용

// 타입 단언으로 데이터 변환
const roadmapData = pythonRoadmapData || { nodes: [], edges: [] } as RoadmapData;

// 파이썬 로드맵 데이터 내보내기
export const pythonNodes: RoadmapNode[] = roadmapData.nodes as RoadmapNode[];
export const pythonEdges: RoadmapEdge[] = roadmapData.edges;

// 다른 로드맵 데이터도 비슷한 방식으로 처리 가능
// export const javascriptNodes = ...
// export const javascriptEdges = ... 