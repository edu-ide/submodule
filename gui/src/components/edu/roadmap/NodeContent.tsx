import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeData, NodePropsType } from '../types';

const NodeContent = memo((props: NodePropsType) => {
  const data = props.data as NodeData;
  const { handles = { top: false, left: false, right: false, bottom: false, 'left-out': false, 'right-out': false } } = data;
  
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
          background: '#f3f4f6',
          borderColor: '#94a3b8'
        };
    }
  };
  
  const styles = getNodeStyle();
  const isOptional = data.isOptional || false;
  
  return (
    <div style={{
      border: `2px solid ${styles.borderColor}`,
      borderRadius: '8px',
      padding: '0px 10px 10px 10px',
      backgroundColor: styles.background,
      color: '#1f2937',
      width: 160,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'relative'
    }}>
      {/* 핸들 연결 지점 */}
      {handles.top && <Handle type="target" position={Position.Top} style={{ background: styles.borderColor }} />}
      {handles.bottom && <Handle type="source" position={Position.Bottom} style={{ background: styles.borderColor }} />}
      {handles.left && <Handle type="target" position={Position.Left} style={{ background: styles.borderColor }} />}
      {handles.right && <Handle type="source" position={Position.Right} style={{ background: styles.borderColor }} />}
      {handles['left-out'] && <Handle type="source" position={Position.Left} id="left-out" style={{ background: styles.borderColor, top: '70%' }} />}
      {handles['right-out'] && <Handle type="source" position={Position.Right} id="right-out" style={{ background: styles.borderColor, top: '70%' }} />}
      
      {/* 상태 표시 - 위치 조정 및 마진 감소 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '3px',
        position: 'absolute',
        top: '6px',
        right: '10px',
        left: '10px'
      }}>
        <div style={{ 
          width: '8px', height: '8px', 
          borderRadius: '50%', 
          backgroundColor: data.status === 'completed' ? '#10b981' : data.status === 'in-progress' ? '#3b82f6' : '#9ca3af',
        }} />
        {isOptional && <span style={{ padding: '0 4px', fontSize: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>선택</span>}
      </div>
      
      {/* 제목만 표시 - 위치 조정 */}
      <div style={{ 
        fontWeight: 600, 
        fontSize: '13px', 
        textAlign: 'center',
        marginTop: '12px'
      }}>
        {data.title}
      </div>
    </div>
  );
});

export default NodeContent; 