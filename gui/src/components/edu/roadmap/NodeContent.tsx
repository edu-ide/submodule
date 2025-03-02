import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// 타입 명시적 정의
interface NodeDataType {
  name?: string;
  label?: string;
  title?: string;
  description?: string;
  status?: string;
  direction?: string;
  isRoot?: boolean;
  isMainNode?: boolean;
  hasChildren?: boolean;
}

// 디버깅 추가
const NodeContent = memo(({ data, id }: NodeProps) => {
  // 데이터 타입 단언
  const nodeData = data as NodeDataType;
  console.log('NodeContent rendering with data:', nodeData);

  // 방향 설정
  const isHorizontal = nodeData?.direction === 'LR';
  
  // 상태 색상 설정
  let borderColor = '#9ca3af'; // 기본 회색
  if (nodeData?.status === 'completed') borderColor = '#10b981'; // 완료 - 녹색
  else if (nodeData?.status === 'in-progress') borderColor = '#3b82f6'; // 진행 중 - 파란색
  else if (nodeData?.status === 'not-started') borderColor = '#8b5cf6'; // 시작 안함 - 보라색
  
  // 메인 노드 여부
  const isMain = nodeData?.isMainNode;
  
  // hover 스타일 추가
  const [isHovered, setIsHovered] = useState(false);
  
  // 메인 노드 스타일
  const mainNodeStyle = {
    background: '#f0f9ff',
    border: `3px solid #0284c7`,
    borderRadius: '8px',
    padding: '12px',
    minWidth: '180px',
    fontWeight: 'bold',
    fontSize: '16px',
    boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
    position: 'relative' as 'relative',
    zIndex: 2,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };
  
  // 일반 노드 스타일
  const subNodeStyle = {
    background: 'white',
    border: `2px solid ${borderColor}`,
    borderRadius: '8px',
    padding: '10px',
    minWidth: '150px',
    position: 'relative' as 'relative',
    zIndex: 1
  };
  
  // 타겟/소스 핸들 위치 계산
  const sourcePos = isHorizontal ? Position.Right : Position.Bottom;
  const targetPos = isHorizontal ? Position.Left : Position.Top;
  
  // 핸들 스타일
  const handleStyle = {
    background: isMain ? '#0284c7' : borderColor,
    width: isMain ? '10px' : '8px',
    height: isMain ? '10px' : '8px',
    border: '2px solid white'
  };
  
  return (
    <div 
      style={isMain ? mainNodeStyle : subNodeStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 타겟 핸들 - 들어오는 연결 */}
      {!nodeData?.isRoot && (
        <Handle
          type="target"
          position={targetPos}
          id={`target-${targetPos}`}
          style={handleStyle}
        />
      )}
      
      {/* 노드 내용 */}
      <div style={{ 
        fontWeight: isMain ? 'bold' : 'normal',
        fontSize: isMain ? '16px' : '14px',
        textAlign: isMain ? 'center' : 'left',
        marginBottom: '5px' 
      }}>
        {nodeData?.name || nodeData?.label || nodeData?.title || id}
      </div>
      
      {/* 설명은 메인 노드가 아닐 때만 표시 */}
      {!isMain && nodeData?.description && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {String(nodeData.description)}
        </div>
      )}
      
      {/* 소스 핸들 - 나가는 연결 (하위 노드가 있는 경우에만) */}
      {(nodeData?.hasChildren || !isMain) && (
        <Handle
          type="source"
          position={sourcePos}
          id={`source-${sourcePos}`}
          style={handleStyle}
        />
      )}
    </div>
  );
});

export default NodeContent; 