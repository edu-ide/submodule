import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Panel,
  Node as FlowNode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate, useParams } from 'react-router-dom';

// 로컬 컴포넌트 및 유틸 임포트
import NodeContent from './roadmap/NodeContent';
import { layoutElements } from './roadmap/layout-elements';
import { pythonNodes, pythonEdges } from './roadmap/constants';
import { RoadmapViewProps } from './types';

// 노드 타입 정의
const nodeTypes = {
  custom: NodeContent,
  roadmapNode: NodeContent,
  groupNode: NodeContent
};

// 메인 RoadmapView 컴포넌트
const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmapId, onBack }) => {
  const { roadmapId: urlRoadmapId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // 라우터 훅 사용
  const navigate = useNavigate();
  
  // 라우터 파라미터로 roadmapId 얻기
  const routerRoadmapId = roadmapId || urlRoadmapId || 'python';
  
  // 컴포넌트 마운트 시 데이터 로드
  React.useEffect(() => {
    loadRoadmapData(routerRoadmapId);
  }, [routerRoadmapId]);
  
  // 로드맵 데이터 로드 함수
  const loadRoadmapData = (id: string) => {
    console.log('Loading roadmap data for:', id);
    console.log('Python nodes:', pythonNodes);
    console.log('Python edges:', pythonEdges);
    
    // 원본 데이터 변환
    const originalData = transformToTreeFormat(pythonNodes, pythonEdges);
    console.log('Original tree data:', originalData);
    
    // 루트 노드 ID 확인
    const rootId = Object.keys(originalData).find(id => !originalData[id].parents?.length) || 'python';
    console.log('Root ID:', rootId);
    
    // Entitree Flex Tree 레이아웃 적용 - LR(왼쪽에서 오른쪽) 방향으로 변경
    const { nodes: layoutedNodes, edges: layoutedEdges } = 
      layoutElements(originalData, rootId, 'LR');
    
    console.log('Layouted nodes:', layoutedNodes);
    console.log('Layouted edges:', layoutedEdges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };
  
  // 노드 클릭 핸들러 - 콘텐츠 페이지로 이동
  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    if (node.type === 'groupNode') return;
    navigate(`/education/roadmap/${routerRoadmapId}/content/${node.id}`);
  }, [navigate, routerRoadmapId]);
  
  // 레이아웃 방향 변경
  const onLayout = useCallback((direction: 'TB' | 'LR') => {
    const originalData = transformToTreeFormat(pythonNodes, pythonEdges);
    const rootId = Object.keys(originalData).find(id => !originalData[id].parents?.length) || 'python';
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = 
      layoutElements(originalData, rootId, direction);
    
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, []);
  
  // 렌더링 직전 엣지 데이터 확인
  useEffect(() => {
    console.log('About to render with edges:', edges);
    if (edges.length > 0) {
      console.log('First edge details:', {
        id: edges[0].id,
        source: edges[0].source,
        target: edges[0].target,
        sourceHandle: edges[0].sourceHandle,
        targetHandle: edges[0].targetHandle
      });
    }
  }, [edges]);
  
  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
        {/* 헤더 내용은 제거됨 */}
      </div>
      
      <div className="flow-container" style={{ 
        height: '100%', 
        width: '100%',
        overflow: 'hidden'
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.Bezier}
          defaultEdgeOptions={{
            animated: true,
            style: { 
              stroke: '#94a3b8', 
              strokeWidth: 1.5,
              opacity: 0.8
            },
            type: 'bezier'
          }}
          fitView
          fitViewOptions={{ padding: 0.7 }}
          minZoom={0.4}
          maxZoom={2.5}
          elementsSelectable={true}
          snapToGrid={true}
          snapGrid={[16, 16]}
        >
          <Panel position="top-right">
            <button onClick={() => onLayout('TB')} className="layout-button">수직 레이아웃</button>
            <button onClick={() => onLayout('LR')} className="layout-button">수평 레이아웃</button>
          </Panel>
          <Controls position="top-right" />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>

      <style jsx>{`
        .roadmap-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
        }
        
        .roadmap-header {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .flow-container {
          flex: 1;
          position: relative;
        }
        
        .layout-button {
          margin-right: 8px;
          padding: 6px 12px;
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .layout-button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
      `}</style>
    </div>
  );
};

// 기존 데이터를 Entitree 형식으로 변환하는 함수
const transformToTreeFormat = (nodes: any[], edges: any[]) => {
  const treeData: any = {};
  
  // 노드 변환
  nodes.forEach(node => {
    // 메인 노드 여부 판단 (column 속성이 있으면 메인 노드로 간주)
    const isMain = !!node.data?.column;
    
    treeData[node.id] = {
      id: node.id,
      name: node.data?.title || node.id,
      description: node.data?.description || '',
      status: node.data?.status || 'not-started',
      type: node.type,
      isMain, // 메인 노드 여부 추가
      category: isMain ? 'main' : 'sub',
      children: [],
      siblings: [],
      spouses: []
    };
  });
  
  // 엣지 기반으로 관계 설정
  edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    
    // 관계 유형에 따라 분류
    if (treeData[sourceId] && treeData[targetId]) {
      const connectionType = edge.data?.type || 'child';
      
      if (connectionType === 'spouse') {
        treeData[sourceId].spouses.push(targetId);
        treeData[targetId].isSpouse = true;
      } else if (connectionType === 'sibling') {
        treeData[sourceId].siblings.push(targetId);
        treeData[targetId].isSibling = true;
      } else {
        // 기본값은 자식 관계
        treeData[sourceId].children.push(targetId);
      }
    }
  });
  
  // 부모 배열 계산 (역방향 관계)
  Object.keys(treeData).forEach(nodeId => {
    treeData[nodeId].parents = [];
  });
  
  Object.keys(treeData).forEach(nodeId => {
    const node = treeData[nodeId];
    if (node.children) {
      node.children.forEach((childId: string) => {
        if (treeData[childId]) {
          treeData[childId].parents.push(nodeId);
        }
      });
    }
  });
  
  return treeData;
};

export default RoadmapView; 