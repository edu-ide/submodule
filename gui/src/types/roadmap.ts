export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category: 'role' | 'skill';
  isNew?: boolean;
  duration?: string;
  steps?: RoadmapStep[];
}

export interface RoadmapStep {
  title: string;
  content: string;
  completed?: boolean;
  duration?: string;
} 