import { ReactNode } from 'react';

// 로드맵 데이터 타입
export interface RoadmapData {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

// 로드맵 노드 타입
export interface RoadmapNode {
  id: string;
  type?: string;
  data?: {
    title?: string;
    description?: string;
    status?: string;
    order?: string;
    column?: string;
    content_file?: string;
    level?: string;
    category?: string | string[];
    thumbnail?: string;
    featured?: boolean;
    [key: string]: any;
  };
}

// 로드맵 엣지 타입
export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: any;
}

// 로드맵 뷰 프롭스
export interface RoadmapViewProps {
  roadmapId?: string;
  onBack?: () => void;
  parentCategoryId?: string;
}

// 노드 데이터 타입
export type NodeData = {
  title: string;
  description: string;
  status: string;
  label: ReactNode;
  order?: string;
  column?: string | number;
  content_file?: string;
  type?: string | undefined;
  prerequisites?: string[];
  next?: string[];
  category?: string;
  thumbnail?: string;
  featured?: boolean;
  level?: string;
};

// 레이아웃 로드맵 노드
export interface LayoutRoadmapNode {
  id: string;
  type: string;
  data: {
    title: string;
    description: string;
    status: string;
    order: string;
    column: string;
    level: string;
    category: string;
    content_file: string;
    thumbnail: string;
    featured: boolean;
    prerequisites: string[];
    next: string[];
  };
}

// 진행 상태 타입
export interface ProgressStatus {
  completed: number;
  total: number;
  percentage: number;
}

// 카테고리 타입
export interface Category {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  order: string;
}

// 카테고리 로드맵 데이터
export interface CategoryRoadmapData {
  categories: Category[];
  nodes: any[];
} 