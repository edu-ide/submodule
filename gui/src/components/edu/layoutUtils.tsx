import { Position } from '@xyflow/react';
import { layoutFromMap } from 'entitree-flex';

// 엔티티 레이아웃 설정 및 로직
export const createEntitreeLayout = (tree, rootId, direction) => {
  // 기존 layout-elements.ts의 로직 통합
  // ...
}

// 노드와 엣지 레이아웃 타입 정의
export type LayoutElements = {
  nodes: any[];
  edges: any[];
};

// Entitree 방향 상수 - 타입을 명시적으로 정의
export type OrientationType = 'vertical' | 'horizontal';

export const Orientation = {
  Vertical: 'vertical' as OrientationType,
  Horizontal: 'horizontal' as OrientationType
};

// 노드 및 엣지 관련 인터페이스 정의
interface EntitreeNode {
  id?: string;
  x: number;
  y: number;
  [key: string]: any;
}

interface EntitreeEdge {
  source: any;
  target: any;
  [key: string]: any;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  sourceHandle?: any;
  targetHandle?: any;
  style?: any;
  hoverStyle?: any;
  data?: any;
  [key: string]: any;
}

interface FlowNode {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
  sourcePosition?: any;
  targetPosition?: any;
  width?: number;
  height?: number;
  [key: string]: any;
}

// 노드 크기
const nodeWidth = 180;
const nodeHeight = 100;

// 엔티티 레이아웃 설정
const entitreeSettings = {
  clone: true, 
  enableFlex: true,
  firstDegreeSpacing: 100,
  nextAfterAccessor: 'spouses',
  nextAfterSpacing: 100,
  nextBeforeAccessor: 'siblings',
  nextBeforeSpacing: 100,
  nodeHeight,
  nodeWidth,
  rootX: 0,
  rootY: 0,
  secondDegreeSpacing: 100,
  sourcesAccessor: 'parents',
  sourceTargetSpacing: 100,
  targetsAccessor: 'children',
};

const { Top, Bottom, Left, Right } = Position;

// 로드맵 노드/엣지 인터페이스
export interface RoadmapNode {
  id: string;
  type: string;
  data: {
    title: string;
    description: string;
    status?: string;
    order?: string;
    column?: string;
    level?: string;
    category: string | string[];
    content_file?: string;
    thumbnail: string;
    featured?: boolean;
    prerequisites?: string[];
    next?: string[];
  };
}

// 레이아웃 요소 계산 함수
export const layoutElements = (tree, rootId, direction = 'TB') => {
  const isTreeHorizontal = direction === 'LR';
  
  // 안전 장치: 깊이가 너무 깊거나 노드가 너무 많은 경우 예외 처리
  const nodeCount = Object.keys(tree).length;
  if (nodeCount > 1000) {
    console.warn('노드 수가 너무 많습니다:', nodeCount);
    // 간단한 레이아웃 반환
    return createSimpleLayout(tree, rootId, isTreeHorizontal);
  }
  
  try {
    // entitree-flex 라이브러리 호출 시 타임아웃 설정
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('레이아웃 계산 시간 초과')), 5000);
    });
    
    // 실제 레이아웃 계산
    const layoutPromise = new Promise(resolve => {
      const result = layoutFromMap(
        rootId,
        tree,
        {
          ...entitreeSettings,
          orientation: isTreeHorizontal
            ? Orientation.Horizontal
            : Orientation.Vertical,
        } as any
      );
      resolve(result);
    });
    
    // 타임아웃 또는 계산 완료 중 먼저 발생하는 것 처리
    const { nodes: entitreeNodes, rels: entitreeEdges } = Promise.race([
      layoutPromise,
      timeoutPromise
    ]);
    
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];

    // 엣지 처리
    entitreeEdges.forEach((edge: EntitreeEdge) => {
      const sourceObj = edge.source as any;
      const targetObj = edge.target as any;
      
      // source와 target은 문자열이거나 id 속성을 가진 객체일 수 있음
      const sourceNode = typeof sourceObj === 'string' ? sourceObj : sourceObj.id || sourceObj;
      const targetNode = typeof targetObj === 'string' ? targetObj : targetObj.id || targetObj;
      
      const newEdge: FlowEdge = {
        id: `e-${sourceNode}-${targetNode}`,
        source: sourceNode,
        target: targetNode,
        type: 'custom',
        animated: true
      };
      
      // 타겟 노드 유형에 따라 연결선 스타일 설정
      const isTargetSpouse = !!tree[targetNode]?.isSpouse;
      const isTargetSibling = !!tree[targetNode]?.isSibling;
      
      if (isTargetSpouse) {
        // 배우자 연결: 수평이면 아래->위, 수직이면 오른쪽->왼쪽
        newEdge.sourceHandle = isTreeHorizontal ? Bottom : Right;
        newEdge.targetHandle = isTreeHorizontal ? Top : Left;
      } else if (isTargetSibling) {
        // 형제 연결: 수평이면 위->아래, 수직이면 왼쪽->오른쪽
        newEdge.sourceHandle = isTreeHorizontal ? Top : Left;
        newEdge.targetHandle = isTreeHorizontal ? Bottom : Right;
      } else {
        // 자식 연결: 수평이면 오른쪽->왼쪽, 수직이면 아래->위
        newEdge.sourceHandle = isTreeHorizontal ? Right : Bottom;
        newEdge.targetHandle = isTreeHorizontal ? Left : Top;
      }
      
      // 메인 노드 간 연결인지 확인
      const sourceNodeData = tree[sourceNode];
      const targetNodeData = tree[targetNode];
      
      const isMainConnection = 
        (sourceNodeData?.category === 'main' || sourceNodeData?.isMain) && 
        (targetNodeData?.category === 'main' || targetNodeData?.isMain);
      
      // 연결선 스타일 설정
      newEdge.style = { 
        stroke: isMainConnection ? '#60a5fa' : '#10b981', 
        strokeWidth: isMainConnection ? 2.5 : 1.5,
        strokeDasharray: isMainConnection ? 'none' : '5,5',
        transition: 'all 0.3s ease'
      };
      
      newEdge.hoverStyle = {
        stroke: isMainConnection ? '#93c5fd' : '#34d399',
        strokeWidth: isMainConnection ? 3.5 : 2.5,
        strokeDasharray: isMainConnection ? 'none' : '5,5',
        zIndex: 10
      };
      
      newEdge.data = {
        sourceNode: sourceNode,
        targetNode: targetNode
      };
      
      edges.push(newEdge);
    });

    // 노드 처리
    entitreeNodes.forEach((node: EntitreeNode) => {
      const nodeId = node.id;
      if (!nodeId || !tree[nodeId]) return;
      
      const isSpouse = !!tree[nodeId]?.isSpouse;
      const isSibling = !!tree[nodeId]?.isSibling;
      const isRoot = nodeId === rootId;
      
      const newNode: FlowNode = {
        id: nodeId,
        type: 'custom',
        position: {
          x: node.x || 0,
          y: node.y || 0,
        },
        data: {...(tree[nodeId] || {})}
      };
      
      // 노드 포지션 설정
      if (isSpouse) {
        newNode.sourcePosition = isTreeHorizontal ? Bottom : Right;
        newNode.targetPosition = isTreeHorizontal ? Top : Left;
      } else if (isSibling) {
        newNode.sourcePosition = isTreeHorizontal ? Top : Left;
        newNode.targetPosition = isTreeHorizontal ? Bottom : Right;
      } else {
        newNode.sourcePosition = isTreeHorizontal ? Right : Bottom;
        newNode.targetPosition = isTreeHorizontal ? Left : Top;
      }
      
      // 노드 타입 결정 (메인/하위)
      const originalData = tree[nodeId];
      const isMainNode = originalData.category === 'main' || originalData.isMain;
      
      newNode.data = { 
        ...originalData,
        label: originalData.name, 
        direction,
        isRoot,
        isSpouse,
        isSibling,
        isMainNode,
        hasChildren: originalData.children?.length > 0,
        hasSiblings: originalData.siblings?.length > 0,
        hasSpouses: originalData.spouses?.length > 0
      };
      
      newNode.width = nodeWidth;
      newNode.height = nodeHeight;
      
      nodes.push(newNode);
    });

    return { nodes, edges };
  } catch (error) {
    console.error('Entitree 레이아웃 오류:', error);
    return createSimpleLayout(tree, rootId, isTreeHorizontal);
  }
};

// 간단한 폴백 레이아웃 생성 함수
const createSimpleLayout = (tree, rootId, isHorizontal) => {
  const nodes = [];
  const edges = [];
  const processed = new Set();
  
  // 간단한 그리드 레이아웃 생성
  let x = 0;
  let y = 0;
  const xGap = 250;
  const yGap = 150;
  
  const processNode = (nodeId, level = 0, column = 0) => {
    if (processed.has(nodeId) || !tree[nodeId]) return;
    processed.add(nodeId);
    
    const nodeData = tree[nodeId];
    
    // 노드 생성
    nodes.push({
      id: nodeId,
      type: 'custom',
      position: {
        x: isHorizontal ? level * xGap : column * xGap,
        y: isHorizontal ? column * yGap : level * yGap
      },
      data: {
        ...nodeData,
        label: nodeData.name,
        isRoot: nodeId === rootId
      }
    });
    
    // 자식 노드 처리 및 엣지 생성
    if (nodeData.children && Array.isArray(nodeData.children)) {
      nodeData.children.forEach((childId, idx) => {
        if (!processed.has(childId) && tree[childId]) {
          // 엣지 생성
          edges.push({
            id: `e-${nodeId}-${childId}`,
            source: nodeId,
            target: childId,
            type: 'custom',
            animated: true
          });
          
          // 자식 노드 재귀 처리
          processNode(childId, level + 1, column + idx);
        }
      });
    }
  };
  
  // 루트 노드부터 시작
  processNode(rootId);
  
  return { nodes, edges };
};

// 카테고리 로드맵 플로우 레이아웃 생성
export const createCategoryFlowLayout = (roadmapNodes: RoadmapNode[]) => {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  // 카테고리 노드 데이터 매핑
  const nodeMap: Record<string, RoadmapNode> = {};
  roadmapNodes.forEach(node => {
    nodeMap[node.id] = node;
  });
  
  // 노드 위치 계산을 위한 변수
  const levelMap: Record<string, number> = {};
  const columnMap: Record<string, number> = {};
  
  // 레벨별 노드 그룹화
  const levelGroups: Record<string, string[]> = {};
  
  // 의존성 그래프 생성
  const dependencies: Record<string, string[]> = {};
  const dependents: Record<string, string[]> = {};
  
  // 의존성 관계 설정
  roadmapNodes.forEach(node => {
    const nodeId = node.id;
    const level = node.data.level || '초급';
    const prerequisites = node.data.prerequisites || [];
    
    if (!levelGroups[level]) {
      levelGroups[level] = [];
    }
    levelGroups[level].push(nodeId);
    
    // 의존성 추적
    dependencies[nodeId] = prerequisites;
    
    // 역방향 의존성 추적
    prerequisites.forEach(prereqId => {
      if (!dependents[prereqId]) {
        dependents[prereqId] = [];
      }
      if (!dependents[prereqId].includes(nodeId)) {
        dependents[prereqId].push(nodeId);
      }
    });
  });
  
  // 레벨 매핑 (깊이)
  let levelIndex = 0;
  ['초급', '중급', '고급'].forEach(level => {
    levelMap[level] = levelIndex++;
  });
  
  // 노드별 레벨 위치 계산 (각 레벨 내에서의 배치)
  Object.entries(levelGroups).forEach(([level, nodeIds]) => {
    nodeIds.forEach((nodeId, index) => {
      columnMap[nodeId] = index;
    });
  });
  
  // 루트 노드 찾기 (선행 조건이 없는 노드)
  const rootNodes = roadmapNodes
    .filter(node => !node.data.prerequisites || node.data.prerequisites.length === 0)
    .map(node => node.id);
  
  // 가상 루트 노드 추가 (실제 루트 노드가 여러 개일 경우)
  const virtualRootId = 'virtual-root';
  const hasMultipleRoots = rootNodes.length > 1;
  
  if (hasMultipleRoots) {
    nodes.push({
      id: virtualRootId,
      type: 'default',
      position: { x: 0, y: 0 },
      data: { 
        label: "로드맵 시작점",
        direction: 'LR'
      },
      style: { 
        width: 120,
        height: 40,
        fontSize: '0.85rem',
        textAlign: 'center',
        backgroundColor: 'rgba(3, 102, 214, 0.05)',
        border: '2px solid var(--vscode-terminal-ansiCyan)',
        borderRadius: 20,
        padding: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }
    });
    
    // 가상 루트와 실제 루트 노드 연결
    rootNodes.forEach(rootId => {
      edges.push({
        id: `e-${virtualRootId}-${rootId}`,
        source: virtualRootId,
        target: rootId,
        type: 'custom',
        animated: true,
        style: {
          stroke: 'var(--vscode-terminal-ansiCyan)',
          opacity: 0.6
        }
      });
    });
  }
  
  // 모든 노드 추가
  roadmapNodes.forEach(node => {
    const level = node.data.level || '초급';
    const levelStyle = {
      '초급': {
        backgroundColor: 'rgba(3, 102, 214, 0.05)',
        borderColor: 'var(--vscode-terminal-ansiBlue)',
        headerColor: 'var(--vscode-terminal-ansiBlue)',
        iconEmoji: '🔰'
      },
      '중급': {
        backgroundColor: 'rgba(227, 177, 4, 0.05)',
        borderColor: 'var(--vscode-terminal-ansiYellow)',
        headerColor: 'var(--vscode-terminal-ansiYellow)',
        iconEmoji: '🏆'
      },
      '고급': {
        backgroundColor: 'rgba(209, 36, 47, 0.05)',
        borderColor: 'var(--vscode-terminal-ansiRed)',
        headerColor: 'var(--vscode-terminal-ansiRed)',
        iconEmoji: '🚀'
      }
    }[level];
    
    // 노드 배치 계산 - 수평 그리드 레이아웃
    const xPosition = 250 * (levelMap[level] + 1); // 레벨에 따른 X 좌표
    const yPosition = 200 * (columnMap[node.id] || 0); // 열 위치에 따른 Y 좌표
    
    // React Flow 노드 객체 생성
    nodes.push({
      id: node.id,
      type: 'custom',
      position: { x: xPosition, y: yPosition },
      data: {
        name: node.data.title,
        description: node.data.description,
        label: node.data.title,
        level: level,
        direction: 'LR',
        hasChildren: (dependents[node.id]?.length || 0) > 0,
        hasSiblings: false, // 형제 관계는 간단하게 처리
        hasSpouses: false,  // 배우자 관계는 간단하게 처리
        style: levelStyle,
        isMainNode: true,
        thumbnail: node.data.thumbnail,
        featured: node.data.featured
      }
    });
    
    // 현재 노드에서 나가는 엣지 생성 (설명서의 next 관계 사용)
    const nextNodes = node.data.next || [];
    nextNodes.forEach(targetId => {
      if (nodeMap[targetId]) { // 대상 노드가 현재 카테고리에 있는지 확인
        edges.push({
          id: `e-${node.id}-${targetId}`,
          source: node.id,
          target: targetId,
          type: 'custom',
          animated: true,
          style: {
            stroke: '#60a5fa',
            strokeWidth: 2,
            transition: 'all 0.3s ease'
          },
          hoverStyle: {
            stroke: '#93c5fd',
            strokeWidth: 3,
            zIndex: 10
          }
        });
      }
    });
  });
  
  return { nodes, edges };
};
