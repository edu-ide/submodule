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
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { saveAs } from 'file-saver';

// 노드 프롭스 타입 정의
interface NodePropsType {
  data: any;
  id: string;
  selected: boolean;
  type?: string;
  [key: string]: any;
}

// 노드 컴포넌트들 - 필요시 별도 파일로 분리할 수 있음
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

// 그룹 노드 컴포넌트 개선
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

// 노드 데이터 인터페이스
interface NodeData extends Record<string, unknown> {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  column: string;
  tooltip?: string;
  isOptional?: boolean;
  requiresSkill?: string[];
  handles?: {
    top: boolean;
    left: boolean;
    right: boolean;
    bottom: boolean;
    'left-out': boolean;
    'right-out': boolean;
  };
}

// RoadmapView 속성
interface RoadmapViewProps {
  roadmapId: string;
  onBack: () => void;
}

// Node 및 Edge 타입 정의
interface Node {
  id: string;
  type?: string;
  data: any;
  position: { x: number; y: number };
  style?: React.CSSProperties;
  [key: string]: any;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  markerEnd?: any;
  style?: React.CSSProperties;
  sourceHandle?: string;
  targetHandle?: string;
  [key: string]: any;
}

// JSON에 따라 노드 위치 업데이트
const pythonNodes: Node[] = [
  // 카테고리 그룹 노드
  {
    id: 'group-1',
    type: 'groupNode',
    position: { x: 350, y: 70 },
    style: { width: 300, height: 120, zIndex: -10 },
    data: { 
      title: '기초',
      color: '#10b981'
    }
  },
  {
    id: 'group-2',
    type: 'groupNode',
    position: { x: 350, y: 230 }, 
    style: { width: 300, height: 120, zIndex: -10 },
    data: { 
      title: '변수와 자료형',
      color: '#3b82f6'
    }
  },
  {
    id: 'group-3',
    type: 'groupNode',
    position: { x: 90, y: 400 }, // 위치 수정
    style: { width: 300, height: 120, zIndex: -10 },
    data: { 
      title: '제어 구조',
      color: '#8b5cf6'
    }
  },
  
  // 시작점
  {
    id: 'start',
    type: 'roadmapNode',
    position: { x: 400, y: 20 },
    data: { 
      title: '파이썬 학습 시작',
      description: '파이썬 프로그래밍 학습 여정을 시작합니다.',
      status: 'completed',
      column: '시작',
      handles: { top: false, bottom: true, left: false, right: false, 'left-out': false, 'right-out': false }
    }
  },
  
  // 기초 단계
  {
    id: '1-1',
    type: 'roadmapNode',
    position: { x: 400, y: 120 },
    data: { 
      title: '파이썬 소개',
      description: '파이썬 프로그래밍 언어의 특징과 활용 분야를 이해합니다.',
      status: 'completed',
      column: '기초',
      handles: { top: true, bottom: true, left: false, right: false, 'left-out': false, 'right-out': false }
    }
  },
  
  // 변수와 자료형
  {
    id: '2-1',
    type: 'roadmapNode',
    position: { x: 400, y: 280 },
    data: { 
      title: '변수와 기본 자료형',
      description: '문자열, 숫자, 불리언 등 기본 자료형과 변수 사용법을 학습합니다.',
      status: 'in-progress',
      column: '변수와 자료형',
      handles: { top: true, bottom: true, left: false, right: false, 'left-out': true, 'right-out': false }
    }
  },
  
  // 조건문 (위치 수정)
  {
    id: '3-1',
    type: 'roadmapNode',
    position: { x: 110, y: 440 },
    data: { 
      title: '조건문',
      description: 'if, elif, else를 사용한 조건 분기를 학습합니다.',
      status: 'not-started',
      column: '제어 구조',
      handles: { top: false, bottom: true, left: false, right: true, 'left-out': false, 'right-out': false }
    }
  },
  
  // 컬렉션 자료형 (위치 수정)
  {
    id: '2-4',
    type: 'roadmapNode',
    position: { x: 110, y: 280 },
    data: { 
      title: '컬렉션 자료형',
      description: '리스트, 딕셔너리, 세트, 튜플 등의 복합 자료형을 학습합니다.',
      status: 'not-started',
      column: '변수와 자료형',
      isOptional: true,
      handles: { top: false, bottom: false, left: false, right: true, 'left-out': false, 'right-out': false }
    }
  },
  
  // 고급 제어 패턴 (위치 수정)
  {
    id: 'adv-1',
    type: 'roadmapNode',
    position: { x: 400, y: 610 },
    data: { 
      title: '고급 제어 패턴',
      description: '고급 제어 흐름 패턴과 함수형 접근법을 학습합니다.',
      status: 'not-started',
      column: '제어 구조',
      requiresSkill: ['2-1', '3-1'],
      handles: { top: true, bottom: false, left: true, right: false, 'left-out': false, 'right-out': false }
    }
  }
];

// 엣지 수정 - 단순 수직 흐름
const pythonEdges: Edge[] = [
  // 시작점에서 첫 노드로
  { id: 'e-start-1-1', source: 'start', target: '1-1', type: 'smoothstep', animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 } },
  
  // 기초에서 변수로
  { id: 'e-1-1-2-1', source: '1-1', target: '2-1', type: 'smoothstep', 
    style: { stroke: '#3b82f6', strokeWidth: 3 } },
  
  // 변수에서 제어로 - 왼쪽 노드에 연결되므로 horizontal 타입 사용
  { id: 'e-2-1-3-1', source: '2-1', target: '3-1', type: 'default', 
    sourceHandle: 'left-out', targetHandle: 'right',
    style: { stroke: '#8b5cf6', strokeWidth: 3 } },
  
  // 선택 학습 노드 연결 - 핸들 지정하여 수평 연결
  { id: 'e-2-1-2-4', source: '2-1', target: '2-4', type: 'default', 
    sourceHandle: 'left-out', targetHandle: 'right',
    style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' } },
  
  // 고급 노드로의 연결
  { id: 'e-2-1-adv-1', source: '2-1', target: 'adv-1', type: 'default', 
    style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  
  { id: 'e-3-1-adv-1', source: '3-1', target: 'adv-1', type: 'default', 
    sourceHandle: 'bottom', targetHandle: 'left',
    style: { stroke: '#8b5cf6', strokeWidth: 2 } }
];

const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmapId, onBack }) => {
  // 선택된 노드 상태
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // 노드와 엣지 상태 관리
  const [nodes, setNodes, onNodesChange] = useNodesState(pythonNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(pythonEdges);
  
  // 커스텀 노드 타입 정의
  const nodeTypes = {
    roadmapNode: NodeContent,
    groupNode: GroupNode
  };
  
  // 노드 클릭 이벤트 핸들러
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      console.log("노드 클릭됨:", node);
      if (node.type !== 'groupNode') {
        setSelectedNode(node);
      }
    },
    []
  );
  
  // JSON 추출 함수
  const exportRoadmapToJson = useCallback(() => {
    const roadmapData = {
      id: roadmapId,
      exportedAt: new Date().toISOString(),
      nodes: nodes,
      edges: edges
    };
    
    const jsonString = JSON.stringify(roadmapData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, `${roadmapId}-roadmap.json`);
    
    // 또는 클립보드에 복사하는 옵션도 제공할 수 있습니다
    // navigator.clipboard.writeText(jsonString);
    // alert("로드맵 JSON이 클립보드에 복사되었습니다.");
  }, [roadmapId, nodes, edges]);
  
  return (
    <div className="roadmap-container">
      <div className="back-button-container">
        <button onClick={onBack} className="back-button">
          <i className="codicon codicon-arrow-left"></i> 돌아가기
        </button>
        <h2 className="roadmap-title">{roadmapId} 로드맵</h2>
        
        {/* JSON 추출 버튼 추가 */}
        <div className="roadmap-actions">
          <button onClick={exportRoadmapToJson} className="export-button">
            <i className="codicon codicon-json"></i> JSON으로 내보내기
          </button>
        </div>
      </div>
      
      <div style={{ width: '100%', height: 'calc(100vh - 150px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#94a3b8', strokeWidth: 3 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          }}
          fitView
          fitViewOptions={{ padding: 0.5, includeHiddenNodes: true }}
          minZoom={0.3}
          maxZoom={2}
          zoomOnScroll={true}
          panOnScroll={true}
          proOptions={{ hideAttribution: true }}
          nodesFocusable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          preventScrolling={false}
          snapToGrid={true}
          snapGrid={[10, 10]}
        >
          <Controls 
            position="top-right" 
            showInteractive={false} 
            style={{
              background: 'var(--vscode-editor-background)',
              border: '1px solid var(--vscode-panel-border)',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              padding: '4px'
            }}
            className="custom-controls"
          />
          <Background 
            gap={16} 
            size={1} 
            color="var(--vscode-editor-lineHighlightBorder, #e2e8f0)" 
          />
        </ReactFlow>
      </div>
      
      {selectedNode && (
        <div className="selected-node-info">
          <div className="node-header">
            <div className="node-status-indicator" 
              style={{
                backgroundColor: 
                  (selectedNode.data as NodeData).status === 'completed' ? '#10b981' : 
                  (selectedNode.data as NodeData).status === 'in-progress' ? '#3b82f6' : '#94a3b8'
              }}
            ></div>
            <h3 className="node-title">{(selectedNode.data as NodeData).title}</h3>
            <div className="node-category">{(selectedNode.data as NodeData).column}</div>
          </div>
          <p className="node-description">{(selectedNode.data as NodeData).description}</p>
          <div className="node-actions">
            <button className="action-button primary">
              {(selectedNode.data as NodeData).status === 'completed' ? '다시 학습하기' : 
                (selectedNode.data as NodeData).status === 'in-progress' ? '계속 학습하기' : '학습 시작하기'}
            </button>
            <button className="action-button secondary">관련 자료 보기</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .roadmap-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: auto;
        }
        
        .back-button-container {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .back-button {
          display: flex;
          align-items: center;
          background: transparent;
          border: none;
          color: var(--vscode-button-foreground);
          cursor: pointer;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 4px;
          margin-right: 12px;
        }
        
        .back-button:hover {
          background: var(--vscode-button-hoverBackground);
        }
        
        .roadmap-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        
        .selected-node-info {
          margin-top: 16px;
          padding: 16px;
          background: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
        }
        
        .node-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .node-status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .node-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: var(--vscode-editor-foreground);
        }
        
        .node-category {
          font-size: 12px;
          color: var(--vscode-descriptionForeground);
          margin-left: 8px;
        }
        
        .node-description {
          font-size: 14px;
          line-height: 1.5;
          color: var(--vscode-editor-foreground);
          margin-bottom: 16px;
        }
        
        .node-actions {
          display: flex;
          gap: 8px;
        }
        
        .action-button {
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
        }
        
        .action-button.primary {
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }
        
        .action-button.secondary {
          background: var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
          border: 1px solid var(--vscode-button-border);
        }
        
        .roadmap-actions {
          margin-left: auto;
        }
        
        .export-button {
          display: flex;
          align-items: center;
          gap: 5px;
          background: var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
          border: 1px solid var(--vscode-button-border);
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .export-button:hover {
          background: var(--vscode-button-hoverBackground);
        }
      `}</style>

      <style jsx global>{`
        /* 기존 스타일 ... */
        
        /* 컨트롤러 버튼 스타일 커스터마이징 */
        .custom-controls button {
          background-color: var(--vscode-button-secondaryBackground) !important;
          color: var(--vscode-button-secondaryForeground) !important;
          border: 1px solid var(--vscode-button-border) !important;
          border-radius: 4px !important;
          margin: 2px !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: background-color 0.2s ease !important;
        }
        
        .custom-controls button:hover {
          background-color: var(--vscode-button-hoverBackground) !important;
        }
        
        .custom-controls {
          opacity: 0.85;
        }
        
        /* 핸들 스타일 개선 */
        .react-flow__handle {
          width: 8px !important;
          height: 8px !important;
          opacity: 0.75 !important;
          background-color: var(--vscode-button-background) !important;
          border: 1px solid var(--vscode-editor-background) !important;
        }
      `}</style>
    </div>
  );
};

export default RoadmapView; 