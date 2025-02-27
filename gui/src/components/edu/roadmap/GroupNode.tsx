import React, { memo } from 'react';
import { NodePropsType } from './types';

interface GroupData extends Record<string, unknown> {
  title: string;
  color: string;
}

const GroupNode = memo((props: NodePropsType) => {
  const data = props.data as any;
  
  return (
    <div className="group-node" style={{ borderColor: data.color }}>
      <div className="group-title" style={{ backgroundColor: data.color }}>
        {data.title}
      </div>
      
      <style jsx>{`
        .group-node {
          border: 2px dashed;
          border-radius: 8px;
          background-color: rgba(255, 255, 255, 0.5);
          pointer-events: none;
        }
        
        .group-title {
          position: absolute;
          top: -10px;
          left: 10px;
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }
      `}</style>
    </div>
  );
});

export default GroupNode; 