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