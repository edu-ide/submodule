import React, { useCallback, useEffect, useRef, useState, ReactNode, useMemo } from 'react';
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
  Viewport,
  MarkerType,
  Edge as FlowEdge,
  NodeMouseHandler,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setViewport, setNodePosition, setViewMode } from '../../redux/roadmapSlice';
import { setBottomMessage, setHeaderInfo } from '../../redux/slices/uiStateSlice';
import { css, Global } from '@emotion/react';
import { EdgeWithInteractions } from './roadmap/EdgeWithInteractions';
import ELK from 'elkjs/lib/elk.bundled.js';
import { layoutElements, LayoutElements, Orientation, OrientationType, RoadmapNode as LayoutRoadmapNode, createCategoryFlowLayout } from './layoutUtils';
import CustomNode from './roadmap/CustomNode';
import SharedRoadmapFlowView from './SharedRoadmapFlowView';

// 로컬 컴포넌트 및 유틸 임포트
import NodeContent from './roadmap/NodeContent';
import { fetchRoadmapData, fetchRoadmapContent, getRoadmapData, extractNodeIdPart } from './roadmap/constants';
import { RoadmapViewProps } from './types';
import { RoadmapData } from './roadmap/types';
import type { RoadmapNode as ImportedRoadmapNode, RoadmapEdge as ImportedRoadmapEdge } from './roadmap/types';

// ELK 타입 정의 확장
interface ElkExtendedEdge {
  id: string;
  sources: string[];
  targets: string[];
  [key: string]: any;
}

// ELK 인스턴스 생성
const elk = new ELK();

// ELK 레이아웃 훅 정의
const useLayoutedElements = (reactFlowInstance) => {
  // 기본 레이아웃 옵션 설정
  const defaultOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
  };
  
  const getLayoutedElements = useCallback((options) => {
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

// 카테고리 데이터 타입 정의
interface Category {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  order: string;
}

interface CategoryRoadmapData {
  categories: Category[];
  nodes: any[];
}

// RoadmapNode 인터페이스를 로컬에서만 사용하도록 이름 변경
interface LocalRoadmapNode {
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
  };
}

// 노드 타입 정의
const nodeTypes = {
  custom: NodeContent,
  roadmapNode: NodeContent,
  groupNode: NodeContent
};

// 목차 뷰 컴포넌트 추가
const TableOfContentsView = ({ nodes, edges, onNodeClick }) => {
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
        isChild: node.data?.column === 'child' || node.data?.type === 'child'
      };
    });
    
    // 최상위 노드와 자식 노드 식별
    nodes.forEach(node => {
      const isRootNode = !edges.some(edge => edge.target === node.id);
      if (isRootNode) {
        rootNodes.push(node.id);
      }
    });
    
    console.log('최상위 노드:', rootNodes);
    console.log('노드 맵:', nodeMap);
    console.log('자식 맵:', childMap);
    
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
  
  // 모든 노드를 계층 구조를 반영하여 정렬
  const getSortedNodes = () => {
    const sortedNodes = [];
    
    const addNodeWithChildren = (nodeId, visited = new Set()) => {
      if (visited.has(nodeId) || !nodeMap[nodeId]) return;
      visited.add(nodeId);
      
      const node = nodeMap[nodeId];
      
      // order 속성에서 레벨 추출 (예: "1.2.3" -> 레벨 3, "1" -> 레벨 1)
      const orderStr = node.data?.order || '';
      const orderLevel = orderStr.split('.').length;
      
      // order 기반 레벨 할당 (물리적 트리 구조보다 우선)
      node.orderLevel = orderLevel;
      
      sortedNodes.push(node);
      
      // 자식 노드들을 순서대로 정렬
      const children = (childMap[nodeId] || []).sort((a, b) => {
        const orderA = parseFloat(nodeMap[a]?.data?.order || '0');
        const orderB = parseFloat(nodeMap[b]?.data?.order || '0');
        return orderA - orderB;
      });
      
      // 정렬된 자식 노드 추가
      children.forEach(childId => {
        addNodeWithChildren(childId, visited);
      });
    };
    
    // 루트 노드부터 순회 시작 (order로 정렬)
    const sortedRoots = [...rootNodes].sort((a, b) => {
      const orderA = parseFloat(nodeMap[a]?.data?.order || '0');
      const orderB = parseFloat(nodeMap[b]?.data?.order || '0');
      return orderA - orderB;
    });
    
    sortedRoots.forEach(rootId => {
      addNodeWithChildren(rootId);
    });
    
    return sortedNodes;
  };
  
  const sortedNodes = getSortedNodes();
  console.log('계층 구조가 적용된 정렬된 노드:', sortedNodes);

  return (
    <div className="toc-container">
      <h2 className="toc-header">파이썬 학습 로드맵</h2>
      
      {sortedNodes.map((node) => {
        // 물리적 트리 레벨 대신 order 기반 레벨 사용
        const level = node.orderLevel ? node.orderLevel - 1 : 0; // 첫 번째 레벨은 들여쓰기 없음
        const isMainNode = node.data?.column === 'main';
        const isChildNode = node.data?.column === 'child' || node.data?.type === 'child';
        const hasChildren = (childMap[node.id] || []).length > 0;
        
        let itemClass = "toc-item";
        if (node.data?.status) itemClass += ` ${node.data.status}`;
        if (isMainNode) itemClass += " main-node";
        if (isChildNode) itemClass += " child-node";
        if (hasChildren) itemClass += " has-children";
        
        // order 표시를 위한 로직 추가
        const orderDisplay = node.data?.order || '';
        
        return (
          <div 
            key={node.id} 
            className={itemClass}
            style={{ marginLeft: `${level * 15}px` }}
            onClick={(e) => onNodeClick(e, node)}
          >
            {isChildNode ? (
              <span className="toc-icon">•</span>
            ) : hasChildren ? (
              <span className="toc-icon">📚</span>
            ) : (
              <span className="toc-icon">📝</span>
            )}
            
            <span className="toc-order">{orderDisplay}</span>
            <span className="toc-title">{node.data?.label || node.data?.title || node.id}</span>
            
            {node.data?.status === 'completed' && (
              <span className="toc-status-icon completed">✅</span>
            )}
            {node.data?.status === 'in-progress' && (
              <span className="toc-status-icon in-progress">🔄</span>
            )}
          </div>
        );
      })}
      
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
          min-width: 30px;
          margin-right: 8px;
          color: var(--vscode-textLink-foreground);
          font-weight: 600;
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

// selectedNode 인터페이스와 타입 개선
type NodeData = {
  title: string;
  description: string;
  status: string;
  label: ReactNode;
  order?: string;
  column?: number;
  content_file?: string;
  type?: string | undefined;
};

// RoadmapNode 타입 변환 함수 (roadmap/types.ts -> layoutUtils.tsx)
const convertToLayoutRoadmapNode = (nodes: ImportedRoadmapNode[]): LayoutRoadmapNode[] => {
  return nodes.map(node => {
    // 기본값 설정
    const defaultCategory = 'default';
    const defaultThumbnail = 'default-thumbnail.png';
    
    return {
      id: node.id,
      type: node.type || 'default',
      data: {
        title: node.data?.title || '',
        description: node.data?.description || '',
        status: node.data?.status || 'not-started',
        order: node.data?.order || '0',
        column: node.data?.column || '',
        level: node.data?.column === 'main' ? '초급' : node.data?.column === 'child' ? '중급' : '고급',
        // category와 thumbnail은 ImportedRoadmapNode에 없으므로 기본값 사용
        category: defaultCategory,
        content_file: node.data?.content_file || '',
        thumbnail: defaultThumbnail,
        featured: false,
        prerequisites: [],
        next: []
      }
    };
  });
};

// 엣지 정보를 기반으로 노드의 선행 조건과 다음 단계 설정
const enhanceNodesWithEdges = (nodes: LayoutRoadmapNode[], edges: ImportedRoadmapEdge[]): LayoutRoadmapNode[] => {
  // 노드 맵 생성
  const nodeMap: Record<string, LayoutRoadmapNode> = {};
  nodes.forEach(node => {
    nodeMap[node.id] = {
      ...node,
      data: {
        ...node.data,
        prerequisites: [],
        next: []
      }
    };
  });
  
  // 엣지 정보 기반으로 선행 조건과 다음 단계 설정
  edges.forEach(edge => {
    const { source, target } = edge;
    
    // 소스 노드가 존재하면 다음 단계에 타겟 추가
    if (nodeMap[source]) {
      if (!nodeMap[source].data.next) {
        nodeMap[source].data.next = [];
      }
      
      if (!nodeMap[source].data.next.includes(target)) {
        nodeMap[source].data.next.push(target);
      }
    }
    
    // 타겟 노드가 존재하면 선행 조건에 소스 추가
    if (nodeMap[target]) {
      if (!nodeMap[target].data.prerequisites) {
        nodeMap[target].data.prerequisites = [];
      }
      
      if (!nodeMap[target].data.prerequisites.includes(source)) {
        nodeMap[target].data.prerequisites.push(source);
      }
    }
  });
  
  return Object.values(nodeMap);
};

// 로드맵 상태와 가이드 인터페이스 정의
interface ProgressStatus {
  completed: number;
  total: number;
  percentage: number;
}

// 설정 패널 컴포넌트
interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentLayout: string;
  onApplyLayout: (layout: string) => void;
  onShowStatus: () => void;
  onHideStatus: () => void;
  onShowGuide: () => void;
  onHideGuide: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  currentLayout,
  onApplyLayout,
  onShowStatus,
  onHideStatus,
  onShowGuide,
  onHideGuide
}) => {
  if (!isOpen) return null;

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>로드맵 설정</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          레이아웃
        </button>
        <button 
          className={`tab-button ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          진행 상태
        </button>
        <button 
          className={`tab-button ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          가이드
        </button>
      </div>
      
      {activeTab === 'layout' && (
        <div className="tab-content">
          <div className="setting-group">
            <label className="setting-label">레이아웃 방향</label>
            <div className="setting-options">
              <button 
                className={`option-button ${currentLayout === 'horizontal' ? 'active' : ''}`}
                onClick={() => onApplyLayout('horizontal')}
              >
                수평 레이아웃
              </button>
              <button 
                className={`option-button ${currentLayout === 'vertical' ? 'active' : ''}`}
                onClick={() => onApplyLayout('vertical')}
              >
                수직 레이아웃
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'status' && (
        <div className="tab-content">
          <div className="setting-group">
            <label className="setting-label">진행 상태 표시</label>
            <div className="setting-options">
              <button 
                className="option-button"
                onClick={onShowStatus}
              >
                진행 상태 표시
              </button>
              <button 
                className="option-button"
                onClick={onHideStatus}
              >
                진행 상태 숨기기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'guide' && (
        <div className="tab-content">
          <div className="setting-group">
            <label className="setting-label">사용 가이드</label>
            <div className="setting-options">
              <button 
                className="option-button"
                onClick={onShowGuide}
              >
                가이드 표시
              </button>
              <button 
                className="option-button"
                onClick={onHideGuide}
              >
                가이드 숨기기
              </button>
            </div>
          </div>
          <div className="guide-content">
            <div className="guide-item">
              <span className="guide-icon">🔍</span>
              <p>노드를 클릭하여 내용을 확인할 수 있습니다.</p>
            </div>
            <div className="guide-item">
              <span className="guide-icon">📝</span>
              <p>완료한 항목은 체크 표시됩니다.</p>
            </div>
            <div className="guide-item">
              <span className="guide-icon">🔄</span>
              <p>선행 학습 항목이 있는 경우 연결선으로 표시됩니다.</p>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .settings-panel {
          position: absolute;
          top: 50px;
          right: 10px;
          width: 280px;
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10;
          overflow: hidden;
        }
        
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--vscode-panel-border);
          background-color: var(--vscode-editor-lineHighlightBackground);
        }
        
        .settings-header h3 {
          margin: 0;
          font-size: 0.95rem;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--vscode-editor-foreground);
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .tab-button {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background-color 0.2s;
        }
        
        .tab-button.active {
          background-color: var(--vscode-editor-lineHighlightBackground);
          font-weight: bold;
          border-bottom: 2px solid var(--vscode-textLink-foreground);
        }
        
        .tab-content {
          padding: 16px;
        }
        
        .setting-group {
          margin-bottom: 16px;
        }
        
        .setting-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          font-weight: bold;
        }
        
        .setting-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .option-button {
          padding: 8px 12px;
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background-color 0.2s;
        }
        
        .option-button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
        
        .option-button.active {
          background-color: var(--vscode-button-hoverBackground);
          border: 1px solid var(--vscode-focusBorder);
        }
        
        .guide-content {
          margin-top: 16px;
          border-top: 1px solid var(--vscode-panel-border);
          padding-top: 16px;
        }
        
        .guide-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .guide-icon {
          font-size: 1.2rem;
          margin-right: 10px;
          flex-shrink: 0;
        }
        
        .guide-item p {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

// 메인 RoadmapView 컴포넌트
const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmapId, onBack, parentCategoryId }) => {
  const { roadmapId: urlRoadmapId, categoryId: urlCategoryId } = useParams<{ roadmapId: string, categoryId: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstanceRef = useRef<any>(null);
  
  // 로드맵 타이틀 상태 추가
  const [roadmapTitle, setRoadmapTitle] = useState<string>('');
  
  // 선택된 노드 관련 상태 추가
  const [selectedNode, setSelectedNode] = useState<FlowNode<NodeData> | null>(null);
  const [selectedNodeContent, setSelectedNodeContent] = useState<string | null>(null);
  
  // 노드 선택 해제 함수
  const handleClearSelectedNode = useCallback(() => {
    setSelectedNode(null);
    setSelectedNodeContent(null);
  }, []);
  
  // 설정 패널 상태 추가
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('layout');
  const [showStatus, setShowStatus] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [progressStatus, setProgressStatus] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  });
  
  // 기본 레이아웃을 수평으로 변경
  const [currentLayout, setCurrentLayout] = useState<string>('horizontal');
  const [currentDirection, setCurrentDirection] = useState<string>('RIGHT');
  
  // 레이아웃 훅 사용
  const { getLayoutedElements } = useLayoutedElements(reactFlowInstanceRef.current);
  
  // 라우터 훅 사용
  const navigate = useNavigate();
  
  // 라우터 파라미터로 roadmapId 및 categoryId 얻기
  const routerRoadmapId = roadmapId || urlRoadmapId || 'python';
  const categoryId = parentCategoryId || urlCategoryId || '';
  
  // ID와 title 간의 매핑을 저장할 상태 추가
  const [idToTitleMap, setIdToTitleMap] = useState<Record<string, string>>({});
  const [titleToIdMap, setTitleToIdMap] = useState<Record<string, string>>({});
  
  // 카테고리 정보 상태 추가
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  
  // 상태 관리 코드 유지
  const viewportState = useSelector((state: RootState) => state.roadmap.viewportState);
  const nodePositions = useSelector((state: RootState) => state.roadmap.nodePositions);
  const viewMode = useSelector((state: RootState) => state.roadmap.viewMode);
  const dispatch = useDispatch();
  
  const prevViewport = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });
  
  // 로드맵 콘텐츠 관련 상태 추가
  const [roadmapContent, setRoadmapContent] = useState<RoadmapData>({ nodes: [], edges: [] });
  
  // roadmapNodes와 roadmapEdges를 state로 관리
  const [roadmapNodes, setRoadmapNodes] = useState<ImportedRoadmapNode[]>([]);
  const [roadmapEdges, setRoadmapEdges] = useState<ImportedRoadmapEdge[]>([]);
  
  // 에지 타입 정의 및 초기화 강화
  const edgeTypes = useMemo(() => {
    console.log('엣지 타입 초기화');
    return {
      custom: EdgeWithInteractions,
    };
  }, []);
  
  // 진행 상태 표시 핸들러
  const handleShowStatus = useCallback(() => {
    setShowStatus(true);
  }, []);

  // 진행 상태 숨기기 핸들러
  const handleHideStatus = useCallback(() => {
    setShowStatus(false);
  }, []);

  // 가이드 표시 핸들러
  const handleShowGuide = useCallback(() => {
    setShowGuide(true);
  }, []);

  // 가이드 숨기기 핸들러
  const handleHideGuide = useCallback(() => {
    setShowGuide(false);
  }, []);
  
  // 로드맵 정보 가져오기
  useEffect(() => {
    if (!routerRoadmapId) return;
    
    console.time('전체 로드맵 데이터 로딩 시간');
    console.log(`로드맵 데이터 로드 시작: ${routerRoadmapId}`);
    
    // 병렬 처리를 위한 Promise.all 사용
    getRoadmapData(routerRoadmapId, 'python')
      .then(roadmapData => {
        console.timeEnd('전체 로드맵 데이터 로딩 시간');
        console.log(`로드맵 데이터 로드 완료: 노드=${roadmapData.nodes.length}개, 엣지=${roadmapData.edges.length}개`);
        
        setRoadmapContent(roadmapData);
        
        // 로드맵 데이터 처리 함수 직접 호출
        loadRoadmapData(routerRoadmapId, roadmapData.nodes, roadmapData.edges);
      })
      .catch(error => {
        console.error('로드맵 데이터 로드 중 오류 발생:', error);
        dispatch(setBottomMessage(`오류: 로드맵 데이터를 로드할 수 없습니다 - ${error.message}`));
      });
    
    // 카테고리 정보 로드
    const fetchCategoryInfo = async () => {
      try {
        const response = await import('./roadmap/data/roadmap-categories.json');
        const roadmapData = response.default as CategoryRoadmapData;
        
        // 현재 로드맵에 해당하는 카테고리 찾기
        let foundCategory = null;
        let foundRoadmap = null;
        
        // 해당 roadmapId에 맞는 로드맵 노드 찾기
        foundRoadmap = roadmapData.nodes.find(node => node.id === routerRoadmapId);
        
        if (foundRoadmap) {
          // 로드맵 노드의 카테고리에 해당하는 카테고리 찾기
          const nodeCategory = foundRoadmap.data.category;
          const categoryId = Array.isArray(nodeCategory) ? nodeCategory[0] : nodeCategory;
          
          foundCategory = roadmapData.categories.find(cat => cat.id === categoryId);
        }
        
        if (foundCategory && foundRoadmap) {
          setCategoryInfo({
            category: foundCategory,
            roadmap: {
              id: foundRoadmap.id,
              title: foundRoadmap.data.title,
              description: foundRoadmap.data.description,
              thumbnail: foundRoadmap.data.thumbnail
            }
          });
          
          // 로드맵 타이틀 설정
          setRoadmapTitle(foundRoadmap.data.title);
          
          // 헤더 정보 설정
          dispatch(setHeaderInfo({
            title: foundRoadmap.data.title,
            description: foundRoadmap.data.description
          }));
        } else {
          console.log('로드맵 정보를 찾을 수 없습니다:', { routerRoadmapId });
          // 기본 헤더 정보 설정
          dispatch(setHeaderInfo({
            title: '로드맵',
            description: '학습 진행 상황을 시각적으로 확인하고 관리하세요'
          }));
        }
      } catch (err) {
        console.error('카테고리 데이터 로드 중 오류 발생:', err);
      }
    };
    
    fetchCategoryInfo();
  }, [routerRoadmapId, dispatch]);
  
  // 로드맵 데이터 로드 함수 - 기본 레이아웃을 수평으로 설정
  const loadRoadmapData = (id: string, loadedNodes?: ImportedRoadmapNode[], loadedEdges?: ImportedRoadmapEdge[]) => {
    console.time('로드맵 데이터 처리 시간');
    console.log('Loading roadmap data for:', id);
    dispatch(setBottomMessage(`로드맵 데이터 로드 중: ${id}`));
    
    // 로드된 데이터가 있으면 사용하고, 없으면 state에서 가져옴
    const nodesToUse = loadedNodes || roadmapNodes;
    const edgesToUse = loadedEdges || roadmapEdges;
    
    // state의 roadmapNodes와 roadmapEdges 확인
    if (!nodesToUse.length) {
      console.warn('roadmapNodes가 로드되지 않았습니다. 데이터 로드를 기다립니다.');
      dispatch(setBottomMessage(`roadmapNodes가 로드되지 않았습니다. 데이터 로드를 기다립니다. ${id}`));
      return; // 데이터가 로드될 때까지 기다린 후 함수가 다시 호출됩니다.
    }
    
    console.log('로드맵 노드:', nodesToUse.length, '개');
    console.log('로드맵 엣지:', edgesToUse.length, '개');
    
    // ID와 title 간의 매핑 생성
    const idToTitle: Record<string, string> = {};
    const titleToId: Record<string, string> = {};
    
    nodesToUse.forEach(node => {
      if (node.data?.title) {
        // 특별 케이스: '데이터 구조'에 대한 처리 추가
        if (node.data.title === '데이터 구조') {
          console.log('데이터 구조 노드 매핑 생성:', node.id);
          // 원본 및 인코딩된 형태 모두 매핑
          idToTitle[node.id] = node.data.title;
          titleToId[node.data.title] = node.id;
          titleToId['데이터구조'] = node.id; // 공백 없는 버전도 추가
          titleToId[encodeURIComponent(node.data.title)] = node.id;
        } else {
          // 일반적인 매핑 처리
          const safeTitle = encodeURIComponent(node.data.title);
          idToTitle[node.id] = node.data.title; // 인코딩되지 않은 원본 타이틀 저장
          titleToId[safeTitle] = node.id;
          titleToId[node.data.title] = node.id; // 원본 타이틀도 매핑
        }
      }
    });
    
    setIdToTitleMap(idToTitle);
    setTitleToIdMap(titleToId);
    
    try {
      // 데이터 형식 변환 및 노드 정보 향상
      console.log('노드와 엣지 데이터 변환 중...');
      const convertedNodes = convertToLayoutRoadmapNode(nodesToUse);
      const enhancedNodes = enhanceNodesWithEdges(convertedNodes, edgesToUse);
      
      // 먼저 createCategoryFlowLayout으로 초기 노드와 엣지 생성
      console.log('수평 레이아웃 생성 중...');
      
      // 수평 레이아웃 설정 - 수정된 createCategoryFlowLayout 함수 사용 (내부적으로 수평 레이아웃 적용)
      const { nodes: flowNodes, edges: flowEdges } = createCategoryFlowLayout(enhancedNodes);
      
      // React Flow 노드와 엣지 설정
      setNodes(flowNodes);
      setEdges(flowEdges);
      
      // 진행 상태 계산
      calculateProgress(enhancedNodes);
      
      // ELK 레이아웃 적용 (비동기) - 수평 레이아웃('RIGHT') 설정
      setTimeout(() => {
        applyLayout('layered', 'RIGHT');
      }, 300);
      
      // 노드 수와 엣지 수 로깅
      console.log(`레이아웃 생성 완료: 노드 ${flowNodes.length}개, 엣지 ${flowEdges.length}개`);
      
      if (flowEdges.length === 0) {
        console.warn('엣지가 생성되지 않았습니다. 데이터를 확인하세요.');
      }
      
      dispatch(setBottomMessage(`로드맵 데이터 로드 완료: ${id}`));
      console.timeEnd('로드맵 데이터 처리 시간');
    } catch (error) {
      console.error('로드맵 레이아웃 생성 오류:', error);
      dispatch(setBottomMessage(`로드맵 레이아웃 생성 오류: ${error.message}`));
    }
  };
  
  // 진행 상태 계산 함수
  const calculateProgress = useCallback((nodes) => {
    const total = nodes.length;
    const completed = nodes.filter(node => node.data.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    setProgressStatus({
      completed,
      total,
      percentage
    });
  }, []);
  
  // ELK 레이아웃 적용 함수 수정
  const applyLayout = useCallback((algorithm: string, direction: string = 'RIGHT') => {
    if (!reactFlowInstanceRef.current) return;
    
    // 레이아웃에 따라 방향 설정
    if (algorithm === 'horizontal') {
      direction = 'RIGHT';
      algorithm = 'layered';
    } else if (algorithm === 'vertical') {
      direction = 'DOWN';
      algorithm = 'layered';
    }
    
    setCurrentLayout(algorithm === 'layered' && direction === 'DOWN' ? 'vertical' : 'horizontal');
    setCurrentDirection(direction);
    
    dispatch(setBottomMessage(`레이아웃 적용 중: ${algorithm}, 방향: ${direction}`));
    
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
    const elkEdges = reactFlowInstanceRef.current.getEdges().map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      ...edge
    }));
    
    const graph = {
      id: 'root',
      layoutOptions: options,
      children: reactFlowInstanceRef.current.getNodes().map((node) => ({
        ...node,
        width: node.width || 180,
        height: node.height || 70,
      })),
      edges: elkEdges,
    };
    
    // ELK 레이아웃 실행
    elk.layout(graph).then(({ children }) => {
      // 노드 위치 업데이트
      const updatedNodes = children.map(elkNode => {
        const node = reactFlowInstanceRef.current.getNodes().find(n => n.id === elkNode.id);
        return {
          ...node,
          position: { x: elkNode.x, y: elkNode.y }
        };
      });
      
      reactFlowInstanceRef.current.setNodes(updatedNodes);
      window.requestAnimationFrame(() => {
        reactFlowInstanceRef.current.fitView({ padding: 0.2 });
      });
      
      dispatch(setBottomMessage(`레이아웃 적용 완료: ${algorithm}`));
    }).catch(error => {
      console.error('ELK 레이아웃 오류:', error);
      dispatch(setBottomMessage(`레이아웃 적용 실패: ${error.message}`));
    });
  }, [reactFlowInstanceRef, dispatch]);
  
  // 레이아웃 방향 변경 수정 - 커스텀 레이아웃 이름 사용
  const onLayout = useCallback((direction: 'TB' | 'LR') => {
    if (direction === 'TB') {
      applyLayout('vertical');
    } else {
      applyLayout('horizontal');
    }
  }, [applyLayout]);
  
  // 렌더링 직전 엣지 데이터 디버깅 강화
  useEffect(() => {
    console.log(`렌더링할 엣지 수: ${edges.length}`);
    if (edges.length > 0) {
      console.log('첫 번째 엣지 세부 정보:', {
        id: edges[0].id,
        source: edges[0].source,
        target: edges[0].target,
        sourceHandle: edges[0].sourceHandle,
        targetHandle: edges[0].targetHandle,
        type: edges[0].type, // 타입 확인
        style: edges[0].style // 스타일 확인
      });
    } else {
      console.warn('렌더링할 엣지가 없습니다!');
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
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: FlowNode<NodeData>) => {
    dispatch(setNodePosition({ 
      id: node.id, 
      position: { x: node.position.x, y: node.position.y } 
    }));
  }, [dispatch]);
  
  useEffect(() => {
    return () => {
      const currentViewport = reactFlowInstanceRef.current?.getViewport();
      if (currentViewport) {
        dispatch(setViewport(currentViewport));
      }
    };
  }, [dispatch]);
  
  // 뷰 모드 전환 핸들러
  const handleViewModeChange = (mode: 'flow' | 'toc') => {
    dispatch(setViewMode(mode));
  };
  
  // 뷰 리셋 함수
  const resetView = useCallback(() => {
    dispatch(setViewport({ x: 0, y: 0, zoom: 0.5 }));
  }, [dispatch]);
  
  // 뒤로가기 처리 - 항상 카테고리로 이동하도록 수정
  const handleBack = () => {
    if (categoryInfo && categoryInfo.category) {
      // 항상 카테고리 페이지로 이동
      navigate(`/education/roadmap-category/${categoryInfo.category.id}`);
    } else {
      // 카테고리 정보가 없는 경우 기본 로드맵 목록으로 이동
      navigate('/education/roadmaps');
    }
  };
  
  // 노드 클릭 핸들러 수정
  const onNodeClick = useCallback(async (event: React.MouseEvent, node: FlowNode<NodeData>) => {
    if (node.type === 'groupNode') return;
    
    // 노드 정보 로깅
    dispatch(setBottomMessage(`노드 클릭: ${node.id} (로드맵: ${routerRoadmapId})`));
    console.log(`노드 클릭 처리: ID=${node.id}, 타이틀=${node.data?.title}`);
    
    // 내비게이션 경로 정상화를 위한 정보 준비
    const contentId = node.id;
    let contentRouteId = contentId;
    
    try {
      // 타이틀이 있으면 URL 친화적으로 변환
      if (node.data?.title) {
        contentRouteId = encodeURIComponent(node.data.title);
        console.log(`노드 타이틀을 URL로 변환: "${node.data.title}" -> "${contentRouteId}"`);
      }
      
      // RoadmapContentView 페이지로 이동
      const contentPath = `/education/roadmap/${routerRoadmapId}/content/${contentRouteId}`;
      console.log(`콘텐츠 페이지로 이동: ${contentPath}`);
      navigate(contentPath);
      
    } catch (error) {
      // 오류 발생 시 기존 인라인 콘텐츠 표시 로직 유지
      console.error(`콘텐츠 페이지 이동 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      
      // 기존 동작을 대체 방법으로 유지
      setSelectedNode(node);
      
      try {
        // 콘텐츠 데이터 확인
        const roadmapContent = await fetchRoadmapContent(routerRoadmapId);
        
        if (!roadmapContent.roadmap[contentId]) {
          console.warn(`해당 콘텐츠를 찾을 수 없습니다: 노드ID=${contentId}`);
          setSelectedNodeContent(`
            <div class="error-container">
              <h3>콘텐츠를 찾을 수 없습니다</h3>
              <p>해당 노드의 콘텐츠가 서버에 존재하지 않습니다.</p>
              <p>노드 ID: ${contentId}</p>
              <p>로드맵 ID: ${routerRoadmapId}</p>
              <p>대체 방법으로 인라인 콘텐츠를 표시합니다. 정상적인 페이지 이동에 실패했습니다.</p>
            </div>
          `);
          return;
        }

        // 콘텐츠 내용 설정
        console.log(`인라인 콘텐츠 로드 완료: 노드ID=${contentId}`);
        setSelectedNodeContent(`
          <div class="warning-container">
            <h3>대체 콘텐츠 표시</h3>
            <p>정상적인 콘텐츠 페이지 이동에 실패하여 인라인으로 콘텐츠를 표시합니다.</p>
          </div>
          ${roadmapContent.roadmap[contentId].content || '<p>콘텐츠 준비 중입니다.</p>'}
        `);
      } catch (httpError) {
        // HTTP 오류 처리
        console.error(`인라인 콘텐츠 로드 중 HTTP 오류 발생:`, httpError);
        setSelectedNodeContent(`
          <div class="error-container">
            <h3>콘텐츠를 불러올 수 없습니다</h3>
            <p>서버에서 데이터를 가져오는 중 오류가 발생했습니다.</p>
            <p>오류 내용: ${httpError instanceof Error ? httpError.message : String(httpError)}</p>
          </div>
        `);
      }
    }
  }, [navigate, routerRoadmapId, dispatch, setSelectedNode, setSelectedNodeContent]);
  
  // onInit 핸들러
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
    if (viewportState && instance) {
      // 복원 전 위치 유효성 검사
      const isValidViewport = 
        !isNaN(viewportState.x) && 
        !isNaN(viewportState.y) && 
        !isNaN(viewportState.zoom);
        
      if (isValidViewport) {
        instance.setViewport({
          x: viewportState.x,
          y: viewportState.y,
          zoom: viewportState.zoom
        });
      } else {
        instance.fitView({
          padding: 0.2,
          includeHiddenNodes: false
        });
      }
    }
    
    // 0.5초 후에 수평 레이아웃 적용
    setTimeout(() => {
      applyLayout('layered', 'RIGHT');
    }, 500);
  }, [viewportState, applyLayout]);
  
  return (
    <ReactFlowProvider>
      <div className="roadmap-view-container">
        <Global styles={roadmapStyles} />
        <div className="navigation-path">
          {parentCategoryId ? (
            <>
              <button className="back-button" onClick={() => navigate('/education/roadmaps')}>
                ← 로드맵 목록
              </button>
              <span className="path-separator">›</span>
              <button className="back-button" onClick={() => navigate(`/education/roadmap-category/${parentCategoryId}`)}>
                {categoryInfo?.category?.title || '카테고리'}
              </button>
              <span className="path-separator">›</span>
              <span className="current-path">{roadmapTitle}</span>
            </>
          ) : (
            <>
              <button className="back-button" onClick={() => navigate(-1)}>
                ← 뒤로 가기
              </button>
              <span className="path-separator">›</span>
              <span className="current-path">{roadmapTitle}</span>
            </>
          )}
        </div>
        
        <div className="view-controls">
          <button 
            className={`view-mode-button ${viewMode === 'flow' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('flow')}
          >
            <span className="button-icon">🔄</span> 플로우 보기
          </button>
          <button 
            className={`view-mode-button ${viewMode === 'toc' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('toc')}
          >
            <span className="button-icon">📋</span> 목차 보기
          </button>
          
          {/* 레이아웃 컨트롤 버튼 추가 */}
          {viewMode === 'flow' && (
            <>
              <button 
                className={`view-mode-button ${currentDirection === 'RIGHT' ? 'active' : ''}`}
                onClick={() => onLayout('LR')}
              >
                <span className="button-icon">⇨</span> 수평 레이아웃
              </button>
              <button 
                className={`view-mode-button ${currentDirection === 'DOWN' ? 'active' : ''}`}
                onClick={() => onLayout('TB')}
              >
                <span className="button-icon">⇩</span> 수직 레이아웃
              </button>
            </>
          )}
        </div>
        
        {/* 로드맵 콘텐츠 영역 */}
        <div className="roadmap-content">
          {viewMode === 'flow' ? (
            <div className="flow-view-container">
              <SharedRoadmapFlowView
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onInit={onInit}
                flowRef={reactFlowInstanceRef}
                resetView={() => {
                  if (reactFlowInstanceRef.current) {
                    reactFlowInstanceRef.current.fitView({ padding: 0.2 });
                  }
                }}
                showStatistics={false}
              />
            </div>
          ) : (
            <div className="toc-view-container">
              <TableOfContentsView nodes={nodes} edges={edges} onNodeClick={onNodeClick} />
            </div>
          )}
        </div>
        
        {/* 노드 콘텐츠 영역 */}
        {selectedNode && (
          <div className="node-content-container">
            <div className="node-content-header">
              <h2 className="node-title">{(selectedNode as FlowNode<NodeData>).data.title}</h2>
              <button className="close-content-button" onClick={handleClearSelectedNode}>
                ✕
              </button>
            </div>
            <div className="node-content">
              {selectedNodeContent ? (
                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: selectedNodeContent }} />
              ) : (
                <div className="content-loading">콘텐츠를 불러오는 중...</div>
              )}
            </div>
          </div>
        )}
        
        {/* 설정 버튼 추가 */}
        <button 
          className="settings-toggle"
          onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
        >
          ⚙️ 설정
        </button>
        
        {/* 설정 패널 */}
        <SettingsPanel 
          isOpen={isSettingsPanelOpen}
          onClose={() => setIsSettingsPanelOpen(false)}
          activeTab={activeSettingsTab}
          setActiveTab={setActiveSettingsTab}
          currentLayout={currentLayout}
          onApplyLayout={applyLayout}
          onShowStatus={handleShowStatus}
          onHideStatus={handleHideStatus}
          onShowGuide={handleShowGuide}
          onHideGuide={handleHideGuide}
        />
        
        {/* 진행 상태 표시 */}
        {showStatus && (
          <div className="progress-status">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressStatus.percentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              진행률: {progressStatus.completed}/{progressStatus.total} ({progressStatus.percentage}%)
            </div>
          </div>
        )}
        
        {/* 가이드 표시 */}
        {showGuide && (
          <div className="guide-overlay">
            <div className="guide-content">
              <h3>로드맵 사용 가이드</h3>
              <ul>
                <li>노드를 클릭하여 학습 내용을 확인하세요.</li>
                <li>완료한 항목은 체크 표시됩니다.</li>
                <li>연결선을 따라 학습 순서를 확인하세요.</li>
              </ul>
              <button onClick={handleHideGuide} className="close-guide">닫기</button>
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
};

// RoadmapView 스타일 정의
const roadmapStyles = css`
  /* 기본 레이아웃 스타일 */
  .roadmap-view-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    overflow: hidden;
  }
  
  .navigation-path {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 8px 0;
    border-bottom: 1px solid var(--vscode-panel-border);
  }
  
  .back-button {
    background-color: transparent;
    border: none;
    color: var(--vscode-textLink-foreground);
    cursor: pointer;
    font-size: 0.95rem;
    padding: 0;
    text-decoration: none;
  }
  
  .back-button:hover {
    text-decoration: underline;
  }
  
  .path-separator {
    margin: 0 10px;
    color: var(--vscode-descriptionForeground);
  }
  
  .current-path {
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  /* 보기 모드 컨트롤 */
  .view-controls {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    padding: 10px 0;
    border-bottom: 1px solid var(--vscode-panel-border);
  }
  
  .view-mode-button {
    padding: 8px 16px;
    margin: 0 10px;
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
  }
  
  .button-icon {
    margin-right: 8px;
  }
  
  .view-mode-button:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
  
  .view-mode-button.active {
    background-color: var(--vscode-button-hoverBackground);
    transform: translateY(-2px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  }
  
  /* 콘텐츠 영역 */
  .roadmap-content {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  
  .flow-view-container {
    height: 700px;
    width: 100%;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
  
  .toc-view-container {
    height: 100%;
    width: 100%;
    overflow: auto;
    padding: 20px;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
  }
  
  /* React Flow 컴포넌트 스타일 */
  .react-flow {
    background-color: var(--vscode-editor-background);
  }
  
  .react-flow__node {
    transition: all 0.2s ease;
  }

  .react-flow__node:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }
  
  /* 엣지 스타일 개선 - 우선 순위 높임 */
  .react-flow__edge {
    z-index: 100 !important;
    transition: stroke-width 0.2s, opacity 0.2s, filter 0.2s;
  }
  
  .react-flow__edge-path {
    stroke: #4a8af4 !important; 
    stroke-width: 2.5px !important;
    opacity: 1 !important;
  }
  
  .react-flow__edge:hover .react-flow__edge-path {
    stroke: #ff5500 !important;
    stroke-width: 3.5px !important;
    filter: drop-shadow(0 0 5px #ff5500) !important;
    z-index: 2000 !important;
  }
  
  /* 패널 및 컨트롤 */
  .roadmap-panel {
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 8px;
    margin: 10px;
    padding: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .roadmap-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .reset-button {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .reset-button:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
  
  .reset-icon {
    margin-right: 6px;
  }
  
  /* 범례 및 가이드 */
  .flow-legend {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 12px;
    padding: 15px;
    z-index: 5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 180px;
  }
  
  .legend-title {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 0.95rem;
    border-bottom: 1px solid var(--vscode-panel-border);
    padding-bottom: 8px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    margin: 8px 0;
  }
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 8px;
  }
  
  .legend-text {
    font-size: 0.9rem;
  }
  
  .flow-mini-guide {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 12px;
    padding: 15px;
    z-index: 5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 280px;
  }
  
  .mini-guide-title {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 0.95rem;
    border-bottom: 1px solid var(--vscode-panel-border);
    padding-bottom: 8px;
  }
  
  .mini-guide-item {
    display: flex;
    align-items: center;
    margin: 8px 0;
    font-size: 0.9rem;
  }
  
  .guide-icon {
    margin-right: 8px;
    font-size: 1.1rem;
  }
  
  /* 로드맵 노드 스타일링 */
  .roadmap-node-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .roadmap-node-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 8px 12px;
    color: var(--vscode-editor-background);
    font-size: 0.85rem;
    font-weight: bold;
  }
  
  .status-icon {
    margin-right: 6px;
  }
  
  .roadmap-node-title {
    padding: 12px 16px 8px;
    font-weight: bold;
    font-size: 1.1rem;
    color: var(--vscode-editor-foreground);
  }
  
  .roadmap-node-description {
    padding: 0 16px 12px;
    font-size: 0.85rem;
    color: var(--vscode-descriptionForeground);
    line-height: 1.4;
  }
  
  /* 노드 콘텐츠 영역 */
  .node-content-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
    background-color: var(--vscode-editor-background);
    border-left: 1px solid var(--vscode-panel-border);
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
    z-index: 10;
    overflow: hidden;
  }
  
  .node-content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--vscode-panel-border);
  }
  
  .node-title {
    margin: 0;
    font-size: 1.5rem;
    color: var(--vscode-editor-foreground);
  }
  
  .close-content-button {
    background: transparent;
    border: none;
    color: var(--vscode-editor-foreground);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 5px;
  }
  
  .node-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
  }
  
  .content-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 1rem;
    color: var(--vscode-descriptionForeground);
  }
  
  .markdown-content {
    line-height: 1.6;
    font-size: 1rem;
  }
  
  .markdown-content h1, .markdown-content h2, .markdown-content h3 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  
  .markdown-content p, .markdown-content ul, .markdown-content ol {
    margin-bottom: 1em;
  }
  
  .markdown-content code {
    font-family: monospace;
    background-color: var(--vscode-textCodeBlock-background);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }
  
  .markdown-content pre {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin: 1em 0;
  }
  
  .markdown-content a {
    color: var(--vscode-textLink-foreground);
    text-decoration: none;
  }
  
  .markdown-content a:hover {
    text-decoration: underline;
  }
  
  .roadmap-flow-container {
    width: 100%;
    height: 100%;
  }
  
  .settings-toggle {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    z-index: 5;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .settings-toggle:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
  
  .progress-status {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
    padding: 10px 15px;
    z-index: 5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .progress-bar {
    height: 10px;
    background-color: var(--vscode-editor-lineHighlightBackground);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  
  .progress-fill {
    height: 100%;
    background-color: var(--vscode-terminal-ansiGreen);
    border-radius: 5px;
    transition: width 0.5s ease;
  }
  
  .progress-text {
    font-size: 0.85rem;
    text-align: center;
  }
  
  .guide-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
  }
  
  .guide-content {
    background-color: var(--vscode-editor-background);
    border-radius: 8px;
  }
`;

export default RoadmapView; 