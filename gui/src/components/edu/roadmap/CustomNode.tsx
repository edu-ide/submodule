import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// Node 데이터 인터페이스
interface CustomNodeData {
  isSpouse?: boolean;
  isSibling?: boolean;
  direction?: string;
  isRoot?: boolean;
  hasChildren?: boolean;
  hasSiblings?: boolean;
  hasSpouses?: boolean;
  children?: any[];
  siblings?: any[];
  spouses?: any[];
  name?: string;
  label?: string;
  description?: string;
  level?: string;
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    headerColor?: string;
    iconEmoji?: string;
    border?: string;
  };
  [key: string]: any; // 인덱스 시그니처 추가
}

// NodeProps를 확장하는 대신 필요한 타입만 정의
interface CustomNodeProps {
  data: CustomNodeData;
  id: string;
  selected?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

const CustomNode = memo(({ data, id, selected, onClick }: CustomNodeProps) => {
  // 방향 설정
  const isHorizontal = data.direction === 'LR';
  
  // 노드 스타일 설정
  const nodeStyle = {
    backgroundColor: data.style?.backgroundColor || 'rgba(255, 255, 255, 0.9)',
    border: data.style?.border || `2px solid ${data.style?.borderColor || '#ccc'}`,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 220,
    boxShadow: selected ? '0 0 15px #3b82f6' : '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s, transform 0.2s',
    transform: selected ? 'scale(1.02)' : 'scale(1)',
    cursor: 'pointer'
  };

  // 핸들 스타일
  const handleStyle = {
    background: '#60a5fa',
    width: 8,
    height: 8,
    opacity: 0.9,
    border: '2px solid white'
  };

  return (
    <div style={nodeStyle} onClick={onClick} className="roadmap-node">
      {/* 왼쪽 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={handleStyle}
      />
      
      {/* 오른쪽 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={handleStyle}
      />
      
      {/* 상단 핸들 */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={handleStyle}
      />
      
      {/* 하단 핸들 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={handleStyle}
      />

      {/* 노드 내용 */}
      <div className="flow-node-content">
        <div 
          className="flow-node-header" 
          style={{
            backgroundColor: data.style?.headerColor || '#3b82f6',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            color: 'white'
          }}
        >
          <span className="level-icon">{data.style?.iconEmoji || '📚'}</span>
          <span className="level-text">{data.level || '기본'}</span>
        </div>
        <div 
          className="flow-node-title"
          style={{
            padding: '12px 16px 8px',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          {data.name || data.label}
        </div>
        <div 
          className="flow-node-description"
          style={{
            padding: '0 16px 12px',
            fontSize: '0.85rem',
            color: 'var(--vscode-descriptionForeground)',
            lineHeight: 1.4
          }}
        >
          {data.description}
        </div>
      </div>
    </div>
  );
});

export default CustomNode; 