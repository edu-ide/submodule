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
      <Handle type="target" position={Position.Top} />
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
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

const GroupNode = memo((props: NodePropsType) => {
  const data = props.data as any;
  
  return (
    <div style={{ 
      border: `2px dashed ${data.color}`, 
      borderRadius: '8px', 
      backgroundColor: `${data.color}10`,  // 매우 연한 색상(10% 불투명도)
      width: '100%',
      height: '100%',
      position: 'relative',
      zIndex: -1  // 실제 노드보다 아래에 표시
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '-12px', 
        left: '10px', 
        padding: '3px 10px',
        borderRadius: '4px', 
        fontSize: '12px', 
        fontWeight: 500, 
        color: 'var(--vscode-editor-background, white)', 
        backgroundColor: data.color,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
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
  [key: string]: any;
}

// 파이썬 로드맵 노드 데이터 - 세로 흐름으로 재구성
const pythonNodes: Node[] = [
  // 카테고리 그룹 노드 - 수직 배열
  {
    id: 'group-1',
    type: 'groupNode',
    position: { x: 400, y: 50 },
    style: { width: 300, height: 180, zIndex: -10 },
    data: { 
      title: '기초',
      color: '#10b981'
    }
  },
  {
    id: 'group-2',
    type: 'groupNode',
    position: { x: 400, y: 260 }, 
    style: { width: 300, height: 180, zIndex: -10 },
    data: { 
      title: '변수와 자료형',
      color: '#3b82f6'
    }
  },
  {
    id: 'group-3',
    type: 'groupNode',
    position: { x: 400, y: 470 },
    style: { width: 300, height: 180, zIndex: -10 },
    data: { 
      title: '제어 구조',
      color: '#8b5cf6'
    }
  },
  
  // 시작점
  {
    id: 'start',
    type: 'roadmapNode',
    position: { x: 450, y: 10 },
    data: { 
      title: '파이썬 학습 시작',
      description: '파이썬 프로그래밍 학습 여정을 시작합니다.',
      status: 'completed',
      column: '시작'
    }
  },
  
  // 기초 단계 - 세로로 배치
  {
    id: '1-1',
    type: 'roadmapNode',
    position: { x: 450, y: 100 },
    data: { 
      title: '파이썬 소개',
      description: '파이썬 프로그래밍 언어의 특징과 활용 분야를 이해합니다.',
      status: 'completed',
      column: '기초'
    }
  },
  {
    id: '1-2',
    type: 'roadmapNode',
    position: { x: 450, y: 160 },
    data: { 
      title: '개발환경 구성',
      description: '파이썬 인터프리터 설치 및 개발 환경 구성 방법을 배웁니다.',
      status: 'completed',
      column: '기초'
    }
  },
  {
    id: '1-3',
    type: 'roadmapNode',
    position: { x: 450, y: 220 },
    data: { 
      title: '첫 번째 프로그램',
      description: '기본적인 "Hello World" 프로그램 작성 및 실행 방법을 학습합니다.',
      status: 'completed',
      column: '기초'
    }
  },
  
  // 변수와 자료형 - 세로로 배치
  {
    id: '2-1',
    type: 'roadmapNode',
    position: { x: 450, y: 310 },
    data: { 
      title: '변수와 기본 자료형',
      description: '문자열, 숫자, 불리언 등 기본 자료형과 변수 사용법을 학습합니다.',
      status: 'in-progress',
      column: '변수와 자료형'
    }
  },
  {
    id: '2-2',
    type: 'roadmapNode',
    position: { x: 450, y: 370 },
    data: { 
      title: '문자열 처리',
      description: '문자열 조작, 포맷팅, 메서드 등을 학습합니다.',
      status: 'not-started',
      column: '변수와 자료형'
    }
  },
  {
    id: '2-3',
    type: 'roadmapNode',
    position: { x: 450, y: 430 },
    data: { 
      title: '형 변환',
      description: '데이터 타입 간 변환 방법을 배웁니다.',
      status: 'not-started',
      column: '변수와 자료형'
    }
  },
  
  // 제어 구조 - 세로로 배치
  {
    id: '3-1',
    type: 'roadmapNode',
    position: { x: 450, y: 520 },
    data: { 
      title: '조건문',
      description: 'if, elif, else를 사용한 조건 분기를 학습합니다.',
      status: 'not-started',
      column: '제어 구조'
    }
  },
  {
    id: '3-2',
    type: 'roadmapNode',
    position: { x: 450, y: 580 },
    data: { 
      title: '반복문',
      description: 'for와 while 반복문을 사용하여 코드를 반복 실행하는 방법을 배웁니다.',
      status: 'not-started',
      column: '제어 구조'
    }
  },
  {
    id: '3-3',
    type: 'roadmapNode',
    position: { x: 450, y: 640 },
    data: { 
      title: '예외 처리',
      description: 'try, except, finally를 사용한 예외 처리를 학습합니다.',
      status: 'not-started',
      column: '제어 구조'
    }
  }
];

// 파이썬 로드맵 엣지(연결선) 데이터 - 단순 세로 연결
const pythonEdges: Edge[] = [
  // 시작점에서 첫 번째 노드
  { id: 'e-start-1-1', source: 'start', target: '1-1', type: 'smoothstep', animated: true },
  
  // 기초 단계 내 연결
  { id: 'e-1-1-1-2', source: '1-1', target: '1-2', type: 'smoothstep' },
  { id: 'e-1-2-1-3', source: '1-2', target: '1-3', type: 'smoothstep' },
  
  // 기초에서 변수와 자료형으로
  { id: 'e-1-3-2-1', source: '1-3', target: '2-1', type: 'smoothstep' },
  
  // 변수와 자료형 내부 연결
  { id: 'e-2-1-2-2', source: '2-1', target: '2-2', type: 'smoothstep' },
  { id: 'e-2-2-2-3', source: '2-2', target: '2-3', type: 'smoothstep' },
  
  // 변수와 자료형에서 제어 구조로
  { id: 'e-2-3-3-1', source: '2-3', target: '3-1', type: 'smoothstep' },
  
  // 제어 구조 내부 연결
  { id: 'e-3-1-3-2', source: '3-1', target: '3-2', type: 'smoothstep' },
  { id: 'e-3-2-3-3', source: '3-2', target: '3-3', type: 'smoothstep' }
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
  
  return (
    <div className="roadmap-container">
      <div className="back-button-container">
        <button onClick={onBack} className="back-button">
          <i className="codicon codicon-arrow-left"></i> 돌아가기
        </button>
        <h2 className="roadmap-title">{roadmapId} 로드맵</h2>
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
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.4}
          maxZoom={2}
          zoomOnScroll={true}
          panOnScroll={true}
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} />
          <Background 
            gap={16} 
            size={1} 
            color="var(--vscode-editor-lineHighlightBorder, #e2e8f0)" 
          />
          <Panel position="top-left" style={{
            background: 'var(--vscode-editor-background)',
            border: '1px solid var(--vscode-panel-border)',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '11px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxWidth: '150px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '11px' }}>학습 단계</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginRight: '6px' }}></div>
                <span style={{ fontSize: '11px' }}>기초 단계</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginRight: '6px' }}></div>
                <span style={{ fontSize: '11px' }}>중급 단계</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', marginRight: '6px' }}></div>
                <span style={{ fontSize: '11px' }}>고급 단계</span>
              </div>
            </div>
          </Panel>
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
      `}</style>
    </div>
  );
};

export default RoadmapView; 