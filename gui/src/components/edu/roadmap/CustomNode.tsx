import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

const { Top, Bottom, Left, Right } = Position;

// Node 데이터 인터페이스
interface NodeData {
  label?: string;
  name?: string;
  description?: string;
  status?: string;
  direction?: string;
  isRoot?: boolean;
  isSpouse?: boolean;
  isSibling?: boolean;
  hasChildren?: boolean;
  hasSiblings?: boolean;
  hasSpouses?: boolean;
}

const CustomNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as NodeData;
  const { 
    direction, isRoot, label, name, description, 
    status, hasChildren, hasSiblings, hasSpouses,
    isSpouse, isSibling
  } = nodeData;
  
  // 방향 설정
  const isTreeHorizontal = direction === 'LR';
  
  // 타겟 포지션 계산
  const getTargetPosition = () => {
    if (isSpouse) {
      return isTreeHorizontal ? Top : Left;
    } else if (isSibling) {
      return isTreeHorizontal ? Bottom : Right;
    }
    return isTreeHorizontal ? Left : Top;
  };
  
  // 상태에 따른 스타일
  let statusColor = '#9ca3af'; // 기본 회색
  if (status === 'completed') statusColor = '#10b981'; // 완료 - 녹색
  else if (status === 'in-progress') statusColor = '#3b82f6'; // 진행 중 - 파란색
  else if (status === 'not-started') statusColor = '#8b5cf6'; // 시작 안함 - 보라색
  else if (isSpouse) statusColor = '#f59e0b'; // 배우자 - 주황색
  else if (isSibling) statusColor = '#8b5cf6'; // 형제 - 보라색
  
  return (
    <div className="custom-node" style={{
      background: '#ffffff',
      border: `2px solid ${statusColor}`,
      borderRadius: '8px',
      padding: '10px',
      minWidth: '150px',
      position: 'relative',
      zIndex: 1
    }}>
      {/* 자식 노드를 위한 핸들 */}
      {hasChildren && (
        <Handle
          type="source"
          position={isTreeHorizontal ? Right : Bottom}
          id={isTreeHorizontal ? Right : Bottom}
          style={{ background: '#10b981', zIndex: 10 }}
        />
      )}
      
      {/* 배우자 노드를 위한 핸들 */}
      {hasSpouses && (
        <Handle
          type="source"
          position={isTreeHorizontal ? Bottom : Right}
          id={isTreeHorizontal ? Bottom : Right}
          style={{ background: '#f59e0b' }}
        />
      )}
      
      {/* 형제 노드를 위한 핸들 */}
      {hasSiblings && (
        <Handle
          type="source"
          position={isTreeHorizontal ? Top : Left}
          id={isTreeHorizontal ? Top : Left}
          style={{ background: '#8b5cf6' }}
        />
      )}
      
      {/* 타겟 핸들 */}
      {!isRoot && (
        <Handle
          type="target"
          position={getTargetPosition()}
          id={getTargetPosition()}
          style={{ background: statusColor }}
        />
      )}
      
      {/* 노드 콘텐츠 */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        padding: '5px'
      }}>
        <div style={{ 
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
          marginBottom: '5px'
        }}>
          {name || label || id}
        </div>
        {description && (
          <div style={{ 
            fontSize: '12px',
            color: '#666666'
          }}>
            {description}
          </div>
        )}
        {isSpouse && <div className="node-tag spouse-tag">배우자</div>}
        {isSibling && <div className="node-tag sibling-tag">형제</div>}
      </div>
      
      <style jsx>{`
        .custom-node {
          background: var(--vscode-editor-background, #ffffff);
          border-radius: 8px;
          padding: 10px;
          min-width: 150px;
          position: relative;
          z-index: 1;
          border: 2px solid ${statusColor || '#ccc'};
        }
        
        .node-content {
          display: flex;
          flex-direction: column;
          padding: 5px;
        }
        
        .node-title {
          font-weight: bold;
          font-size: 14px;
          color: var(--vscode-editor-foreground, #000000);
          margin-bottom: 5px;
        }
        
        .node-description {
          font-size: 12px;
          color: var(--vscode-descriptionForeground, #666666);
        }
        
        .node-tag {
          font-size: 10px;
          font-weight: bold;
          padding: 2px 4px;
          border-radius: 4px;
          margin-top: 5px;
          align-self: flex-start;
        }
        
        .spouse-tag {
          background: #f59e0b20;
          color: #f59e0b;
        }
        
        .sibling-tag {
          background: #8b5cf620;
          color: #8b5cf6;
        }
      `}</style>
    </div>
  );
});

export default CustomNode; 