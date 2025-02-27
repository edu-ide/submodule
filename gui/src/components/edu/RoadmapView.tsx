import React, { useCallback } from 'react';
import { 
  ReactFlow,
  Controls,
  Background, 
  useNodesState,
  useEdgesState,
  Node as FlowNode,
  BezierEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate, useParams } from 'react-router-dom';

// 로컬 컴포넌트 및 유틸 임포트
import NodeContent from './roadmap/NodeContent';
import GroupNode from './roadmap/GroupNode';
import { pythonNodes, pythonEdges } from './roadmap/constants';
import { RoadmapViewProps } from './types';

// 메인 RoadmapView 컴포넌트
const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmapId, onBack }) => {
  const { roadmapId: urlRoadmapId } = useParams();
  // 상태 관리 - 필요한 것만 유지
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // 라우터 훅 사용
  const navigate = useNavigate();
  
  // 라우터 파라미터로 roadmapId 얻기
  const routerRoadmapId = roadmapId || 'python';
  
  // 노드 타입 정의
  const nodeTypes = {
    roadmapNode: NodeContent,
    groupNode: GroupNode
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  React.useEffect(() => {
    loadRoadmapData(routerRoadmapId);
  }, [routerRoadmapId]);
  
  // 로드맵 데이터 로드 함수
  const loadRoadmapData = (id: string) => {
    setNodes(pythonNodes);
    setEdges(pythonEdges);
  };
  
  // 노드 클릭 핸들러 - 콘텐츠 페이지로 이동
  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    if (node.type === 'groupNode') return;
    navigate(`/education/roadmap/${routerRoadmapId}/content/${node.id}`);
  }, [navigate, routerRoadmapId]);
  
  // 뒤로가기 함수 정의
  const handleBack = () => {
    navigate('/education/roadmap');
  };
  
  // 로드맵 플로우 뷰만 표시
  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
       
      </div>
      
      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            type: 'bezier',
            style: { stroke: '#94a3b8', strokeWidth: 2 }
          }}
          edgeTypes={{
            default: BezierEdge,
            smoothstep: BezierEdge
          }}
          fitView
          fitViewOptions={{ padding: 0.5 }}
          minZoom={0.5}
          maxZoom={2}
        >
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
        
        .back-button {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          color: var(--vscode-button-foreground);
          background-color: var(--vscode-button-background);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 15px;
        }
        
        .back-button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
        
        .back-button span {
          margin-right: 6px;
        }
        
        h2 {
          margin: 0;
          font-size: 18px;
        }
        
        .flow-container {
          flex: 1;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default RoadmapView; 