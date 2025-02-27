export interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: CurriculumStep[];
  duration: string;
}

export interface CodingTask {
  description: string;
  requirements: string[];
  initialFiles?: { [path: string]: string };  // 초기 파일 내용
  expectedFiles: string[];  // 제출해야 할 파일 목록
}

export interface CurriculumStep {
  title: string;
  content: string;
  completed?: boolean;
  evaluation?: {
    timeLimit: number;
    questions: Array<{
      id: string;
      type: string;
      question: string;
      options?: string[];
      correctAnswer?: string;
    }>;
  };
  codingTask?: {
    description: string;
    requirements: string[];
    initialFiles: Record<string, string>;
    expectedFiles: string[];
  };
  codeSnippets?: Array<{
    code: string;
    language?: string;
  }>;
  duration: string; // 각 단계별 소요 시간
}

export interface CurriculumState {
  selectedId: string | null;
  currentStepIndex: number;
  items: CurriculumItem[];
  evaluationState?: {
    isStarted: boolean;
    remainingTime: number;
    submittedFiles?: { [path: string]: string };
    answers?: { [questionId: string]: string };
    feedback?: {
      score: number;
      comments: string[];
      suggestions: string[];
    };
  };
}

export type HistorySource = 'continue' | 'perplexity' | 'education';
