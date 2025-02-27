import React, { useState, useCallback, memo } from 'react';
import { 
  ReactFlow,
  Controls,
  Background, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionLineType,
  Panel,
  NodeProps,
  Handle,
  Position,
  Node as FlowNode,
  Edge as FlowEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { saveAs } from 'file-saver';

// 로컬 컴포넌트 및 유틸 임포트
import NodeContentExternal from './roadmap/NodeContent';
import GroupNodeExternal from './roadmap/GroupNode';
import LearningContentView from './roadmap/LearningContentView';
import { pythonNodes, pythonEdges } from './roadmap/constants';
import { generateLearningContent, getLearningContent } from './roadmap/utils';
import { RoadmapViewProps, NodeData, NodePropsType } from './roadmap/types';

// 그룹 노드 컴포넌트
const GroupNode = memo((props: NodePropsType) => {
  const data = props.data as any;
  
  return (
    <div style={{ 
      border: `3px dashed ${data.color}`, 
      borderRadius: '12px', 
      backgroundColor: `${data.color}10`,
      width: '100%',
      height: '100%',
      position: 'relative',
      zIndex: -1,
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '-15px', 
        left: '20px', 
        padding: '5px 15px',
        borderRadius: '6px', 
        fontSize: '14px', 
        fontWeight: 600, 
        color: 'var(--vscode-editor-background, white)', 
        backgroundColor: data.color,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
      }}>
        {data.title}
      </div>
    </div>
  );
});

// 노드 컴포넌트
const NodeContent = memo((props: NodePropsType) => {
  const data = props.data as NodeData;
  const { handles = { top: false, left: false, right: false, bottom: false, 'left-out': false, 'right-out': false } } = data;
  
  const getNodeStyle = () => {
    switch (data.status) {
      case 'completed':
        return {
          background: '#ecfdf5',
          borderColor: '#10b981'
        };
      case 'in-progress':
        return {
          background: '#eff6ff',
          borderColor: '#3b82f6'
        };
      default:
        return {
          background: '#f8fafc',
          borderColor: '#94a3b8'
        };
    }
  };
  
  const { background, borderColor } = getNodeStyle();
  
  return (
    <div style={{ 
      background, 
      borderColor, 
      padding: '12px', 
      borderRadius: '8px', 
      width: '200px',  
      border: '3px solid',
      fontSize: '14px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      {handles.top && <Handle type="target" position={Position.Top} id="top" />}
      {handles.left && <Handle type="target" position={Position.Left} id="left" />}
      {handles.right && <Handle type="target" position={Position.Right} id="right" />}
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: borderColor, 
            marginRight: '8px' 
          }}></div>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '15px' 
          }}>{data.title}</div>
        </div>
        
        {data.isOptional && (
          <div style={{
            fontSize: '10px',
            padding: '2px 6px',
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1',
            borderRadius: '4px',
            fontWeight: 500
          }}>
            선택 학습
          </div>
        )}
      </div>
      
      {data.requiresSkill && data.requiresSkill.length > 0 && (
        <div style={{
          marginTop: '8px',
          padding: '4px 6px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          <div style={{ color: '#8b5cf6', fontWeight: 500, marginBottom: '3px' }}>필요 기술:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
            {(data.requiresSkill as string[]).map((skillId, idx) => (
              <span key={idx} style={{
                padding: '1px 5px',
                background: '#8b5cf615',
                borderRadius: '3px',
                fontSize: '10px',
                border: '1px solid #8b5cf630'
              }}>
                {skillId === '2-1' ? '변수와 기본 자료형' : 
                 skillId === '3-1' ? '조건문' : skillId}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {handles.bottom && <Handle type="source" position={Position.Bottom} id="bottom" />}
      {handles['left-out'] && <Handle type="source" position={Position.Left} id="left-out" />}
      {handles['right-out'] && <Handle type="source" position={Position.Right} id="right-out" />}
    </div>
  );
});

// 메인 RoadmapView 컴포넌트
const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmapId, onBack }) => {
  // 상태 관리
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [learningContent, setLearningContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showContentView, setShowContentView] = useState<boolean>(false);
  
  // 노드 타입 정의 (로컬과 외부 컴포넌트 중 선택)
  const nodeTypes = {
    roadmapNode: NodeContent,
    groupNode: GroupNode
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  React.useEffect(() => {
    // 로드맵 ID에 따라 데이터 로드
    loadRoadmapData(roadmapId);
  }, [roadmapId]);
  
  // 로드맵 데이터 로드 함수
  const loadRoadmapData = (id: string) => {
    // 현재는 파이썬 로드맵만 지원하므로 경고를 표시하지 않고 항상 파이썬 로드맵을 로드
    setNodes(pythonNodes);
    setEdges(pythonEdges);
  };
  
  // 노드 클릭 핸들러
  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    if (node.type === 'groupNode') return; // 그룹 노드는 처리하지 않음
    
    setSelectedNode(node);
    setIsLoading(true);
    
    // 노드 ID에 따라 콘텐츠 가져오기
    setTimeout(() => {
      const nodeData = (node.data as unknown) as NodeData;
      const content = getLearningContent(node.id) || generateLearningContent(nodeData);
      
      setLearningContent(content);
      setIsLoading(false);
      setShowContentView(true); // 콘텐츠 뷰 표시 활성화
    }, 600);
  }, []);
  
  // 콘텐츠에서 돌아가기 핸들러
  const handleContentBack = () => {
    setShowContentView(false);
    setSelectedNode(null);
  };
  
  // 메인 로드맵에서 돌아가기 핸들러
  const handleMainBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    }
  };
  
  // 콘텐츠 뷰가 활성화되어 있으면 해당 화면 표시
  if (showContentView) {
    return (
      <>
        {learningContent && selectedNode && (
          <LearningContentView 
            content={learningContent} 
            nodeData={(selectedNode.data as unknown) as NodeData} 
            onBack={handleContentBack} 
          />
        )}
      </>
    );
  }
  
  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>학습 콘텐츠를 불러오는 중...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid var(--vscode-button-background);
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // 메인 로드맵 플로우 표시
  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
        <button className="back-button" onClick={handleMainBack}>
          <span className="codicon codicon-arrow-left"></span>
          돌아가기
        </button>
        <h2>{roadmapId === 'python' ? '파이썬 학습 로드맵' : `${roadmapId} 로드맵`}</h2>
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
            type: 'smoothstep',
            style: { stroke: '#94a3b8', strokeWidth: 3 }
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