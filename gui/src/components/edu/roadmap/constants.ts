import { RoadmapNode, RoadmapEdge, RoadmapData } from './types';

// 인터페이스 정의 삭제하고 types.ts에서 import한 타입 사용

// 변수 이름 충돌 해결
export const roadmapNodes: RoadmapNode[] = [];
export const roadmapEdges: RoadmapEdge[] = [];

// 함수 선언을 사용 코드 위로 이동
const API_ENDPOINT = 'http://localhost:9000/edu/content/data/roadmap.json';

export const fetchRoadmapData = async (): Promise<RoadmapData> => {
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Roadmap data fetch failed:', error);
    return { nodes: [], edges: [] };
  }
};

// 이후에 fetch 호출
fetchRoadmapData().then(data => {
  roadmapNodes.push(...data.nodes as RoadmapNode[]);
  roadmapEdges.push(...data.edges);
});

// 다른 로드맵 데이터도 비슷한 방식으로 처리 가능
// export const javascriptNodes = ...
// export const javascriptEdges = ... 

// 사용처 수정 (비동기 처리 필요)
export const getRoadmapData = async () => {
  const data = await fetchRoadmapData();
  return {
    nodes: data.nodes as RoadmapNode[],
    edges: data.edges as RoadmapEdge[]
  };
};

// 기존 API 엔드포인트 아래에 추가
const API_ENDPOINT2 = 'http://localhost:9000/edu/content/data/roadmapContent.json';

// 새로운 fetch 함수 추가
export const fetchRoadmapContent = async (): Promise<Record<string, {
  title: string;
  description: string;
  contentFile: string;
}>> => {
  try {
    const response = await fetch(API_ENDPOINT2);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Roadmap content fetch failed:', error);
    return {};
  }
}; 