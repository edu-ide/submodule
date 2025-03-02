import { setBottomMessage } from '@/redux/slices/uiStateSlice';
import { RoadmapNode, RoadmapEdge, RoadmapData } from './types';

// 인터페이스 정의 삭제하고 types.ts에서 import한 타입 사용

// 변수 이름 충돌 해결
export const roadmapNodes: RoadmapNode[] = [];
export const roadmapEdges: RoadmapEdge[] = [];

// 함수 선언을 사용 코드 위로 이동
// nodeId 파싱 함수 추가
export const extractNodeIdPart = (fullNodeId: string): string => {
  // "python-intro"와 같은 형식에서 "intro" 부분만 추출
  const parts = fullNodeId.split('-');
  return parts.length > 1 ? parts[1] : fullNodeId;
};

// API 엔드포인트를 함수로 변경 - language 매개변수 추가
const getApiEndpoint = (categoryId: string, language: string = 'python') => {
  // URL 구성 문제를 디버깅하기 위한 로그 추가
  console.log(`API 엔드포인트 생성: categoryId=${categoryId}, language=${language}`);
  
  // simpleId 처리
  const simpleId = categoryId.includes('-') ? categoryId.split('-')[1] : categoryId;
  console.log(`API 엔드포인트 simpleId=${simpleId}`);
  
  // URL 구성
  const url = `http://localhost:9000/edu/${language}/${simpleId}/roadmap.json`;
  console.log(`생성된 API 엔드포인트 URL: ${url}`);
  
  return url;
}

// 로드맵 데이터 가져오는 함수 수정 - language 매개변수 추가
export const fetchRoadmapData = async (categoryId: string, language: string = 'python'): Promise<RoadmapData> => {
  try {
    console.log(`로드맵 데이터 가져오기: categoryId=${categoryId}, language=${language}`);
    
    const endpoint = getApiEndpoint(categoryId, language);
    console.log(`로드맵 데이터 엔드포인트: ${endpoint}`);
    
    const response = await fetch(endpoint);
    if (!response.ok) {
      console.error(`HTTP 오류! status: ${response.status}, URL: ${endpoint}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`로드맵 데이터 로드 성공: 노드=${data.nodes?.length || 0}개, 엣지=${data.edges?.length || 0}개`);
    return data;
  } catch (error) {
    console.error(`로드맵 데이터 가져오기 실패 (카테고리: ${categoryId}):`, error);
    return { nodes: [], edges: [] };
  }
};

// 이후에 fetch 호출 제거 (이제 즉시 호출하지 않고 필요할 때 호출)
// fetchRoadmapData().then(data => {
//   roadmapNodes.push(...data.nodes as RoadmapNode[]);
//   roadmapEdges.push(...data.edges);
// });

// 사용처 수정 (비동기 처리 필요) - language 매개변수 추가
export const getRoadmapData = async (categoryId: string, language: string = 'python') => {
  const data = await fetchRoadmapData(categoryId, language);
  return {
    nodes: data.nodes as RoadmapNode[],
    edges: data.edges as RoadmapEdge[]
  };
};


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

// fetchRoadmapContent 함수 수정 - language 매개변수 추가
export const fetchRoadmapContent = async (categoryId: string, language: string = 'python'): Promise<{
  roadmap: Record<string, {
    title: string;
    description: string;
    content: string;
    order: string;
    prerequisites: string[];
  }>;
}> => {
  try {
    console.log(`로드맵 콘텐츠 가져오기 시작: 카테고리ID=${categoryId}, 언어=${language}`);
    
    const endpoint = getApiEndpoint(categoryId, language);
    console.log(`API 엔드포인트: ${endpoint}`);
    
    const roadmapResponse = await fetch(endpoint);
    if (!roadmapResponse.ok) {
      console.error(`로드맵 데이터 HTTP 오류! status: ${roadmapResponse.status}, URL: ${endpoint}`);
      // 오류 처리 추가: 빈 로드맵 객체 반환 대신 구체적인 오류 메시지와 함께 예외 발생
      throw new Error(`로드맵 데이터 HTTP 오류! status: ${roadmapResponse.status}`);
    }
    
    const roadmapData = await roadmapResponse.json();
    console.log(`로드맵 데이터 로드됨: 노드 ${roadmapData.nodes?.length || 0}개, 엣지 ${roadmapData.edges?.length || 0}개`);
    
    // 노드가 없는 경우 처리
    if (!roadmapData.nodes || roadmapData.nodes.length === 0) {
      console.warn('로드맵 데이터에 노드가 없습니다.');
      return { roadmap: {} };
    }
    
    const roadmap: Record<string, any> = {};
    
    // 각 노드별로 개별 마크다운 파일 로드
    for (const node of roadmapData.nodes) {
      const nodeId = node.id;
      const contentFile = node.data.content_file;
      
      console.log(`노드 처리 중: ID=${nodeId}, 콘텐츠 파일=${contentFile || '없음'}`);
      
      if (!contentFile) {
        console.warn(`노드 ${nodeId}에 콘텐츠 파일이 지정되지 않았습니다.`);
        roadmap[nodeId] = {
          title: node.data.title,
          description: node.data.description,
          content: `# ${node.data.title}\n\n콘텐츠 파일이 지정되지 않았습니다.`,
          order: node.data.order,
          prerequisites: []
        };
        continue;
      }
      
      try {
        // 엔드포인트에서 얻은 것과 동일한 simpleId 사용
        const simpleId = categoryId.includes('-') ? categoryId.split('-')[1] : categoryId;
        const contentUrl = `http://localhost:9000/edu/${language}/${simpleId}/sections/${contentFile}`;
        console.log(`마크다운 파일 로드 중: ${contentUrl}`);
        
        const contentResponse = await fetch(contentUrl);
        if (!contentResponse.ok) {
          console.warn(`마크다운 파일 로드 실패: ${contentFile}, 상태 코드: ${contentResponse.status}, URL: ${contentUrl}`);
          roadmap[nodeId] = {
            title: node.data.title,
            description: node.data.description,
            content: `# ${node.data.title}\n\n파일을 찾을 수 없습니다: ${contentFile}`,
            order: node.data.order,
            prerequisites: []
          };
          continue;
        }
        
        const content = await contentResponse.text();
        console.log(`콘텐츠 로드 성공: 노드=${nodeId}, 길이=${content.length}자`);
        roadmap[nodeId] = {
          title: node.data.title,
          description: node.data.description,
          content: content || '# 콘텐츠 준비 중\n이 섹션의 콘텐츠는 아직 준비 중입니다.',
          order: node.data.order,
          prerequisites: []
        };
        
      } catch (error) {
        console.warn(`${contentFile} 파일 로드 실패:`, error);
        roadmap[nodeId] = {
          title: node.data.title,
          description: node.data.description,
          content: `# ${node.data.title}\n\n콘텐츠 로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
          order: node.data.order,
          prerequisites: []
        };
      }
    }
    
    // prerequisites 정보 추가
    if (roadmapData.edges && roadmapData.edges.length > 0) {
      roadmapData.edges.forEach((edge: any) => {
        const targetId = edge.target;
        const sourceId = edge.source;
        
        if (roadmap[targetId]) {
          if (!roadmap[targetId].prerequisites) {
            roadmap[targetId].prerequisites = [];
          }
          roadmap[targetId].prerequisites.push(sourceId);
        }
      });
    }
    
    console.log(`최종 roadmap 데이터: ${Object.keys(roadmap).length}개 노드 로드됨`);
    return { roadmap };
    
  } catch (error) {
    console.error('로드맵 콘텐츠 가져오기 실패:', error);
    // 오류를 다시 던져서 호출자가 처리할 수 있도록 함
    throw error;
  }
}; 