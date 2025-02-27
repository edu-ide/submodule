import React, { memo } from 'react';
import { NodePropsType } from '../types';

const GroupNode = memo((props: NodePropsType) => {
  const data = props.data as any;
  
  return (
    <div style={{ 
      border: `2px dashed ${data.color}`, 
      borderRadius: '12px',
      backgroundColor: `${data.color}15`,  // 투명도 증가 (더 밝게)
      width: '100%',
      height: '100%',
      position: 'relative',
      zIndex: -1,
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '-12px', 
        left: '20px', 
        padding: '3px 12px',
        borderRadius: '4px', 
        fontSize: '13px', 
        fontWeight: 600, 
        color: 'white',  // 항상 흰색 텍스트
        backgroundColor: data.color,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }}>
        {data.title}
      </div>
    </div>
  );
});

export default GroupNode; 