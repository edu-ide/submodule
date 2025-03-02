import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { 
  ReactFlow,
  Controls,
  Background, 
  useNodesState,
  useEdgesState,
  Node as FlowNode,
  ReactFlowInstance,
  Viewport,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { setViewport, setNodePosition, setViewMode } from '../../../../redux/roadmapSlice';
import { setBottomMessage, setHeaderInfo } from '../../../../redux/slices/uiStateSlice';
import { Global } from '@emotion/react';
import { createCategoryFlowLayout, RoadmapNode as LayoutRoadmapNode } from '../../layoutUtils';

// 분리된 컴포넌트 및 유틸리티 임포트
import CustomNode from '../CustomNode';
import SharedRoadmapFlowView from '../../SharedRoadmapFlowView';
import TableOfContentsView from './TableOfContentsView';
import { roadmapStyles } from '../styles/roadmapStyles';
import { applyElkLayout, useLayoutedElements } from '../utils/layoutUtils';
import { convertToLayoutRoadmapNode, enhanceNodesWithEdges, createIdToTitleMapping, calculateProgress } from '../utils/nodeUtils';
import { fetchRoadmapData, fetchRoadmapContent, getRoadmapData } from '../constants';

// 타입 정의 임포트
import { 
  RoadmapViewProps, 
  RoadmapData, 
  RoadmapNode as ImportedRoadmapNode, 
  RoadmapEdge as ImportedRoadmapEdge,
  NodeData,
  CategoryRoadmapData
} from '../types';

// 노드 타입 정의
const nodeTypes = {
  custom: CustomNode,
  roadmapNode: CustomNode,
  groupNode: CustomNode
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
  

  
  // 에지 타입 정의 및 초기화 강화
 
  

  // 가이드 숨기기 핸들러
  const handleHideGuide = useCallback(() => {
    setShowGuide(false);
  }, []);
  
  // ELK 레이아웃 적용 함수
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
    
    applyElkLayout(
      reactFlowInstanceRef.current,
      algorithm,
      direction,
      () => dispatch(setBottomMessage(`레이아웃 적용 완료: ${algorithm}`)),
      (error) => dispatch(setBottomMessage(`레이아웃 적용 실패: ${error.message}`))
    );
  }, [reactFlowInstanceRef, dispatch]);
  
  // 레이아웃 변경 이벤트 리스너 추가
  useEffect(() => {
    const handleLayoutChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { layout } = customEvent.detail;
      
      console.log(`레이아웃 변경 이벤트 수신: ${layout}`);
      
      if (layout === 'horizontal') {
        applyLayout('layered', 'RIGHT');
      } else if (layout === 'vertical') {
        applyLayout('layered', 'DOWN');
      }
    };
    
    const handleStatusToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { show } = customEvent.detail;
      
      console.log(`상태 표시 이벤트 수신: ${show}`);
      setShowStatus(show);
    };
    
    const handleGuideToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { show } = customEvent.detail;
      
      console.log(`가이드 표시 이벤트 수신: ${show}`);
      setShowGuide(show);
    };
    
    // 이벤트 리스너 등록
    window.addEventListener('roadmap-layout-change', handleLayoutChange);
    window.addEventListener('roadmap-status-toggle', handleStatusToggle);
    window.addEventListener('roadmap-guide-toggle', handleGuideToggle);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('roadmap-layout-change', handleLayoutChange);
      window.removeEventListener('roadmap-status-toggle', handleStatusToggle);
      window.removeEventListener('roadmap-guide-toggle', handleGuideToggle);
    };
  }, [applyLayout]);
  
  // 로드맵 정보 가져오기
  useEffect(() => {
    if (!routerRoadmapId) return;
    
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
        // 상대 경로 문제로 인한 임시 해결책
        // 실제 구현에서는 맞는 경로로 수정 필요
        const response = await import('../data/roadmap-categories.json');
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
    console.log('로드맵 데이터 로드:', id);
    dispatch(setBottomMessage(`로드맵 데이터 로드 중: ${id}`));
    
    // 로드된 데이터가 있으면 사용하고, 없으면 state에서 가져옴
    const nodesToUse = loadedNodes ;
    const edgesToUse = loadedEdges ;
    
    // order 정보 확인 로깅 추가
    console.log('로드된 노드의 order 정보:', nodesToUse.map(node => ({
      id: node.id,
      order: node.data?.order,
      title: node.data?.title
    })));
    
    // state의 roadmapNodes와 roadmapEdges 확인
    if (!nodesToUse.length) {
      console.warn('roadmapNodes가 로드되지 않았습니다. 데이터 로드를 기다립니다.');
      dispatch(setBottomMessage(`roadmapNodes가 로드되지 않았습니다. 데이터 로드를 기다립니다. ${id}`));
      return; // 데이터가 로드될 때까지 기다린 후 함수가 다시 호출됩니다.
    }
    
    console.log('로드맵 노드:', nodesToUse.length, '개');
    console.log('로드맵 엣지:', edgesToUse.length, '개');
    
    // ID와 title 간의 매핑 생성
    const { idToTitle, titleToId } = createIdToTitleMapping(nodesToUse);
    
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
      const progress = calculateProgress(enhancedNodes);
      setProgressStatus(progress);
      
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
    } catch (error) {
      console.error('로드맵 레이아웃 생성 오류:', error);
      dispatch(setBottomMessage(`로드맵 레이아웃 생성 오류: ${(error as Error).message}`));
    }
  };
  

  
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
              <button className="back-button" onClick={onBack || handleBack}>
                ← 뒤로 가기
              </button>
              <span className="path-separator">›</span>
              <span className="current-path">{roadmapTitle}</span>
            </>
          )}
        </div>
     
        
        {/* 로드맵 콘텐츠 영역 */}
        <div className="roadmap-content">
          {viewMode === 'flow' ? (
            <div className="flow-view-container">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onInit={onInit}
                nodeTypes={nodeTypes}
                fitView
              >
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          ) : (
            <div className="toc-view-container">
              <TableOfContentsView roadmapContent={roadmapContent} onNodeClick={onNodeClick} />
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

export default RoadmapView; 