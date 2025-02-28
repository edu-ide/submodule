import { RoadmapNode, RoadmapEdge, RoadmapData } from './types';

// 인터페이스 정의 삭제하고 types.ts에서 import한 타입 사용

// 변수 이름 충돌 해결
export const roadmapNodes: RoadmapNode[] = [];
export const roadmapEdges: RoadmapEdge[] = [];

// 함수 선언을 사용 코드 위로 이동
const API_ENDPOINT = 'http://localhost:9000/edu/content/data/roadmap1.json';

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
const API_ENDPOINT2 = 'http://localhost:9000/edu/content/data/roadmapContent1.json';

// 마크다운 파싱 함수 추가
const parseMarkdownContent = (content: string) => {
  const sections: Record<string, { title: string; content: string; order: string }> = {};
  const lines = content.split('\n');
  
  let currentSection = '';
  let currentContent: string[] = [];
  let currentOrder = '';
  
  lines.forEach((line) => {
    const orderMatch = line.match(/\[order:\s*([0-9.]+)\]/);
    if (orderMatch) {
      // 이전 섹션 저장
      if (currentSection && currentOrder) {
        sections[currentOrder] = {
          title: currentSection,
          content: currentContent.join('\n'),
          order: currentOrder
        };
      }
      
      currentOrder = orderMatch[1];
      currentSection = line.replace(/\[order:\s*[0-9.]+\]/, '').trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  });
  
  // 마지막 섹션 저장
  if (currentSection && currentOrder) {
    sections[currentOrder] = {
      title: currentSection,
      content: currentContent.join('\n'),
      order: currentOrder
    };
  }
  
  return sections;
};

// fetchRoadmapContent 함수 수정
export const fetchRoadmapContent = async (): Promise<{
  roadmap: Record<string, {
    title: string;
    description: string;
    content: string;
    order: string;
    prerequisites: string[];
  }>;
}> => {
  try {
    console.log('로드맵 데이터 가져오기 시작');
    // roadmap1.json 데이터를 먼저 가져옵니다
    const roadmapResponse = await fetch(API_ENDPOINT);
    if (!roadmapResponse.ok) throw new Error(`로드맵 데이터 HTTP 오류! status: ${roadmapResponse.status}`);
    const roadmapData = await roadmapResponse.json();
    console.log('로드맵 데이터 로드됨:', roadmapData);
    
    // 마크다운 콘텐츠를 가져옵니다
    console.log('마크다운 콘텐츠 가져오기 시작');
    const contentResponse = await fetch('http://localhost:9000/edu/content/content.md');
    if (!contentResponse.ok) {
      console.error('마크다운 콘텐츠 HTTP 오류:', contentResponse.status);
      throw new Error(`마크다운 콘텐츠 HTTP 오류! status: ${contentResponse.status}`);
    }
    const markdownContent = await contentResponse.text();
    if (!markdownContent) {
      throw new Error('마크다운 콘텐츠가 비어있습니다.');
    }
    console.log('마크다운 콘텐츠 로드됨, 길이:', markdownContent.length);
    
    console.log('마크다운 콘텐츠 파싱 시작');
    const sections = parseMarkdownContent(markdownContent);
    console.log('파싱된 섹션들:', Object.keys(sections));
    
    if (Object.keys(sections).length === 0) {
      throw new Error('마크다운 콘텐츠에서 섹션을 찾을 수 없습니다.');
    }
    
    const roadmap: Record<string, any> = {};
    
    // roadmap1.json의 노드를 기반으로 콘텐츠를 매핑합니다
    roadmapData.nodes.forEach((node: any) => {
      const nodeId = node.id;
      const order = node.data.order;
      console.log(`노드 처리 중 - ID: ${nodeId}, Order: ${order}`);
      
      const section = sections[order];
      if (section) {
        console.log(`섹션 찾음 - Order: ${order}, Title: ${section.title}`);
        roadmap[nodeId] = {
          title: node.data.title,
          description: node.data.description,
          content: section.content || '# 콘텐츠 준비 중\n이 섹션의 콘텐츠는 아직 준비 중입니다.',
          order: order,
          prerequisites: []
        };
      } else {
        console.warn(`섹션을 찾을 수 없음 - Order: ${order}, NodeId: ${nodeId}`);
        // 섹션을 찾을 수 없는 경우에도 기본 데이터 추가
        roadmap[nodeId] = {
          title: node.data.title,
          description: node.data.description,
          content: `# ${node.data.title}\n\n준비 중입니다. 곧 업데이트될 예정입니다.`,
          order: order,
          prerequisites: []
        };
      }
    });
    
    // edges에서 prerequisites 정보를 추출합니다
    roadmapData.edges.forEach((edge: any) => {
      const targetId = edge.target;
      const sourceId = edge.source;
      
      if (roadmap[targetId]) {
        if (!roadmap[targetId].prerequisites) {
          roadmap[targetId].prerequisites = [];
        }
        roadmap[targetId].prerequisites.push(sourceId);
        console.log(`선수 학습 추가 - Target: ${targetId}, Source: ${sourceId}`);
      }
    });
    
    console.log('최종 roadmap 데이터:', roadmap);
    return { roadmap };
  } catch (error) {
    console.error('Roadmap content fetch failed:', error);
    throw error;
  }
}; 