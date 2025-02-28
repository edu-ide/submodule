import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  ReactFlow,
  Controls,
  Background, 
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Panel,
  Node as FlowNode,
  ReactFlowInstance,
  Viewport
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setViewport, setNodePosition } from '../../redux/roadmapSlice';
import { setBottomMessage, setHeaderInfo } from '../../redux/slices/uiStateSlice';

// 로컬 컴포넌트 및 유틸 임포트
import NodeContent from './roadmap/NodeContent';
import { layoutElements } from './roadmap/layout-elements';
import { roadmapNodes, roadmapEdges, fetchRoadmapData, fetchRoadmapContent } from './roadmap/constants';
import { RoadmapViewProps } from './types';
import { RoadmapData } from './roadmap/types';

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
  
  // 상태 관리 코드 유지
  const viewportState = useSelector((state: RootState) => state.roadmap.viewportState);
  const nodePositions = useSelector((state: RootState) => state.roadmap.nodePositions);
  const dispatch = useDispatch();
  
  const prevViewport = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });
  
  const [roadmapContent, setRoadmapContent] = useState<RoadmapData>({ nodes: [], edges: [] });
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadRoadmapData(routerRoadmapId);
    fetchRoadmapData().then(data => {
      setRoadmapContent(data);
      
      // 헤더 정보 설정
      dispatch(setHeaderInfo({
        title: '로드맵',
        description: '학습 진행 상황을 시각적으로 확인하고 관리하세요'
      }));
    });
  }, [routerRoadmapId, dispatch]);
  
  // 로드맵 데이터 로드 함수
  const loadRoadmapData = (id: string) => {
    console.log('Loading roadmap data for:', id);
    console.log('Python nodes:', roadmapNodes);
    console.log('Python edges:', roadmapEdges);
    
    // 원본 데이터 변환
    const originalData = transformToTreeFormat(roadmapNodes, roadmapEdges);
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
  const onNodeClick = useCallback(async (event: React.MouseEvent, node: FlowNode) => {
    if (node.type === 'groupNode') return;
    
    const contentId = node.id;
    try {
      console.log('클릭한 노드 전체 정보:', {
        id: node.id,
        type: node.type,
        data: node.data,
        position: node.position
      });

      const roadmapContent = await fetchRoadmapContent();
      console.log('가져온 콘텐츠 데이터:', roadmapContent);
      
      if (!roadmapContent.roadmap[contentId]) {
        console.error('콘텐츠 정보 없음:', {
          contentId,
          availableIds: Object.keys(roadmapContent.roadmap),
          nodeData: node.data
        });
        
        dispatch(setBottomMessage(
          <div>
            해당 콘텐츠를 찾을 수 없습니다.
            <br />
            노드 ID: {contentId}
            <br />
            노드 정보: {JSON.stringify(node.data)}
          </div>
        ));
        return;
      }

      navigate(`/education/roadmap/${routerRoadmapId}/content/${contentId}`);
      
    } catch (error) {
      console.error('콘텐츠 조회 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      dispatch(setBottomMessage(
        <div>
          콘텐츠 조회 중 오류가 발생했습니다: {errorMessage}
          <br />
          노드 ID: {contentId}
          <br />
          노드 데이터: {JSON.stringify(node.data)}
        </div>
      ));
    }
  }, [navigate, routerRoadmapId, dispatch]);
  
  // 레이아웃 방향 변경
  const onLayout = useCallback((direction: 'TB' | 'LR') => {
    const originalData = transformToTreeFormat(roadmapNodes, roadmapEdges);
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
  
  // 뷰포트 변경 핸들러
  const onViewportChange = useCallback((viewport: Viewport) => {
    // 옵셔널 체이닝 추가
    const prevZoom = prevViewport.current?.zoom || 1;
    const isSignificantChange = 
      Math.abs(viewport.zoom - prevZoom) > 0.005;

    if (isSignificantChange) {
      dispatch(setViewport(viewport));
      prevViewport.current = viewport;
    }
  }, [dispatch]);
  
  // 노드 위치 변경 핸들러
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: FlowNode) => {
    dispatch(setNodePosition({ 
      id: node.id, 
      position: { x: node.position.x, y: node.position.y } 
    }));
  }, [dispatch]);
  
  // onInit 핸들러
  const reactFlowInstance = useRef<ReactFlowInstance>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    if (viewportState && instance) {
      // 복원 전 위치 유효성 검사
      const isValidViewport = 
        !isNaN(viewportState.x) && 
        !isNaN(viewportState.y) && 
        viewportState.zoom >= 0.1 && 
        viewportState.zoom <= 1.5;
        
      if (isValidViewport) {
        instance.setViewport(viewportState);
      } else {
        console.warn('유효하지 않은 뷰포트 상태:', viewportState);
        instance.fitView({ padding: 0.1 });
      }
    }
  }, [viewportState]);
  
  useEffect(() => {
    return () => {
      const currentViewport = reactFlowInstance.current?.getViewport();
      if (currentViewport) {
        dispatch(setViewport(currentViewport));
      }
    };
  }, [dispatch]);
  
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
          connectionLineType={ConnectionLineType.SmoothStep}
          onInit={onInit}
          onViewportChange={onViewportChange}
          onNodeDragStop={onNodeDragStop}
          fitView={false}
          minZoom={0.1}
          maxZoom={1.5}
        >
          <Controls />
          <Background gap={16} size={1} />
          <Panel position="top-right">
            <button onClick={() => onLayout('TB')} className="layout-button">수직 레이아웃</button>
            <button onClick={() => onLayout('LR')} className="layout-button">수평 레이아웃</button>
          </Panel>
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
    const isMain = node.data?.column === 'main';
    
    treeData[node.id] = {
      id: node.id,
      name: node.data?.title || node.id,
      description: node.data?.description || '',
      status: node.data?.status || 'not-started',
      order: node.data?.order || '0',
      type: node.type,
      isMain,
      category: isMain ? 'main' : 'sub',
      children: [],
      siblings: [],
      spouses: [],
      prerequisites: []
    };
  });
  
  // 엣지 기반으로 관계 설정
  edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    
    if (treeData[sourceId] && treeData[targetId]) {
      const connectionType = edge.data?.type || 'child';
      
      if (connectionType === 'main') {
        // 메인 트랙 연결
        treeData[sourceId].children.push(targetId);
        treeData[targetId].prerequisites.push(sourceId);
      } else if (connectionType === 'child') {
        // 서브 트랙 연결
        treeData[sourceId].children.push(targetId);
        treeData[targetId].prerequisites.push(sourceId);
      }
    }
  });
  
  // 순서에 따라 노드 정렬
  Object.keys(treeData).forEach(nodeId => {
    treeData[nodeId].children.sort((a: string, b: string) => {
      const orderA = parseFloat(treeData[a].order);
      const orderB = parseFloat(treeData[b].order);
      return orderA - orderB;
    });
  });
  
  return treeData;
};

export default RoadmapView; 