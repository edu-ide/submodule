import React, { useState, useEffect } from 'react';
import { EdgeProps, getBezierPath, Position } from '@xyflow/react';

interface CustomEdgeProps extends EdgeProps {
  hoverStyle?: any;
  animated?: boolean;
}

export const EdgeWithInteractions: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  sourcePosition = Position.Right,
  targetX,
  targetY,
  targetPosition = Position.Left,
  style = {},
  hoverStyle = {},
  data,
  animated = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 컴포넌트 마운트 시 로깅 추가
  useEffect(() => {
    console.log(`엣지 렌더링: ${id}, 소스: (${sourceX},${sourceY}), 타겟: (${targetX},${targetY})`);
  }, [id, sourceX, sourceY, targetX, targetY]);

  // 에지 경로 생성 - 기본 포지션 지정
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition || Position.Right,
    targetX,
    targetY,
    targetPosition: targetPosition || Position.Left,
    curvature: 0.25 // 곡률 낮추기
  });

  // 기본 스타일 설정 - 더 두껍고 명확하게
  const defaultStyle = {
    stroke: '#4a8af4', // 더 밝은 파란색
    strokeWidth: 2.5,   // 두께 증가
    transition: 'all 0.2s ease',
    opacity: 1,        // 완전 불투명
    zIndex: 100        // 높은 z-index로 항상 표시
  };

  // 호버 시 스타일 설정
  const defaultHoverStyle = {
    stroke: '#ff5500', // 눈에 띄는 주황색
    strokeWidth: 3.5,
    filter: 'drop-shadow(0 0 5px #ff5500)',
    zIndex: 1000,
  };

  // 적용할 스타일 계산
  const appliedStyle = {
    ...defaultStyle,
    ...style,
    ...(isHovered ? { ...defaultHoverStyle, ...hoverStyle } : {}),
  };

  // 마커 ID 생성
  const markerEndId = `arrowhead-${id}`;

  return (
    <>
      {/* 마커 정의 */}
      <defs>
        <marker
          id={markerEndId}
          markerWidth="15"
          markerHeight="15"
          refX="9"  // 조정하여 선과 더 잘 맞도록
          refY="5"
          orient="auto"
        >
          <path
            d="M0,0 L0,10 L10,5 z"  // 화살표 모양 더 크게
            fill={isHovered ? (hoverStyle.stroke || '#ff5500') : (style.stroke || '#4a8af4')}
          />
        </marker>
      </defs>

      {/* 엣지 경로 */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={appliedStyle}
        markerEnd={`url(#${markerEndId})`}
        strokeDasharray={appliedStyle.strokeDasharray || 'none'}
        onClick={() => console.log(`엣지 클릭됨: ${id}`)}
      />

      {/* 애니메이션 효과 */}
      {animated && (
        <path
          d={edgePath}
          opacity={0.6}  // 더 눈에 띄게 불투명도 증가
          style={{
            stroke: appliedStyle.stroke,
            strokeWidth: appliedStyle.strokeWidth * 0.8,
            strokeDasharray: '5,10',
            animation: 'flowAnimation 15s linear infinite', // 애니메이션 속도 증가
            zIndex: appliedStyle.zIndex - 1
          }}
        />
      )}

      {/* 애니메이션을 위한 스타일 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flowAnimation {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -1000;
          }
        }
      `}} />
    </>
  );
}; 