import { RoadmapNode as ImportedRoadmapNode, RoadmapEdge as ImportedRoadmapEdge } from '../types';
import { RoadmapNode as LayoutRoadmapNode } from '../../layoutUtils';

/**
 * 원본 로드맵 노드를 레이아웃 노드로 변환하는 함수
 */
export const convertToLayoutRoadmapNode = (nodes: ImportedRoadmapNode[]): LayoutRoadmapNode[] => {
  console.log('원본 노드 데이터 order 확인:', nodes.map(node => ({ 
    id: node.id, 
    order: node.data?.order, 
    title: node.data?.title 
  })));
  
  const convertedNodes = nodes.map(node => {
    // 기본값 설정
    const defaultCategory = 'default';
    const defaultThumbnail = 'default-thumbnail.png';
    
    // order 값 검증 및 처리
    const orderValue = node.data?.order;
    console.log(`노드 ${node.id} (${node.data?.title || 'unknown'}) order 값:`, orderValue);
    
    // order 값 결정 로직 개선
    let finalOrder: string;
    
    if (orderValue !== undefined && orderValue !== null && orderValue !== '') {
      // orderValue가 존재하는 경우 (문자열 또는 숫자)
      finalOrder = String(orderValue);
      console.log(`노드 ${node.id}: 원본 order 값 사용 - ${finalOrder}`);
    } else if (node.id.includes('-')) {
      // ID에서 order 값 추출 시도 (예: "topic-1-2" -> "1-2")
      const orderPart = node.id.split('-').slice(1).join('-');
      finalOrder = orderPart;
      console.log(`노드 ${node.id}: ID에서 추출한 order 값 사용 - ${finalOrder}`);
    } else {
      // 기본값 사용
      finalOrder = '0';
      console.log(`노드 ${node.id}: 기본 order 값 사용 - ${finalOrder}`);
    }
    
    return {
      id: node.id,
      type: node.type || 'default',
      data: {
        title: node.data?.title || '',
        description: node.data?.description || '',
        status: node.data?.status || 'not-started',
        order: finalOrder,  // 개선된 order 값 적용
        column: node.data?.column || '',
        level: node.data?.column === 'main' ? '초급' : node.data?.column === 'child' ? '중급' : '고급',
        // category와 thumbnail은 ImportedRoadmapNode에 없으므로 기본값 사용
        category: defaultCategory,
        content_file: node.data?.content_file || '',
        thumbnail: defaultThumbnail,
        featured: false,
        prerequisites: [],
        next: []
      }
    };
  });
  
  console.log('변환된 노드 데이터 order 확인:', convertedNodes.map(node => ({ 
    id: node.id, 
    order: node.data.order, 
    title: node.data.title 
  })));
  
  return convertedNodes;
};

/**
 * 엣지 정보를 기반으로 노드의 선행 조건과 다음 단계 설정하는 함수
 */
export const enhanceNodesWithEdges = (nodes: LayoutRoadmapNode[], edges: ImportedRoadmapEdge[]): LayoutRoadmapNode[] => {
  console.log('엣지 정보로 노드 향상 전 order 확인:', nodes.map(node => ({ 
    id: node.id, 
    order: node.data.order, 
    title: node.data.title 
  })));
  
  // 노드 맵 생성
  const nodeMap: Record<string, LayoutRoadmapNode> = {};
  nodes.forEach(node => {
    nodeMap[node.id] = {
      ...node,
      data: {
        ...node.data,
        // 기존 prerequisites와 next 배열 유지하면서 병합
        prerequisites: node.data.prerequisites || [],
        next: node.data.next || []
      }
    };
  });
  
  // 엣지 정보 기반으로 선행 조건과 다음 단계 설정
  edges.forEach(edge => {
    const { source, target } = edge;
    
    // 소스 노드가 존재하면 다음 단계에 타겟 추가
    if (nodeMap[source]) {
      if (!nodeMap[source].data.next) {
        nodeMap[source].data.next = [];
      }
      
      if (!nodeMap[source].data.next.includes(target)) {
        nodeMap[source].data.next.push(target);
      }
    }
    
    // 타겟 노드가 존재하면 선행 조건에 소스 추가
    if (nodeMap[target]) {
      if (!nodeMap[target].data.prerequisites) {
        nodeMap[target].data.prerequisites = [];
      }
      
      if (!nodeMap[target].data.prerequisites.includes(source)) {
        nodeMap[target].data.prerequisites.push(source);
      }
    }
  });
  
  const enhancedNodes = Object.values(nodeMap);
  
  console.log('엣지 정보로 노드 향상 후 order 확인:', enhancedNodes.map(node => ({ 
    id: node.id, 
    order: node.data.order, 
    title: node.data.title 
  })));
  
  return enhancedNodes;
};

/**
 * ID와 제목 매핑을 생성하는 함수
 */
export const createIdToTitleMapping = (nodes: ImportedRoadmapNode[]) => {
  const idToTitle: Record<string, string> = {};
  const titleToId: Record<string, string> = {};
  
  nodes.forEach(node => {
    if (node.data?.title) {
      // 특별 케이스: '데이터 구조'에 대한 처리 추가
      if (node.data.title === '데이터 구조') {
        console.log('데이터 구조 노드 매핑 생성:', node.id);
        // 원본 및 인코딩된 형태 모두 매핑
        idToTitle[node.id] = node.data.title;
        titleToId[node.data.title] = node.id;
        titleToId['데이터구조'] = node.id; // 공백 없는 버전도 추가
        titleToId[encodeURIComponent(node.data.title)] = node.id;
      } else {
        // 일반적인 매핑 처리
        const safeTitle = encodeURIComponent(node.data.title);
        idToTitle[node.id] = node.data.title; // 인코딩되지 않은 원본 타이틀 저장
        titleToId[safeTitle] = node.id;
        titleToId[node.data.title] = node.id; // 원본 타이틀도 매핑
      }
    }
  });
  
  return { idToTitle, titleToId };
};

/**
 * 진행 상태를 계산하는 함수
 */
export const calculateProgress = (nodes: LayoutRoadmapNode[]) => {
  const total = nodes.length;
  const completed = nodes.filter(node => node.data.status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    completed,
    total,
    percentage
  };
}; 