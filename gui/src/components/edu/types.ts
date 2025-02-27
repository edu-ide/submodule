// 로드맵 카테고리 타입 정의
export type RoadmapCategory = 
  // 기본 관점
  'role' | 'skill' | 'foundation' |
  // 응용 관점
  'application-area' | 'methodology' | 'project' |
  // 학습자 관점
  'learner-level' | 'goal' | 'learning-style' | 'time-investment';

// 로드맵 모드 타입 정의
export type RoadmapMode = 'browse' | 'generate' | 'recommended';

// RoadmapView 컴포넌트 속성 타입
export interface RoadmapViewProps {
  roadmapId: string;
  onBack: () => void;
}

// 학습 콘텐츠 뷰 속성 타입
export interface LearningContentViewProps {
  content: any;
  nodeData: any;
  onBack: () => void;
}

// 노드 데이터 타입
export interface NodeData {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  column: string;
  handles?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    'left-out'?: boolean;
    'right-out'?: boolean;
  };
  isOptional?: boolean;
  requiresSkill?: string[];
}

// 노드 속성 타입
export type NodePropsType = any; 