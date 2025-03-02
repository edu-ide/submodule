import React, { useMemo, useEffect } from 'react';
import { Edge, Node } from '@xyflow/react';
import { RoadmapData, RoadmapNode, RoadmapEdge } from '../types';
import { setBottomMessage } from '@/redux/slices/uiStateSlice';
import { useDispatch } from 'react-redux';

interface NodeData {
  title: string;
  description: string;
  status: string;
  column?: string;
  content_section?: string;
  label?: string;
  content_file?: string;
  order?: string;
  // 타입 오류를 해결하기 위해 any 타입 사용
  [key: string]: any;
}

interface TableOfContentsViewProps {
  roadmapContent: RoadmapData;
  onNodeClick: (event: React.MouseEvent, node: any) => void;
}

// 목차 뷰 컴포넌트
const TableOfContentsView: React.FC<TableOfContentsViewProps> = ({ roadmapContent, onNodeClick }) => {
  // roadmapContent 유효성 검사
  const validRoadmapContent = useMemo(() => {
    console.log('roadmapContent 검증:', roadmapContent);
    return roadmapContent && 
           Array.isArray(roadmapContent.nodes) && 
           Array.isArray(roadmapContent.edges) && 
           roadmapContent.nodes.length > 0;
  }, [roadmapContent]);

  // roadmapContent에서 nodes와 edges 추출
  const nodes = useMemo(() => {
    if (!validRoadmapContent) return [];
    
    // 적절한 타입 변환 및 데이터 검증
    try {
      const convertedNodes = roadmapContent.nodes.map(node => {
        // 필수 필드 확인 및 추가
        if (!node.id) {
          console.warn('노드에 ID가 없습니다:', node);
          node.id = `node-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // data 객체 확인
        if (!node.data) {
          console.warn('노드에 data 객체가 없습니다. 기본값 추가:', node.id);
          node.data = { title: `노드 ${node.id}`, description: '', status: 'not-started' };
        }
        
        return node as unknown as RoadmapNode;
      });
      
      console.log(`${convertedNodes.length}개의 노드 변환 완료`);
      return convertedNodes;
    } catch (error) {
      console.error('노드 변환 중 오류 발생:', error);
      return [];
    }
  }, [roadmapContent, validRoadmapContent]);
  
  const edges = useMemo(() => {
    if (!validRoadmapContent) return [];
    
    // 적절한 타입 변환 및 데이터 검증
    try {
      const convertedEdges = roadmapContent.edges.map(edge => {
        // 필수 필드 확인 및 추가
        if (!edge.id) {
          console.warn('엣지에 ID가 없습니다:', edge);
          edge.id = `edge-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        if (!edge.source || !edge.target) {
          console.warn('엣지에 source 또는 target이 없습니다:', edge);
          // source나 target이 없는 엣지는 건너뜀
          return null;
        }
        
        return edge as unknown as RoadmapEdge;
      }).filter(edge => edge !== null);
      
      console.log(`${convertedEdges.length}개의 엣지 변환 완료`);
      return convertedEdges;
    } catch (error) {
      console.error('엣지 변환 중 오류 발생:', error);
      return [];
    }
  }, [roadmapContent, validRoadmapContent]);

  const dispatch = useDispatch();
  
  // 데이터 로깅은 useEffect에서 한 번만 실행
  useEffect(() => {
    if (validRoadmapContent) {
      console.log('로드된 데이터:', { 
        nodes: nodes.map(n => ({ id: n.id, order: n.data?.order })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
      });
    } else {
      console.warn('유효한 로드맵 데이터가 없습니다:', roadmapContent);
    }
  }, [nodes, edges, dispatch, validRoadmapContent]);

  // 데이터가 없으면 빈 상태 표시
  if (!validRoadmapContent) {
    return (
      <div className="toc-container">
        <h2 className="toc-header">파이썬 학습 로드맵</h2>
        <div className="empty-state">
          <p>로드맵 데이터를 불러올 수 없습니다.</p>
          <p>데이터가 올바르게 전달되었는지 확인해주세요.</p>
        </div>
        <style jsx>{`
          .empty-state {
            padding: 20px;
            text-align: center;
            color: var(--vscode-disabledForeground);
          }
        `}</style>
      </div>
    );
  }

  // 노드 데이터로부터 계층 구조 정보 생성
  const buildHierarchy = () => {
    // 각 노드의 부모-자식 관계를 분석
    const nodeMap = {};
    const rootNodes = [];
    const childMap = {};
    
    // 엣지를 기반으로 부모-자식 관계 구성
    edges.forEach(edge => {
      const sourceId = edge.source;
      const targetId = edge.target;
      
      if (!childMap[sourceId]) {
        childMap[sourceId] = [];
      }
      childMap[sourceId].push(targetId);
    });
    
    // 노드 정보 맵 구성
    nodes.forEach(node => {
      nodeMap[node.id] = {
        ...node,
        children: childMap[node.id] || [],
        level: 0, // 기본 레벨 설정
        isChild: node.data?.column === 'child' || (node.data as any)?.type === 'child'
      };
    });
    
    // 최상위 노드와 자식 노드 식별
    nodes.forEach(node => {
      const isRootNode = !edges.some(edge => edge.target === node.id);
      if (isRootNode) {
        rootNodes.push(node.id);
      }
    });
    
    // 개발 모드에서만 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('최상위 노드:', rootNodes);
    }
    
    // 각 노드의 레벨 설정
    const assignLevels = (nodeId, level) => {
      if (!nodeMap[nodeId]) return;
      
      nodeMap[nodeId].level = level;
      const children = childMap[nodeId] || [];
      children.forEach(childId => {
        assignLevels(childId, level + 1);
      });
    };
    
    // 루트 노드부터 시작하여 모든 노드에 레벨 할당
    rootNodes.forEach(rootId => {
      assignLevels(rootId, 0);
    });
    
    return { nodeMap, rootNodes, childMap };
  };
  
  const { nodeMap, rootNodes, childMap } = buildHierarchy();
  
  // order 문자열을 비교하는 함수 (예: "1.2.3"과 "1.10" 비교)
  const compareOrderStrings = (orderA: string, orderB: string): number => {
    // null 또는 undefined 처리
    if (!orderA && !orderB) return 0;
    if (!orderA) return 1; // order가 없는 항목은 맨 뒤로
    if (!orderB) return -1; // order가 있는 항목이 먼저 오도록
    
    const partsA = orderA.split('.').map(part => parseInt(part, 10) || 0);
    const partsB = orderB.split('.').map(part => parseInt(part, 10) || 0);
    
    // 두 배열의 길이 중 더 긴 것을 기준으로 비교
    const maxLength = Math.max(partsA.length, partsB.length);
    
    for (let i = 0; i < maxLength; i++) {
      // 해당 인덱스의 값이 없는 경우 0으로 처리
      const valueA = i < partsA.length ? partsA[i] : 0;
      const valueB = i < partsB.length ? partsB[i] : 0;
      
      if (valueA !== valueB) {
        return valueA - valueB;
      }
    }
    
    // 모든 부분이 같은 경우 0 반환
    return 0;
  };

  // order 문자열을 배열로 변환하는 함수
  const parseOrder = (order: string): number[] => {
    if (!order) return [];
    return order.split('.').map(part => parseInt(part, 10) || 0);
  };

  // 주어진 order가 다른 order의 하위 order인지 확인하는 함수
  const isSubOrder = (parent: string, child: string): boolean => {
    if (!parent || !child) return false;
    
    const parentParts = parseOrder(parent);
    const childParts = parseOrder(child);
    
    if (childParts.length <= parentParts.length) return false;
    
    // 자식 order의 모든 부모 부분이 일치하는지 확인
    for (let i = 0; i < parentParts.length; i++) {
      if (parentParts[i] !== childParts[i]) return false;
    }
    
    return true;
  };
  
  // 계층 구조를 생성하는 함수
  const buildOrderedHierarchy = () => {
    // 더 강화된 디버깅 로그 추가
    console.log('buildOrderedHierarchy 실행', { 
      노드수: nodes.length, 
      샘플노드: nodes.length > 0 ? { 
        id: nodes[0].id, 
        data: nodes[0].data,
        type: nodes[0].type 
      } : 'none'
    });

    // order가 있는 노드와 없는 노드 분리
    const nodesWithOrder = nodes.filter(node => node.data?.order);
    const nodesWithoutOrder = nodes.filter(node => !node.data?.order);
    
    console.log('노드 분류', { 
      order있음: nodesWithOrder.length, 
      order없음: nodesWithoutOrder.length 
    });
    
    // 최종 계층 구조
    const result = [];
    
    // order 기준으로 정렬
    nodesWithOrder.sort((a, b) => compareOrderStrings(a.data?.order as string || '', b.data?.order as string || ''));
    
    // 루트 노드 찾기 (1, 2, 3과 같은 order를 가진 노드)
    const rootOrderNodes = nodesWithOrder.filter(node => {
      const order = node.data?.order as string || '';
      return order && !order.includes('.'); // 점이 없는 order는 루트 노드
    });
    
    console.log('루트 노드 수:', rootOrderNodes.length);
    
    // 루트 노드가 없는 경우 처리 추가
    if (rootOrderNodes.length === 0 && nodesWithOrder.length > 0) {
      // 모든 노드가 하위 노드인 경우, order의 첫 번째 부분을 기준으로 그룹화
      const orderGroups = {};
      
      nodesWithOrder.forEach(node => {
        const order = node.data?.order as string || '';
        const firstPart = order.split('.')[0];
        
        if (!orderGroups[firstPart]) {
          orderGroups[firstPart] = [];
        }
        orderGroups[firstPart].push(node);
      });
      
      // 각 그룹을 정렬하여 추가
      Object.keys(orderGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(groupKey => {
        const groupNodes = orderGroups[groupKey];
        groupNodes.sort((a, b) => compareOrderStrings(a.data?.order as string || '', b.data?.order as string || ''));
        groupNodes.forEach(node => result.push(node));
      });
    } else {
      // 기존 로직: 각 루트 노드에 대해 계층 구조 구성
      rootOrderNodes.forEach(rootNode => {
        const rootOrder = rootNode.data?.order as string || '';
        
        // 루트 노드 추가
        result.push(rootNode);
        
        // 해당 루트의 모든 하위 노드 찾기 (1.로 시작하는 모든 order)
        const childNodes = nodesWithOrder.filter(node => {
          const nodeOrder = node.data?.order as string || '';
          return nodeOrder !== rootOrder && isSubOrder(rootOrder, nodeOrder);
        });
        
        // 하위 노드들 정렬해서 추가
        childNodes.sort((a, b) => compareOrderStrings(a.data?.order as string || '', b.data?.order as string || ''));
        childNodes.forEach(childNode => {
          result.push(childNode);
        });
      });
    }
    
    // order가 없는 노드들은 마지막에 추가
    nodesWithoutOrder.forEach(node => {
      result.push(node);
    });
    
    console.log('최종 결과 노드 수:', result.length);
    
    // 빈 결과 처리: 결과가 비어 있지만 입력 노드가 있는 경우 모든 노드를 반환
    if (result.length === 0 && nodes.length > 0) {
      console.log('결과가 비어있어 모든 노드를 원본 상태로 반환합니다.');
      return [...nodes];
    }
    
    return result;
  };
  
  const sortedNodes = buildOrderedHierarchy();
  
  // 개발 모드에서만 디버깅 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log('정렬된 노드의 order 값:', sortedNodes.map(node => ({ 
      id: node.id, 
      order: node.data?.order || '없음',
      title: node.data?.title || node.id
    })));
  }

  // 항상 결과 길이는 로깅
  console.log(`최종 정렬된 노드 ${sortedNodes.length}개, 표시 준비 완료`);

  return (
    <div className="toc-container">
      <h2 className="toc-header">파이썬 학습 로드맵</h2>
      
      {Array.isArray(sortedNodes) && sortedNodes.length > 0 ? (
        sortedNodes.map((node) => {
          if (!node || !node.id) {
            console.warn('유효하지 않은 노드 발견, 건너뜀:', node);
            return null;
          }
          
          // order 기반 레벨 사용 (없으면 물리적 트리 레벨 사용)
          const orderParts = node.data?.order ? node.data.order.split('.') : [];
          const level = orderParts.length ? orderParts.length - 1 : (node.level || 0);
          
          const isMainNode = node.data?.column === 'main';
          const isChildNode = node.data?.column === 'child' || (node.data as any)?.type === 'child';
          const hasChildren = (childMap[node.id] || []).length > 0;
          
          // 부모 노드에 대한 content_section 추가
          let contentSection = node.data?.content_section;
          
          // 하위 노드에 대한 content_section이 없고, title이 있는 경우
          // title을 content_section으로 사용 (부모 콘텐츠 내 해당 섹션으로 스크롤하기 위함)
          if (isChildNode && !contentSection && node.data?.title) {
            contentSection = node.data.title;
            // 한 번 로깅
            if (process.env.NODE_ENV === 'development') {
              console.log(`하위 노드 ${node.id}의 content_section이 없어 title로 대체:`, contentSection);
            }
          }
          
          // 데이터 속성에 content_section 추가 (원본 데이터에 직접 수정은 없음)
          const nodeWithSection = {
            ...node,
            data: {
              ...node.data,
              content_section: contentSection
            }
          };
          
          let itemClass = "toc-item";
          if (node.data?.status) itemClass += ` ${node.data.status}`;
          if (isMainNode) itemClass += " main-node";
          if (isChildNode) itemClass += " child-node";
          if (hasChildren) itemClass += " has-children";
          
          // order 표시를 위한 로직
          const orderDisplay = node.data?.order || '';
          
          return (
            <div 
              key={node.id} 
              className={itemClass}
              style={{ marginLeft: `${level * 15}px` }}
              onClick={(e) => onNodeClick(e, nodeWithSection)}
            >
              {isChildNode ? (
                <span className="toc-icon">•</span>
              ) : hasChildren ? (
                <span className="toc-icon">📚</span>
              ) : (
                <span className="toc-icon">📝</span>
              )}
              
              {orderDisplay && (
                <span className="toc-order">{orderDisplay}</span>
              )}
              
              <span className="toc-title">
                {node.data?.label || node.data?.title || node.id}
                {!orderDisplay && <small className="missing-order"> (순서 정보 없음)</small>}
              </span>
              
              {node.data?.status === 'completed' && (
                <span className="toc-status-icon completed">✅</span>
              )}
              {node.data?.status === 'in-progress' && (
                <span className="toc-status-icon in-progress">🔄</span>
              )}
            </div>
          );
        }).filter(item => item !== null)
      ) : (
        <div className="empty-nodes">
          <p>표시할 로드맵 노드가 없습니다.</p>
          <p className="debug-info">
            검증된 데이터: {validRoadmapContent ? 'O' : 'X'}, 
            노드 수: {nodes.length}, 
            정렬된 노드 수: {sortedNodes.length}
          </p>
        </div>
      )}
      
      <style jsx>{`
        .toc-container {
          padding: 20px;
          overflow-y: auto;
          height: 100%;
          background: var(--vscode-editor-background);
        }
        
        .toc-header {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--vscode-panel-border);
          color: var(--vscode-editor-foreground);
          font-size: 1.5em;
        }
        
        .empty-nodes {
          padding: 20px;
          text-align: center;
          color: var(--vscode-disabledForeground);
        }
        
        .debug-info {
          margin-top: 10px;
          font-size: 0.8em;
          padding: 8px;
          background: var(--vscode-editor-inactiveSelectionBackground);
          border-radius: 4px;
          color: var(--vscode-descriptionForeground);
        }
        
        .toc-item {
          padding: 8px 10px;
          margin: 3px 0;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          background: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          transition: all 0.2s ease;
          max-width: calc(100% - 5px);
        }
        
        .toc-item:hover {
          background: var(--vscode-list-hoverBackground);
          transform: translateX(3px);
        }
        
        .toc-icon {
          margin-right: 6px;
          font-size: 14px;
          width: 16px;
          display: flex;
          justify-content: center;
        }
        
        .toc-order {
          min-width: 45px;
          margin-right: 10px;
          color: #ffffff;
          font-weight: 700;
          background-color: var(--vscode-terminal-ansiBlue);
          padding: 3px 8px;
          border-radius: 4px;
          text-align: center;
          display: inline-block;
          font-size: 0.9em;
          border: 1px solid var(--vscode-terminal-ansiBlue);
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
          position: relative;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .toc-order::before {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7em;
          color: var(--vscode-descriptionForeground);
          font-weight: normal;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .toc-item:hover .toc-order::before {
          opacity: 1;
        }
        
        .missing-order {
          color: var(--vscode-errorForeground);
          margin-left: 5px;
          font-size: 0.8em;
        }
        
        .toc-title {
          flex: 1;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .toc-status-icon {
          font-size: 14px;
          margin-left: 8px;
          flex-shrink: 0;
        }
        
        /* 상위 목차 스타일 */
        .main-node {
          background: var(--vscode-tab-activeBackground);
          border-left: 4px solid var(--vscode-terminal-ansiBlue);
          font-weight: 600;
          font-size: 1.05em;
        }
        
        /* 하위 목차 스타일 */
        .child-node {
          background: var(--vscode-editor-background);
          border-left: 4px solid var(--vscode-terminal-ansiCyan);
          font-size: 0.95em;
          opacity: 0.9;
        }
        
        /* 자식이 있는 노드 스타일 */
        .has-children {
          border-bottom: 2px solid var(--vscode-editor-lineHighlightBorder);
        }
        
        /* 상태 표시 스타일 */
        .completed {
          border-left-color: var(--vscode-terminal-ansiGreen);
        }
        
        .in-progress {
          border-left-color: var(--vscode-terminal-ansiYellow);
        }
      `}</style>
    </div>
  );
};

export default TableOfContentsView; 