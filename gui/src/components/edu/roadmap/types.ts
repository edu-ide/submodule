import { Node as FlowNode, Edge as FlowEdge } from '@xyflow/react';

// 노드 데이터 타입 정의
export interface NodeData {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  column: string;
  isOptional?: boolean;
  requiresSkill?: string[];
  handles?: Record<string, boolean>;
}

// 학습 콘텐츠 데이터 인터페이스
export interface LearningContent {
  title: string;
  introduction: string;
  theory: string;
  examples: Array<{
    title: string;
    code: string;
    explanation: string;
  }>;
  practice: {
    question: string;
    hints: string[];
    solution: string;
  };
  quiz: Array<{
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }>;
  resources: Array<{
    title: string;
    url: string;
    type: 'video' | 'article' | 'tutorial';
  }>;
}

// 노드 프롭스 타입 정의
export interface NodePropsType {
  data: any;
  id: string;
  selected: boolean;
  type?: string;
  [key: string]: any;
}

// 로드맵 뷰 프롭스 타입
export interface RoadmapViewProps {
  roadmapId: string;
  onBack: () => void;
}

// 학습 콘텐츠 뷰 프롭스
export interface LearningContentViewProps {
  content: LearningContent;
  nodeData: NodeData;
  onBack: () => void;
}

// RoadmapNode 타입 정의 수정
export interface RoadmapNode {
  id: string;
  type: string;
  data: {
    title: string;
    description: string;
    status: string;
    column?: string; // 선택적 속성
    content_section?: string; // 섹션 정보 추가
    label?: string; // 라벨 정보 추가
    content_file?: string; // 콘텐츠 파일 정보 추가
    order?: string; // 순서 정보 추가
  };
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  data: {
    type: string;
  };
}

export interface RoadmapData {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
} 