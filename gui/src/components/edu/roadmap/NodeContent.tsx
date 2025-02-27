import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface NodeData extends Record<string, unknown> {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  column: string;
}

const NodeContent = (props: NodeProps) => {
  // 타입 캐스팅으로 data에 안전하게 접근
  const data = props.data as NodeData;
  
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
};

export default memo(NodeContent); 