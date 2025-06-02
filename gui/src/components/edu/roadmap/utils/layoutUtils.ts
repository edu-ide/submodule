import { useCallback } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { ReactFlowInstance } from '@xyflow/react';

// ELK 타입 정의 확장
interface ElkExtendedEdge {
  id: string;
  sources: string[];
  targets: string[];
  [key: string]: any;
}

// ELK 인스턴스 생성
const elk = new ELK();

/**
 * ELK 레이아웃 훅
 */
export const useLayoutedElements = (reactFlowInstance: ReactFlowInstance | null) => {
  // 기본 레이아웃 옵션 설정
  const defaultOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
  };
  
  const getLayoutedElements = useCallback((options: any) => {
    const layoutOptions = { ...defaultOptions, ...options };
    
    if (!reactFlowInstance) {
      console.warn('React Flow 인스턴스가 없습니다');
      return;
    }
    
    // Edge를 ElkExtendedEdge로 변환
    const elkEdges = reactFlowInstance.getEdges().map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      ...edge
    }));
    
    const graph = {
      id: 'root',
      layoutOptions: layoutOptions,
      children: reactFlowInstance.getNodes().map((node) => ({
        ...node,
        width: node.width || 180,
        height: node.height || 70,
      })),
      edges: elkEdges,
    };
    
    elk.layout(graph).then(({ children }) => {
      // 노드 위치 업데이트
      const updatedNodes = children.map(elkNode => {
        const node = reactFlowInstance.getNodes().find(n => n.id === elkNode.id);
        return {
          ...node,
          position: { x: elkNode.x, y: elkNode.y }
        };
      });
      
      reactFlowInstance.setNodes(updatedNodes);
      window.requestAnimationFrame(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      });
    });
  }, [reactFlowInstance]);
  
  return { getLayoutedElements };
};

/**
 * ELK 레이아웃 적용 함수
 */
export const applyElkLayout = (
  reactFlowInstance: ReactFlowInstance | null,
  algorithm: string,
  direction: string = 'RIGHT',
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  if (!reactFlowInstance) return;
  
  const defaultOptions = {
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
  };
  
  const options: any = {
    ...defaultOptions,
    'elk.algorithm': algorithm.startsWith('org.eclipse.elk') 
      ? algorithm 
      : `org.eclipse.elk.${algorithm}`
  };
  
  // 알고리즘별 추가 옵션 설정
  if (algorithm === 'layered') {
    options['elk.direction'] = direction;
  } else if (algorithm === 'org.eclipse.elk.radial') {
    options['elk.radial.radius'] = '300';
    options['elk.radial.compaction'] = '0.4';
  } else if (algorithm === 'org.eclipse.elk.force') {
    options['elk.force.iterations'] = '100';
    options['elk.force.repulsion'] = '5';
  }
  
  // Edge를 ElkExtendedEdge로 변환
  const elkEdges = reactFlowInstance.getEdges().map(edge => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
    ...edge
  }));
  
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: reactFlowInstance.getNodes().map((node) => ({
      ...node,
      width: node.width || 180,
      height: node.height || 70,
    })),
    edges: elkEdges,
  };
  
  // ELK 레이아웃 실행
  elk.layout(graph)
    .then(({ children }) => {
      // 노드 위치 업데이트
      const updatedNodes = children.map(elkNode => {
        const node = reactFlowInstance.getNodes().find(n => n.id === elkNode.id);
        return {
          ...node,
          position: { x: elkNode.x, y: elkNode.y }
        };
      });
      
      reactFlowInstance.setNodes(updatedNodes);
      window.requestAnimationFrame(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      });
      
      if (onSuccess) onSuccess();
    })
    .catch(error => {
      console.error('ELK 레이아웃 오류:', error);
      if (onError) onError(error);
    });
}; 