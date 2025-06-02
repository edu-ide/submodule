// 로드맵 데이터 타입
import { RoadmapCategory } from '../components/edu/types';

export interface RoadmapData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: RoadmapCategory;
  isNew?: boolean;
  progress?: number;
  lastUpdated?: string;
}

// 역할 기반 로드맵
export const roleBadedRoadmaps: RoadmapData[] = [
  {
    id: 'frontend',
    title: '프론트엔드 개발자',
    description: '웹 프론트엔드 개발을 위한 학습 경로',
    difficulty: 'intermediate',
    category: 'role',
    progress: 0
  },
  {
    id: 'python',
    title: '파이썬 개발자',
    description: '파이썬 프로그래밍 기초부터 고급까지',
    difficulty: 'beginner',
    category: 'role',
    progress: 20
  }
];

// 스킬 기반 로드맵
export const skillBasedRoadmaps: RoadmapData[] = [
  {
    id: 'javascript',
    title: '자바스크립트 마스터',
    description: '자바스크립트 기초 및 고급 학습',
    difficulty: 'intermediate',
    category: 'skill'
  }
];

// 나머지 로드맵 카테고리
export const foundationRoadmaps: RoadmapData[] = [];
export const applicationAreaRoadmaps: RoadmapData[] = [];
export const methodologyRoadmaps: RoadmapData[] = [];
export const projectRoadmaps: RoadmapData[] = []; 