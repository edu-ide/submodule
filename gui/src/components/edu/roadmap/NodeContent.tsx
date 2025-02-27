import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodePropsType, NodeData } from './types';

const NodeContent = memo((props: NodePropsType) => {
  const data = props.data as NodeData;
  const { handles = { top: false, left: false, right: false, bottom: false, 'left-out': false, 'right-out': false } } = data;
  
  // 상태에 따른 배경색과 테두리색 설정
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
    <div className="roadmap-node" style={{ background, borderColor }}>
      <Handle type="target" position={Position.Top} />
      
      <div className="node-content">
        <div className="node-status-indicator" style={{ backgroundColor: borderColor }}></div>
        <div className="node-title">{data.title}</div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
      
      <style jsx>{`
        .roadmap-node {
          padding: 12px;
          border-radius: 6px;
          width: 160px;
          border: 2px solid;
          font-size: 12px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .node-content {
          display: flex;
          align-items: center;
        }
        
        .node-status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
          flex-shrink: 0;
        }
        
        .node-title {
          font-weight: 500;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
});

export default NodeContent; 