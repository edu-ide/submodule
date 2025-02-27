import { Position } from '@xyflow/react';
import { layoutFromMap } from 'entitree-flex';

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

// 노드 크기
const nodeWidth = 180;
const nodeHeight = 100;

// 엔티티 레이아웃 설정 - 간격 값을 절반으로 줄임
const entitreeSettings = {
  clone: true, 
  enableFlex: true,
  firstDegreeSpacing: 80,  // 160에서 80으로 줄임
  nextAfterAccessor: 'spouses',
  nextAfterSpacing: 60,    // 120에서 60으로 줄임
  nextBeforeAccessor: 'siblings',
  nextBeforeSpacing: 60,   // 120에서 60으로 줄임
  nodeHeight,
  nodeWidth,
  rootX: 0,
  rootY: 0,
  secondDegreeSpacing: 50, // 100에서 50으로 줄임
  sourcesAccessor: 'parents',
  sourceTargetSpacing: 75, // 150에서 75로 줄임
  targetsAccessor: 'children',
};

const { Top, Bottom, Left, Right } = Position;

// Edge 타입 정의 추가
interface CustomEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  sourceHandle?: string;
  targetHandle?: string;
  style?: any;
}

// 레이아웃 요소 계산 함수
export const layoutElements = (tree, rootId, direction = 'TB') => {
  const isTreeHorizontal = direction === 'LR';

  // entitree-flex 라이브러리 사용
  const { nodes: entitreeNodes, rels: entitreeEdges } = layoutFromMap(
    rootId,
    tree,
    {
      ...entitreeSettings,
      orientation: isTreeHorizontal
        ? Orientation.Horizontal
        : Orientation.Vertical,
    } as any // 임시로 타입 단언
  );

  const nodes = [], edges = [];

  // 엣지 처리
  entitreeEdges.forEach((edge) => {
    // 타입 단언으로 안전한 속성 접근
    const sourceAny = edge.source as any;
    const targetAny = edge.target as any;
    
    const sourceNode = typeof sourceAny === 'string' ? sourceAny : sourceAny.id || sourceAny.entity?.id || sourceAny;
    const targetNode = typeof targetAny === 'string' ? targetAny : targetAny.id || targetAny.entity?.id || targetAny;

    // 명시적 핸들 ID 설정
    const sourceHandleId = `source-${isTreeHorizontal ? Position.Right : Position.Bottom}`;
    const targetHandleId = `target-${isTreeHorizontal ? Position.Left : Position.Top}`;
    
    // 타겟 노드 유형에 따라 연결선 스타일 설정
    const sourceNodeData = tree[sourceNode];
    const targetNodeData = tree[targetNode];
    
    // 메인 노드 간 연결인지 확인
    const isMainConnection = 
      (sourceNodeData?.category === 'main' || sourceNodeData?.isMain) && 
      (targetNodeData?.category === 'main' || targetNodeData?.isMain);
    
    const newEdge = {
      id: `e-${sourceNode}-${targetNode}`,
      source: sourceNode,
      target: targetNode,
      sourceHandle: sourceHandleId,
      targetHandle: targetHandleId,
      type: 'bezier',
      animated: !isMainConnection,
      style: { 
        stroke: isMainConnection ? '#60a5fa' : '#10b981', 
        strokeWidth: isMainConnection ? 2.5 : 1.5,
        strokeDasharray: isMainConnection ? 'none' : '5,5'
      },
      zIndex: 0
    } as CustomEdge;

    edges.push(newEdge);
  });

  // 노드 처리
  entitreeNodes.forEach((entitreeNode) => {
    // 타입 단언과 안전한 속성 접근
    const entitreeNodeAny = entitreeNode as any;
    const nodeId = entitreeNodeAny.id || entitreeNodeAny.entity?.id;
    if (!nodeId || !tree[nodeId]) return;
    
    // 콘솔에 실제 구조 출력 (디버깅용)
    // console.log('Entitree node:', entitreeNode);
    
    const originalData = tree[nodeId];
    const isSpouse = !!originalData.isSpouse;
    const isSibling = !!originalData.isSibling;
    const isRoot = nodeId === rootId;

    // 노드 타입 결정 (메인/하위)
    const isMainNode = originalData.category === 'main' || originalData.isMain;
    const nodeType = isMainNode ? 'mainNode' : 'subNode';
    
    const newNode = {
      id: nodeId,
      type: 'custom',
      data: { 
        ...originalData,
        label: originalData.name, 
        direction,
        isRoot,
        isSpouse,
        isSibling,
        isMainNode, // 메인 노드 여부 추가
        hasChildren: originalData.children?.length > 0,
        hasSiblings: originalData.siblings?.length > 0,
        hasSpouses: originalData.spouses?.length > 0
      },
      position: {
        x: entitreeNode.x,
        y: entitreeNode.y,
      },
      width: nodeWidth,
      height: nodeHeight
    };

    nodes.push(newNode);
  });

  // 최종 결과 디버깅
  console.log('Final nodes:', nodes);
  console.log('Final edges:', edges);
  // 첫 번째 엣지 샘플 확인
  if (edges.length > 0) {
    console.log('Sample edge:', edges[0]);
  }

  return { nodes, edges };
}; 