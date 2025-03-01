import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setHeaderInfo } from '../../redux/slices/uiStateSlice';
import ELK from 'elkjs/lib/elk.bundled.js';
import { 
  ReactFlow,
  Controls,
  Background, 
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  Node,
  Edge,
  NodeTypes,
  Panel,
  ReactFlowInstance,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { css } from '@emotion/react';
import { EdgeWithInteractions } from './roadmap/EdgeWithInteractions';
import CustomNode from './roadmap/CustomNode';
import SharedRoadmapFlowView from './SharedRoadmapFlowView';
import { createCategoryFlowLayout, RoadmapNode, layoutElements as layoutUtilsElements } from './layoutUtils';

// ELK 타입 정의 확장
interface ElkExtendedEdge {
  id: string;
  sources: string[];
  targets: string[];
  [key: string]: any;
}

// 카테고리와 로드맵 데이터 타입 정의
interface Category {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  order: string;
}

interface RoadmapData {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
  edges: any[];
  categories: Category[];
  paths: any[];
}

// 플로우 노드 데이터 타입 정의
type FlowNodeData = {
  label: string;
  description: string;
  level: string;
  thumbnail: string;
  [key: string]: any; // 인덱스 시그니처 추가
};

// ELK 레이아웃 처리를 위한 훅
const useLayoutedElements = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layouting, setLayouting] = useState(false);

  const elk = useMemo(() => new ELK(), []);

  const getLayoutedElements = useCallback(
    async (
      nodes: Node[],
      edges: Edge[],
      options: { [key: string]: string } = { 'elk.algorithm': 'layered' }
    ) => {
      if (!nodes.length) return { nodes, edges };

      setLayouting(true);

      const elkNodes = nodes.map((node) => ({
        id: node.id,
        width: 250,
        height: 150,
        data: node.data
      }));

      const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
        data: edge.data
      }));

      const graph = {
        id: 'root',
        layoutOptions: options,
        children: elkNodes,
        edges: elkEdges
      };

      try {
        const { children } = await elk.layout(graph);

        // 레이아웃된 노드 위치 적용
        const layoutedNodes = nodes.map((node) => {
          const elkNode = children.find((elkNode) => elkNode.id === node.id);
          if (elkNode) {
            return {
              ...node,
              position: {
                x: elkNode.x || 0,
                y: elkNode.y || 0
              }
            };
          }
          return node;
        });

        setLayouting(false);
        return { nodes: layoutedNodes, edges };
      } catch (error) {
        console.error('ELK 레이아웃 생성 중 오류 발생:', error);
        setLayouting(false);
        return { nodes, edges };
      }
    },
    [elk]
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    layouting,
    getLayoutedElements
  };
};

// 설정 패널 컴포넌트 추가
interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentLayout: string;
  onApplyLayout: (layout: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetView: () => void;
  onSetDashedEdges: () => void;
  onSetSolidEdges: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  currentLayout,
  onApplyLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetView,
  onSetDashedEdges,
  onSetSolidEdges
}) => {
  if (!isOpen) return null;

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>설정</h3>
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
          className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          보기
        </button>
      </div>
      
      {activeTab === 'layout' && (
        <div className="tab-content">
          <div className="setting-group">
            <label className="setting-label">레이아웃 유형</label>
            <div className="setting-options">
              <button 
                className={`option-button ${currentLayout === 'layered' ? 'active' : ''}`}
                onClick={() => onApplyLayout('layered')}
              >
                계층형
              </button>
              <button 
                className={`option-button ${currentLayout === 'force' ? 'active' : ''}`}
                onClick={() => onApplyLayout('force')}
              >
                힘 기반
              </button>
              <button 
                className={`option-button ${currentLayout === 'horizontal' ? 'active' : ''}`}
                onClick={() => onApplyLayout('horizontal')}
              >
                수평
              </button>
              <button 
                className={`option-button ${currentLayout === 'vertical' ? 'active' : ''}`}
                onClick={() => onApplyLayout('vertical')}
              >
                수직
              </button>
              <button 
                className={`option-button ${currentLayout === 'radial' ? 'active' : ''}`}
                onClick={() => onApplyLayout('radial')}
              >
                방사형
              </button>
            </div>
          </div>
          
          <div className="setting-group">
            <label className="setting-label">엣지 스타일</label>
            <div className="setting-options">
              <button 
                className="option-button"
                onClick={onSetDashedEdges}
              >
                점선
              </button>
              <button 
                className="option-button"
                onClick={onSetSolidEdges}
              >
                실선
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'view' && (
        <div className="tab-content">
          <div className="setting-group">
            <label className="setting-label">확대/축소</label>
            <div className="setting-options">
              <button className="option-button" onClick={onZoomIn}>확대 (+)</button>
              <button className="option-button" onClick={onZoomOut}>축소 (-)</button>
            </div>
          </div>
          <div className="setting-group">
            <label className="setting-label">뷰 조정</label>
            <div className="setting-options">
              <button className="option-button" onClick={onFitView}>화면에 맞추기</button>
              <button className="option-button" onClick={onResetView}>뷰 초기화</button>
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
          border-radius:.5rem;
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
      `}</style>
    </div>
  );
};

const CategoryRoadmapView: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [roadmaps, setRoadmaps] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 뷰 모드 상태 추가
  const [viewMode, setViewMode] = useState<'list' | 'flow'>('list');
  
  // 설정 패널 상태 추가
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('layout');
  const [currentLayout, setCurrentLayout] = useState('layered');
  
  // ELK 레이아웃 처리를 위한 훅 활용
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    layouting,
    getLayoutedElements
  } = useLayoutedElements();
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // 리액트 플로우 인스턴스 참조 추가
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // 색상 배열 추가 (카테고리별 색상)
  const categoryColors = [
    'var(--vscode-terminal-ansiBlue)',
    'var(--vscode-terminal-ansiGreen)',
    'var(--vscode-terminal-ansiYellow)',
    'var(--vscode-terminal-ansiRed)',
    'var(--vscode-terminal-ansiMagenta)',
    'var(--vscode-terminal-ansiCyan)'
  ];
  
  // 노드 및 엣지 타입 정의
  const nodeTypes = useMemo(() => ({
    custom: CustomNode
  }), []);
  
  const edgeTypes = useMemo(() => ({
    custom: EdgeWithInteractions,
  }), []);
  
  // 로드맵 클릭 핸들러
  const handleRoadmapClick = (roadmapId: string) => {
    navigate(`/education/roadmap/${roadmapId}`);
  };
  
  // 노드 클릭 핸들러 - 올바른 타입으로 정의
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // 가상 루트 노드는 클릭 무시
    if (node.id === 'virtual-root') return;
    handleRoadmapClick(node.id);
  }, [handleRoadmapClick]);
  
  // 뷰 조작 함수들
  const zoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);

  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);
  
  // 뷰 리셋 함수
  const resetView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);
  
  // 레이아웃 적용 함수
  const applyLayout = useCallback(async (layoutType: string) => {
    setCurrentLayout(layoutType);
    
    if (!nodes.length) return;
    
    let options = {};
    
    switch (layoutType) {
      case 'layered':
        options = { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN' };
        break;
      case 'force':
        options = { 'elk.algorithm': 'force' };
        break;
      case 'horizontal':
        options = { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT' };
        break;
      case 'vertical':
        options = { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN', 'elk.spacing.nodeNode': '80' };
        break;
      case 'radial':
        options = { 'elk.algorithm': 'radial' };
        break;
      default:
        options = { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN' };
    }
    
    try {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
        nodes,
        edges,
        options as { [key: string]: string }
      );
      
      setNodes(layoutedNodes);
      setEdges(layoutedEdges.map(edge => ({
        ...edge,
        animated: true,
        style: {
          ...edge.style,
          strokeDasharray: '5,5'
        }
      })));
      
      setTimeout(() => {
        resetView();
      }, 10);
    } catch (error) {
      console.error('레이아웃 적용 중 오류 발생:', error);
    }
  }, [nodes, edges, getLayoutedElements, resetView, setNodes, setEdges]);
  
  // 카테고리 데이터 로드
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // 실제 환경에서는 API 호출로 대체될 수 있음
        const response = await import('./roadmap/data/roadmap-categories.json');
        const roadmapData = response.default as RoadmapData;
        
        // 요청한 카테고리 ID와 일치하는 카테고리 찾기
        const foundCategory = roadmapData.categories.find(
          (cat: Category) => cat.id === categoryId
        );
        
        if (!foundCategory) {
          setError(`'${categoryId}' 카테고리를 찾을 수 없습니다.`);
          setLoading(false);
          return;
        }
        
        // 해당 카테고리에 속한 로드맵만 필터링
        const categoryRoadmaps = roadmapData.nodes.filter(node => {
          const nodeCategory = node.data.category;
          if (Array.isArray(nodeCategory)) {
            return nodeCategory.includes(categoryId);
          }
          return nodeCategory === categoryId;
        });
        
        setCategory(foundCategory);
        setRoadmaps(categoryRoadmaps);
        
        // 플로우 뷰용 노드와 엣지 생성
        createFlowElements(categoryRoadmaps);
        
        setLoading(false);
        
        // 헤더 정보 설정
        dispatch(setHeaderInfo({
          title: foundCategory.title,
          description: foundCategory.description
        }));
      } catch (err) {
        console.error('카테고리 데이터를 불러오는 중 오류 발생:', err);
        setError('카테고리 데이터를 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, dispatch]);
  
  // 플로우 뷰를 위한 노드와 엣지 생성 - 개선된 버전
  const createFlowElements = async (roadmapNodes: RoadmapNode[]) => {
    // RoadmapListView 스타일의 플로우 레이아웃 생성
    const { nodes: layoutNodes, edges: layoutEdges } = createCategoryFlowLayout(roadmapNodes);
    
    // 노드에 스타일 및 추가 정보 적용
    const styledNodes = layoutNodes.map((node, index) => {
      // 노드 데이터에서 레벨 정보 추출
      const level = node.data?.level || '초급';
      
      // 레벨별 색상 설정
      let levelColor;
      switch(level) {
        case '초급':
          levelColor = 'var(--vscode-terminal-ansiBlue)';
          break;
        case '중급':
          levelColor = 'var(--vscode-terminal-ansiYellow)';
          break;
        case '고급':
          levelColor = 'var(--vscode-terminal-ansiRed)';
          break;
        default:
          levelColor = 'var(--vscode-terminal-ansiBlue)';
      }
      
      return {
        ...node,
        style: {
          width: 250,
          height: 150,
          borderRadius: 10,
          border: `2px solid ${levelColor}`,
          backgroundColor: 'var(--vscode-editor-background)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        },
        data: {
          ...node.data,
          levelColor,
          nodeIndex: index
        }
      };
    });
    
    // 엣지에 기본 스타일 적용 (커스텀 엣지 타입 제거)
    const styledEdges = layoutEdges.map(edge => ({
      ...edge,
      animated: true,
      style: {
        stroke: 'var(--vscode-textLink-foreground)',
        strokeWidth: 1.5,
        strokeDasharray: '5,5'
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--vscode-textLink-foreground)',
        width: 12,
        height: 12
      }
    }));
    
    // ELK 레이아웃 적용
    try {
      const { nodes: elkNodes, edges: elkEdges } = await getLayoutedElements(
        styledNodes,
        styledEdges,
        { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN' }
      );
      
      setNodes(elkNodes);
      setEdges(elkEdges);
      
      // 약간의 지연 후 뷰 피팅
      setTimeout(() => {
        resetView();
      }, 100);
    } catch (error) {
      console.error('레이아웃 적용 중 오류 발생:', error);
      // 오류 시 기본 레이아웃 사용
      setNodes(styledNodes);
      setEdges(styledEdges);
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate('/education/roadmaps');
  };
  
  // 뷰 모드 전환 핸들러
  const handleViewModeChange = (mode: 'list' | 'flow') => {
    setViewMode(mode);
    
    // 플로우 뷰로 전환 시 뷰 리셋
    if (mode === 'flow') {
      setTimeout(() => {
        resetView();
      }, 100);
    }
  };

  // 엣지 스타일 변경 함수
  const setDashedEdges = useCallback(() => {
    setEdges(edges.map(edge => ({
      ...edge,
      animated: true,
      style: {
        ...edge.style,
        strokeDasharray: '5,5'
      }
    })));
  }, [edges, setEdges]);
  
  const setSolidEdges = useCallback(() => {
    setEdges(edges.map(edge => ({
      ...edge,
      animated: false,
      style: {
        ...edge.style,
        strokeDasharray: 'none'
      }
    })));
  }, [edges, setEdges]);

  // 이미지 로딩 오류 상태 관리
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  
  // 이미지 오류 핸들러
  const handleImageError = (roadmapId: string) => {
    setFailedImages(prev => ({
      ...prev,
      [roadmapId]: true
    }));
  };

  if (loading) {
    return <div className="loading-container">카테고리 정보를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={handleBack}>로드맵 목록으로 돌아가기</button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="error-container">
        <div className="error-message">카테고리 정보를 찾을 수 없습니다.</div>
        <button className="back-button" onClick={handleBack}>로드맵 목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="category-view-container">
      <div className="navigation-path">
        <button className="back-button" onClick={handleBack}>← 로드맵 목록</button>
      </div>
      
      <div className="view-controls">
        <button 
          className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('list')}
        >
          <span className="button-icon">📋</span> 목록 보기
        </button>
        <button 
          className={`view-mode-button ${viewMode === 'flow' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('flow')}
        >
          <span className="button-icon">🔄</span> 플로우 보기
        </button>
      </div>
      
      {viewMode === 'list' ? (
        <div className="roadmaps-grid">
          {roadmaps.map((roadmap) => (
            <div 
              key={roadmap.id} 
              className={`roadmap-card ${roadmap.data.featured ? 'featured' : ''}`}
              onClick={() => handleRoadmapClick(roadmap.id)}
            >
              {roadmap.data.thumbnail && !failedImages[roadmap.id] ? (
                <div className="roadmap-thumbnail">
                  <img 
                    src={roadmap.data.thumbnail} 
                    alt={roadmap.data.title} 
                    onError={() => handleImageError(roadmap.id)}
                  />
                </div>
              ) : null}
              <div className={`roadmap-info ${!roadmap.data.thumbnail || failedImages[roadmap.id] ? 'no-thumbnail' : ''}`}>
                <h3 className="roadmap-title">{roadmap.data.title}</h3>
                <p className="roadmap-description">{roadmap.data.description}</p>
                <div className="roadmap-action">로드맵 시작하기 →</div>
              </div>
              {roadmap.data.featured && <div className="featured-badge">추천</div>}
              {roadmap.data.level && <div className={`level-badge level-${roadmap.data.level}`}>{roadmap.data.level}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="flow-container">
          <ReactFlowProvider>
            <button 
              className="settings-toggle-button"
              onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
              title="설정"
            >
              ⚙️
            </button>
            
            <SettingsPanel
              isOpen={isSettingsPanelOpen}
              onClose={() => setIsSettingsPanelOpen(false)}
              activeTab={activeSettingsTab}
              setActiveTab={setActiveSettingsTab}
              currentLayout={currentLayout}
              onApplyLayout={applyLayout}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onFitView={fitView}
              onResetView={resetView}
              onSetDashedEdges={setDashedEdges}
              onSetSolidEdges={setSolidEdges}
            />
            
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              onInit={setReactFlowInstance}
              minZoom={0.1}
              maxZoom={1.5}
              onNodeClick={onNodeClick}
              panOnDrag={true}
              className="react-flow-container"
              fitView
            >
              <Controls showInteractive={false} />
              <Background gap={16} color="#808080" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      )}

      <style jsx>{`
        .category-view-container {
          padding: 20px;
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
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
          display: flex;
          align-items: center;
        }
        
        .back-button:hover {
          text-decoration: underline;
        }
        
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
        
        .roadmaps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          margin-top: 20px;
        }
        
        .roadmap-card {
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
          position: relative;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .roadmap-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--vscode-textLink-foreground);
        }
        
        .roadmap-card.featured {
          border-color: var(--vscode-terminal-ansiYellow);
          box-shadow: 0 5px 20px rgba(255, 200, 0, 0.1);
        }
        
        .roadmap-card.featured:hover {
          box-shadow: 0 10px 25px rgba(255, 200, 0, 0.15);
        }
        
        .roadmap-thumbnail {
          height: 180px;
          overflow: hidden;
          position: relative;
        }
        
        .roadmap-thumbnail::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(to top, var(--vscode-editor-background), transparent);
        }
        
        .roadmap-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        
        .roadmap-card:hover .roadmap-thumbnail img {
          transform: scale(1.05);
        }
        
        .roadmap-info {
          padding: 20px;
        }
        
        .roadmap-title {
          font-size: 1.3rem;
          margin-bottom: 0.8rem;
          color: var(--vscode-textLink-foreground);
        }
        
        .roadmap-description {
          font-size: 1rem;
          color: var(--vscode-descriptionForeground);
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        
        .roadmap-action {
          font-size: 0.9rem;
          color: var(--vscode-terminal-ansiBlue);
          font-weight: 600;
          text-align: right;
          margin-top: 0.5rem;
          transition: transform 0.2s;
        }
        
        .roadmap-card:hover .roadmap-action {
          transform: translateX(5px);
        }
        
        .featured-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background-color: var(--vscode-terminal-ansiYellow);
          color: var(--vscode-editor-background);
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .level-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .level-초급 {
          background-color: var(--vscode-terminal-ansiBlue);
          color: var(--vscode-editor-background);
        }
        
        .level-중급 {
          background-color: var(--vscode-terminal-ansiYellow);
          color: var(--vscode-editor-background);
        }
        
        .level-고급 {
          background-color: var(--vscode-terminal-ansiRed);
          color: var(--vscode-editor-background);
        }
        
        .flow-container {
          height: 700px;
          width: 100%;
          border: 1px solid var(--vscode-panel-border);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        
        .settings-toggle-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          font-size: 1.2rem;
          z-index: 10;
          transition: background-color 0.2s, transform 0.2s;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        
        .settings-toggle-button:hover {
          background-color: var(--vscode-editor-lineHighlightBackground);
          transform: scale(1.05);
        }
        
        .react-flow-container {
          width: 100%;
          height: 100%;
        }
        
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: calc(100vh - 100px);
          font-size: 1.2rem;
        }
        
        .error-message {
          color: var(--vscode-errorForeground);
          margin-bottom: 20px;
        }
        
        .roadmap-info.no-thumbnail {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-bottom: 10px;
        }
        
        .roadmap-info.no-thumbnail .roadmap-title {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default CategoryRoadmapView; 