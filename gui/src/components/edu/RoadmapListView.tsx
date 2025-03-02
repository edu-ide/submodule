import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setHeaderInfo } from '../../redux/slices/uiStateSlice';
import { setListViewMode } from '../../redux/roadmapSlice';
import { RootState } from '../../redux/store';
import ELK from 'elkjs/lib/elk.bundled.js';
import { 
  ReactFlow,
  Controls,
  Background, 
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionLineType,
  Panel,
  ReactFlowInstance,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { css } from '@emotion/react';
import SharedRoadmapFlowView from './SharedRoadmapFlowView';
import { RoadmapNode, layoutElements as layoutUtilsElements, createCategoryFlowLayout } from './layoutUtils';

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
const useLayoutedElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();
  
  // 기본 레이아웃 옵션 설정
  const defaultOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': 100,
    'elk.spacing.nodeNode': 80,
  };
  
  const getLayoutedElements = useCallback((options) => {
    const layoutOptions = { ...defaultOptions, ...options };
    
    // Edge를 ElkExtendedEdge로 변환
    const elkEdges = getEdges().map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      ...edge
    }));
    
    const graph = {
      id: 'root',
      layoutOptions: layoutOptions,
      children: getNodes().map((node) => ({
        ...node,
        width: node.width || 180,
        height: node.height || 70,
      })),
      edges: elkEdges,
    };
    
    elk.layout(graph).then(({ children }) => {
      // 노드 위치 업데이트
      const updatedNodes = children.map(elkNode => {
        const node = getNodes().find(n => n.id === elkNode.id);
        return {
          ...node,
          position: { x: elkNode.x, y: elkNode.y }
        };
      });
      
      setNodes(updatedNodes);
      window.requestAnimationFrame(() => {
        fitView({ padding: 0.2 });
      });
    });
  }, [getNodes, setNodes, getEdges, fitView]);
  
  return { getLayoutedElements };
};

// 데이터 타입 정의
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
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  steps: string[];
}

// 설정 패널 컴포넌트
const SettingsPanel = ({ isOpen, onClose, activeTab, setActiveTab, currentLayout, onApplyLayout, onZoomIn, onZoomOut, onFitView, onResetView }) => {
  return (
    <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
      <div className="settings-header">
        <h3 className="settings-title">로드맵 설정</h3>
        <button type="button" className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="settings-tabs">
        <button 
          type="button"
          className={`tab-button ${activeTab === 'control' ? 'active' : ''}`}
          onClick={() => setActiveTab('control')}
        >
          <span className="tab-icon">🎮</span> 컨트롤
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          <span className="tab-icon">🔄</span> 레이아웃
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'legend' ? 'active' : ''}`}
          onClick={() => setActiveTab('legend')}
        >
          <span className="tab-icon">🎨</span> 노드 타입
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          <span className="tab-icon">📝</span> 가이드
        </button>
      </div>
      
      <div className="settings-content">
        {activeTab === 'control' && (
          <div className="control-settings">
            <h4 className="settings-subtitle">뷰 컨트롤</h4>
            <div className="control-buttons">
              <button 
                type="button"
                className="control-button"
                onClick={onZoomIn}
              >
                <span className="control-icon">🔍+</span> 확대
              </button>
              <button 
                type="button"
                className="control-button"
                onClick={onZoomOut}
              >
                <span className="control-icon">🔍-</span> 축소
              </button>
              <button 
                type="button"
                className="control-button"
                onClick={onFitView}
              >
                <span className="control-icon">↔️</span> 화면에 맞추기
              </button>
              <button 
                type="button"
                className="control-button"
                onClick={onResetView}
              >
                <span className="control-icon">🔄</span> 뷰 초기화
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'layout' && (
          <div className="layout-settings">
            <h4 className="settings-subtitle">레이아웃 선택</h4>
            <div className="layout-buttons">
              <button 
                type="button"
                className={`layout-button ${currentLayout === 'layered' ? 'active' : ''}`}
                onClick={() => onApplyLayout('layered', 'RIGHT')}
              >
                <span className="layout-icon">⇨</span> 수평 레이아웃
              </button>
              <button 
                type="button"
                className={`layout-button ${currentLayout === 'layered-down' ? 'active' : ''}`}
                onClick={() => onApplyLayout('layered', 'DOWN')}
              >
                <span className="layout-icon">⇩</span> 수직 레이아웃
              </button>
              <button 
                type="button"
                className={`layout-button ${currentLayout === 'org.eclipse.elk.radial' ? 'active' : ''}`}
                onClick={() => onApplyLayout('org.eclipse.elk.radial')}
              >
                <span className="layout-icon">⚪</span> 방사형 레이아웃
              </button>
              <button 
                type="button"
                className={`layout-button ${currentLayout === 'org.eclipse.elk.force' ? 'active' : ''}`}
                onClick={() => onApplyLayout('org.eclipse.elk.force')}
              >
                <span className="layout-icon">🧲</span> 포스 레이아웃
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'legend' && (
          <div className="legend-settings">
            <h4 className="settings-subtitle">노드 타입</h4>
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: 'var(--vscode-terminal-ansiMagenta)'}}></div>
              <div className="legend-text">🌟 카테고리</div>
            </div>
            <h4 className="settings-subtitle" style={{marginTop: '15px'}}>난이도</h4>
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: 'var(--vscode-terminal-ansiBlue)'}}></div>
              <div className="legend-text">🔰 초급</div>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: 'var(--vscode-terminal-ansiYellow)'}}></div>
              <div className="legend-text">🏆 중급</div>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: 'var(--vscode-terminal-ansiRed)'}}></div>
              <div className="legend-text">🚀 고급</div>
            </div>
          </div>
        )}
        
        {activeTab === 'guide' && (
          <div className="guide-settings">
            <h4 className="settings-subtitle">사용 가이드</h4>
            <div className="guide-item">
              <span className="guide-icon">👆</span>
              <span>노드를 클릭하여 해당 카테고리나 로드맵으로 이동</span>
            </div>
            <div className="guide-item">
              <span className="guide-icon">🔄</span>
              <span>화면을 드래그하여 이동 가능</span>
            </div>
            <div className="guide-item">
              <span className="guide-icon">📏</span>
              <span>마우스 휠로 확대/축소</span>
            </div>
            <div className="guide-item">
              <span className="guide-icon">🔍</span>
              <span>엣지에 마우스를 올리면 연결 관계 강조 표시</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 플로우 뷰 로직을 별도 컴포넌트로 분리
const RoadmapFlowView = ({ nodes: initialNodes, edges: initialEdges, onNodeClick, resetView }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [currentLayout, setCurrentLayout] = useState<string>('layered');
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // ReactFlow 훅 - 이제 ReactFlowProvider 내부에서 안전하게 사용 가능
  const reactFlow = useReactFlow();
  
  // 줌 인/아웃 함수
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);
  
  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);
  
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);
  
  // 레이아웃 함수 - 이제 컴포넌트 내부에서 정의
  const applyLayout = useCallback((algorithm: string, direction: string = 'RIGHT') => {
    if (!reactFlow) return;
    
    setCurrentLayout(algorithm === 'layered' && direction === 'DOWN' ? 'layered-down' : algorithm);
    
    const defaultOptions = {
      'elk.layered.spacing.nodeNodeBetweenLayers': 100,
      'elk.spacing.nodeNode': 80,
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
      options['elk.radial.radius'] = 300;
      options['elk.radial.compaction'] = 0.4;
    } else if (algorithm === 'org.eclipse.elk.force') {
      options['elk.force.iterations'] = 100;
      options['elk.force.repulsion'] = 5;
    }
    
    // Edge를 ElkExtendedEdge로 변환
    const elkEdges = reactFlow.getEdges().map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      ...edge
    }));
    
    const graph = {
      id: 'root',
      layoutOptions: options,
      children: reactFlow.getNodes().map((node) => ({
        ...node,
        width: node.width || 180,
        height: node.height || 70,
      })),
      edges: elkEdges,
    };
    
    const elk = new ELK();
    elk.layout(graph).then(({ children }) => {
      // 노드 위치 업데이트
      const updatedNodes = children.map(elkNode => {
        const node = reactFlow.getNodes().find(n => n.id === elkNode.id);
        return {
          ...node,
          position: { x: elkNode.x, y: elkNode.y },
          style: {
            ...node?.style,
            width: 'auto',
            maxWidth: '160px',
            minWidth: '120px'
          },
          className: 'multi-line-node'
        };
      });
      
      reactFlow.setNodes(updatedNodes);
      window.requestAnimationFrame(() => {
        reactFlow.fitView({ padding: 0.2 });
      });
    });
  }, [reactFlow]);
  
  // 뷰 리셋 함수 업데이트
  const handleResetView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ 
        padding: 0.3, 
        includeHiddenNodes: false,
        minZoom: 0.2,
        maxZoom: 1.0
      });
      
      setTimeout(() => {
        reactFlowInstance.zoomTo(0.7);
        const flowContainer = document.querySelector('.flow-container');
        if (flowContainer) {
          const { width, height } = flowContainer.getBoundingClientRect();
          reactFlowInstance.setCenter(width / 2, height / 2);
        }
      }, 100);
    }
  }, [reactFlowInstance]);
  
  // 컴포넌트 마운트 시 초기 레이아웃 적용
  useEffect(() => {
    if (reactFlow && nodes.length > 0) {
      setTimeout(() => {
        applyLayout('layered', 'RIGHT');
      }, 300);
    }
  }, [reactFlow, nodes.length, applyLayout]);
  
  // EducationLayout의 설정 패널에서 보내는 이벤트 수신
  useEffect(() => {
    const handleLayoutChange = (event: CustomEvent) => {
      if (event.detail && event.detail.layout) {
        const layout = event.detail.layout;
        if (layout === 'horizontal') {
          applyLayout('layered', 'RIGHT');
        } else if (layout === 'vertical') {
          applyLayout('layered', 'DOWN');
        }
      }
    };
    
    window.addEventListener('roadmap-layout-change', handleLayoutChange as EventListener);
    
    return () => {
      window.removeEventListener('roadmap-layout-change', handleLayoutChange as EventListener);
    };
  }, [applyLayout]);
  
  return (
    <>
      <SharedRoadmapFlowView
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={(instance) => setReactFlowInstance(instance)}
        showStatistics={false}
      />
      
      <style jsx global>{`
        /* ReactFlow z-index 조정 */
        .react-flow {
          z-index: 5 !important;
        }
        
        .react-flow__controls {
          z-index: 6 !important;
        }
        
        .react-flow__panel {
          z-index: 7 !important;
        }
      `}</style>
    </>
  );
};

const RoadmapListView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const listViewMode = useSelector((state: RootState) => state.roadmap.listViewMode);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 카테고리 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 실제 환경에서는 API 호출로 대체될 수 있음
        const response = await import('./roadmap/data/roadmap-categories.json');
        const roadmapData = response.default as RoadmapData;
        
        setCategories(roadmapData.categories);
        setRoadmapNodes(roadmapData.nodes);
        
        // 플로우 뷰용 데이터 생성
        createFlowElements(roadmapData.categories, roadmapData.nodes);
        
        setLoading(false);
        
        // 헤더 정보 설정
        dispatch(setHeaderInfo({
          title: '학습 로드맵',
          description: '다양한 분야의 학습 로드맵을 탐색해보세요'
        }));
      } catch (err) {
        console.error('로드맵 카테고리를 불러오는 중 오류 발생:', err);
        setError('카테고리 데이터를 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);
  
  // 플로우 뷰를 위한 노드와 엣지 생성
  const createFlowElements = (categories: Category[], roadmapNodes: RoadmapNode[]) => {
    // 트리 데이터 구조 생성
    const treeData = {};
    const rootNodes = [];
    const visitedPaths = new Set(); // 순환 참조 감지용
    
    // 노드 데이터 변환
    roadmapNodes.forEach(node => {
      treeData[node.id] = {
        id: node.id,
        name: node.data.title,
        description: node.data.description,
        children: [],
        siblings: [],
        spouses: [],
        parents: [],
        level: node.data.level || '초급',
        category: node.data.category,
        thumbnail: node.data.thumbnail
      };
    });
    
    // 부모-자식 관계 설정 (순환 참조 방지)
    roadmapNodes.forEach(node => {
      if (node.data.prerequisites && node.data.prerequisites.length > 0) {
        node.data.prerequisites.forEach(parentId => {
          // 순환 참조 검사
          const path = `${parentId}->${node.id}`;
          const reversePath = `${node.id}->${parentId}`;
          
          if (visitedPaths.has(reversePath)) {
            console.warn(`순환 참조 감지: ${path}, 이 관계는 무시됩니다.`);
            return; // 순환 참조 무시
          }
          
          visitedPaths.add(path);
          
          if (treeData[parentId] && treeData[node.id]) {
            if (!treeData[node.id].parents.includes(parentId)) {
              treeData[node.id].parents.push(parentId);
            }
            
            if (!treeData[parentId].children.includes(node.id)) {
              treeData[parentId].children.push(node.id);
            }
          }
        });
      } else {
        rootNodes.push(node.id);
      }
    });
    
    console.log('루트 노드 수:', rootNodes.length);
    console.log('첫번째 루트 노드:', rootNodes[0] || 'none');
    
    // 가상 루트 노드가 필요한 경우 (루트 노드가 여러 개인 경우)
    const useVirtualRoot = rootNodes.length > 1 || rootNodes.length === 0;
    const rootId = useVirtualRoot ? 'virtual-root' : rootNodes[0];
    
    if (useVirtualRoot) {
      treeData['virtual-root'] = {
        id: 'virtual-root',
        name: '로드맵 시작점',
        children: rootNodes,
        siblings: [],
        spouses: [],
        parents: [],
        isRoot: true
      };
      
      // 루트 노드들에 가상 루트 부모 설정
      rootNodes.forEach(nodeId => {
        if (treeData[nodeId]) {
          treeData[nodeId].parents = ['virtual-root'];
        }
      });
    }
    
    try {
      // 노드와 엣지 생성 - 기존 방식대로 노드와 엣지 초기 생성
      const { nodes: initialNodes, edges: initialEdges } = createCategoryFlowLayout(roadmapNodes);
      
      // 노드의 너비와 높이 제한
      const updatedNodes = initialNodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          width: 'auto',
          maxWidth: '160px',
          minWidth: '120px'
        },
        className: 'multi-line-node'
      }));
      
      setNodes(updatedNodes);
      setEdges(initialEdges);
    } catch (error) {
      console.error('레이아웃 계산 중 예외 발생:', error);
      
      // 예외 발생 시 카테고리 레이아웃 함수로 폴백
      const { nodes, edges } = createCategoryFlowLayout(roadmapNodes);
      
      // 노드의 너비와 높이 제한
      const updatedNodes = nodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          width: 'auto',
          maxWidth: '160px',
          minWidth: '120px'
        },
        className: 'multi-line-node'
      }));
      
      setNodes(updatedNodes);
      setEdges(edges);
    }
  };

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/education/roadmap-category/${categoryId}`);
  };

  // 로드맵 클릭 핸들러 - 항상 카테고리 페이지로 먼저 이동하도록 수정
  const handleRoadmapClick = (categoryId: string, roadmapId: string) => {
    // 직접 로드맵 페이지로 이동
    navigate(`/education/roadmap/${roadmapId}`);
  };
  
  // 플로우에서 노드 클릭 핸들러
  const handleNodeClick = (_, node) => {
    // 루트 노드는 클릭 무시
    if (node.id === 'roadmap-center') return;
    
    if (node.data.isCategory) {
      handleCategoryClick(node.id);
    } else {
      // 노드의 카테고리 찾기
      const nodeData = roadmapNodes.find(r => r.id === node.id);
      if (nodeData) {
        const category = Array.isArray(nodeData.data.category) 
          ? nodeData.data.category[0] 
          : nodeData.data.category;
        
        handleRoadmapClick(category, node.id);
      }
    }
  };
  
  // 뷰 모드 변경 핸들러
  const handleViewModeChange = (mode: 'list' | 'flow') => {
    dispatch(setListViewMode(mode));
  };

  // 특정 카테고리에 속한 로드맵 노드 가져오기
  const getRoadmapsForCategory = (categoryId: string): RoadmapNode[] => {
    return roadmapNodes.filter(node => {
      const nodeCategory = node.data.category;
      if (Array.isArray(nodeCategory)) {
        return nodeCategory.includes(categoryId);
      }
      return nodeCategory === categoryId;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">로드맵 데이터 로딩 중...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="roadmap-list-page">
      {/* 뷰 모드에 따라 다른 컴포넌트 렌더링 */}
      {listViewMode === 'list' ? (
        <div className="roadmap-list-container">
          {categories.map((category, index) => (
            <div key={category.id} className="category-section">
              <div className="category-header" onClick={() => {}}>
                <h2 className="category-title">{category.title}</h2>
                <div className="category-description">{category.description}</div>
                <div className="view-all">전체 보기 →</div>
              </div>
              
              <div className="roadmaps-grid">
                {getRoadmapsForCategory(category.id).map((roadmap) => {
                  const hasThumbnail = roadmap.data.thumbnail && roadmap.data.thumbnail.trim() !== '';
                  
                  return (
                    <div 
                      key={roadmap.id} 
                      className={`roadmap-card ${roadmap.data.featured ? 'featured' : ''} ${!hasThumbnail ? 'no-thumbnail' : ''}`}
                      onClick={() => handleRoadmapClick(category.id, roadmap.id)}
                    >
                      {hasThumbnail && (
                        <div className="roadmap-thumbnail">
                          <img 
                            src={roadmap.data.thumbnail} 
                            alt={roadmap.data.title} 
                            onError={(e) => {
                              // 이미지 로드 실패 시 부모 요소(thumbnail div)를 숨김
                              const target = e.target as HTMLImageElement;
                              if (target.parentElement) {
                                target.parentElement.style.display = 'none';
                              }
                              // 카드에 no-thumbnail 클래스 추가
                              const card = target.closest('.roadmap-card');
                              if (card) {
                                card.classList.add('no-thumbnail');
                              }
                            }}
                          />
                        </div>
                      )}
                      <div className="roadmap-info">
                        <h3 className="roadmap-title">{roadmap.data.title}</h3>
                        <p className="roadmap-description">{roadmap.data.description}</p>
                        <div className="roadmap-badges">
                          {roadmap.data.featured && <span className="featured-badge">추천</span>}
                          {roadmap.data.level && <span className={`level-badge level-${roadmap.data.level}`}>{roadmap.data.level}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ReactFlowProvider>
          <RoadmapFlowView 
            nodes={nodes} 
            edges={edges} 
            onNodeClick={handleNodeClick} 
            resetView={() => {}}
          />
        </ReactFlowProvider>
      )}
      
      <style jsx global>{`
        /* 설정 버튼 스타일 */
        .settings-button-panel {
          margin: 15px;
          z-index: 5;
        }
        
        .settings-toggle-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          font-size: 0.95rem;
        }
        
        .settings-toggle-button:hover {
          background-color: var(--vscode-button-hoverBackground);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .settings-icon {
          font-size: 1.2rem;
        }
        
        .settings-text {
          font-weight: 500;
        }
        
        /* 설정 패널 스타일 */
        .settings-panel {
          position: absolute;
          top: 15px;
          right: 15px;
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          z-index: 9000;
          width: 320px;
          transform: translateX(110%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
        }
        
        .settings-panel.open {
          transform: translateX(0);
          opacity: 1;
          pointer-events: all;
        }
        
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          border-bottom: 1px solid var(--vscode-panel-border);
          background-color: var(--vscode-tab-activeBackground);
        }
        
        .settings-title {
          margin: 0;
          font-size: 1.1rem;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--vscode-editor-foreground);
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        
        .close-button:hover {
          background-color: var(--vscode-list-hoverBackground);
        }
        
        .settings-tabs {
          display: flex;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .tab-button {
          flex: 1;
          background: none;
          border: none;
          padding: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--vscode-editor-foreground);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          transition: background-color 0.2s;
        }
        
        .tab-button:hover {
          background-color: var(--vscode-list-hoverBackground);
        }
        
        .tab-button.active {
          color: var(--vscode-textLink-activeForeground);
          border-bottom: 2px solid var(--vscode-textLink-activeForeground);
          font-weight: bold;
        }
        
        .tab-icon {
          font-size: 1.2rem;
        }
        
        .settings-content {
          padding: 15px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .settings-subtitle {
          font-size: 1rem;
          margin-top: 0;
          margin-bottom: 10px;
          color: var(--vscode-editor-foreground);
          border-bottom: 1px solid var(--vscode-panel-border);
          padding-bottom: 5px;
        }
        
        /* 레이아웃 패널 스타일 */
        .layout-panel {
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 10px;
          padding: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10;
          margin: 15px;
          max-width: 280px;
        }
        
        .layout-title {
          font-size: 1rem;
          margin-bottom: 10px;
          text-align: center;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .layout-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .layout-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-size: 0.95rem;
        }
        
        .layout-button:hover {
          background-color: var(--vscode-button-hoverBackground);
          transform: translateX(2px);
        }
        
        .layout-button.active {
          background-color: var(--vscode-textLink-activeForeground);
          font-weight: bold;
          transform: scale(1.02);
        }
        
        .layout-icon {
          font-size: 1.2rem;
          min-width: 20px;
          text-align: center;
        }
        
        /* 컨트롤 버튼 스타일 */
        .control-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .control-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-size: 0.95rem;
        }
        
        .control-button:hover {
          background-color: var(--vscode-button-hoverBackground);
          transform: translateX(2px);
        }
        
        .control-icon {
          font-size: 1.2rem;
          min-width: 20px;
          text-align: center;
        }
        
        /* 가이드, 범례 아이템 스타일 */
        .guide-item, .legend-item {
          display: flex;
          align-items: center;
          margin: 10px 0;
          font-size: 0.9rem;
        }
        
        .guide-icon {
          margin-right: 10px;
          font-size: 1.1rem;
          min-width: 24px;
          text-align: center;
        }
        
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          margin-right: 10px;
        }
        
        /* 플로우 노드 스타일 추가 */
        .react-flow__node-default {
          width: auto !important;
          max-width: 160px !important;
          min-width: 120px !important;
          height: auto !important;
          min-height: 40px !important;
          padding: 10px !important;
          border: 1px solid var(--vscode-panel-border) !important;
          border-radius: 6px !important;
        }
        
        .multi-line-node {
          overflow: visible !important;
          border-color: var(--vscode-panel-border) !important;
        }
        
        .multi-line-node .react-flow__node-label,
        .multi-line-node .react-flow__node-description,
        .react-flow__node-default .react-flow__node-label,
        .react-flow__node-default .react-flow__node-description {
          white-space: normal !important;
          overflow: visible !important;
          font-size: 0.9rem !important;
          max-width: 100% !important;
          display: block !important;
          text-align: center !important;
        }
      `}</style>
      <style jsx>{`
        /* 카테고리 섹션 스타일 */
        .roadmap-list-container {
          padding: 20px;
        }
        
        .category-section {
          margin-bottom: 40px;
          background-color: var(--vscode-editor-background);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--vscode-panel-border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .category-header {
          padding: 20px;
          background-color: var(--vscode-tab-activeBackground);
          border-bottom: 1px solid var(--vscode-panel-border);
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .category-header:hover {
          background-color: var(--vscode-list-hoverBackground);
        }
        
        .category-title {
          font-size: 1.5rem;
          margin: 0 0 10px 0;
          color: var(--vscode-editor-foreground);
        }
        
        .category-description {
          color: var(--vscode-descriptionForeground);
          margin-bottom: 10px;
        }
        
        .view-all {
          color: var(--vscode-textLink-activeForeground);
          font-weight: 500;
          margin-top: 10px;
          display: inline-block;
        }
        
        .roadmaps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        
        .roadmap-card {
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        /* 썸네일이 없는 경우를 위한 스타일 */
        .roadmap-card.no-thumbnail .roadmap-info {
          padding: 20px;
        }
        
        .roadmap-card.no-thumbnail .roadmap-title {
          font-size: 1.2rem;
          margin-bottom: 12px;
        }
        
        .roadmap-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }
        
        .roadmap-thumbnail {
          height: 150px;
          overflow: hidden;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .roadmap-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .roadmap-info {
          padding: 15px;
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .roadmap-card.no-thumbnail .roadmap-info {
          padding: 20px;
        }
        
        .roadmap-title {
          font-size: 1.1rem;
          margin: 0 0 10px 0;
          color: var(--vscode-editor-foreground);
        }
        
        .roadmap-description {
          color: var(--vscode-descriptionForeground);
          font-size: 0.9rem;
          margin: 0 0 15px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        
        .roadmap-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: auto;
        }
        
        .featured-badge {
          display: inline-block;
          background-color: var(--vscode-terminal-ansiYellow);
          color: var(--vscode-editor-background);
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: bold;
        }
        
        .level-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: bold;
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
      `}</style>
    </div>
  );
};

export default RoadmapListView; 