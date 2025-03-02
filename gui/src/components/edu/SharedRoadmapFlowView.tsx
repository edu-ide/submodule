import React, { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  ConnectionLineType,
  Panel,
  ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './roadmap/CustomNode';

interface SharedRoadmapFlowProps {
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeClick: (event: React.MouseEvent, node: any) => void;
  onInit?: (instance: any) => void;
  flowRef?: React.RefObject<any>;
  resetView?: () => void;
  renderLegend?: () => React.ReactNode;
  renderGuide?: () => React.ReactNode;
  renderExtraControls?: () => React.ReactNode;
  showStatistics?: boolean;
  hideControls?: boolean;
}

const SharedRoadmapFlowView: React.FC<SharedRoadmapFlowProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onInit,
  flowRef,
  resetView,
  renderLegend,
  renderGuide,
  renderExtraControls,
  showStatistics = false,
  hideControls = false
}) => {
  // 노드 타입 정의
  const nodeTypes = {
    custom: CustomNode,
  };

  // 초기화 시 통계 출력만 수행 (자동 뷰 조정 제거)
  const handleInit = useCallback((instance) => {
    if (onInit) {
      onInit(instance);
    }
    
    // 노드 및 엣지 통계 출력
    if (showStatistics) {
      console.log(`로드맵 플로우 초기화: 노드 ${nodes.length}개, 엣지 ${edges.length}개`);
    }
    
    // 자동 뷰 조정 코드 제거됨
  }, [nodes, edges, onInit, showStatistics]);
  
  // 노드나 엣지가 변경될 때 자동 뷰 조정 useEffect 제거됨

  return (
    <div className="flow-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        fitView={false}
        fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Panel position="top-right" className="roadmap-panel">
          <div className="roadmap-controls">
            {showStatistics && (
              <div className="flow-stats">
                노드: {nodes.length} | 엣지: {edges.length}
              </div>
            )}
            {resetView && (
              <button onClick={resetView} className="reset-button">
                <span className="reset-icon">🔄</span> 뷰 리셋
              </button>
            )}
            {renderExtraControls && renderExtraControls()}
          </div>
        </Panel>
        
        <Background gap={20} size={1.5} />
      </ReactFlow>
      
      {renderLegend && renderLegend()}
      {renderGuide && renderGuide()}
      
      {/* 여기에 공통 스타일 포함 */}
      <style jsx>{`
        .flow-container {
          height: 700px;
          width: 100%;
          border: 1px solid var(--vscode-panel-border);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        
        .roadmap-panel {
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          margin: 10px;
          padding: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* 그림자 제거를 위한 스타일 */
        :global(.react-flow__edge-path) {
          filter: none !important;
          box-shadow: none !important;
          stroke-opacity: 1 !important;
          shape-rendering: geometricPrecision !important;
        }
        
        :global(.react-flow__edge) {
          filter: none !important;
          box-shadow: none !important;
        }
        
        :global(.react-flow__renderer svg) {
          filter: none !important;
        }
        
        /* 여기에 나머지 공통 스타일 추가 */
      `}</style>
    </div>
  );
};

export default SharedRoadmapFlowView;
