/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CurriculumItem } from '../../types/curriculum';
import RoadmapGenerator from './RoadmapGenerator';
import RoadmapView from './RoadmapView';

// API 응답 타입 정의
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string | null;
    error: string | null;
}

// 백엔드 CurriculumDocument 타입 정의
interface CurriculumDocument {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: string;
    students: number;
    progress: number;
    status: string;
    lastUpdated: string;
    source: string;
    sourceId: string;
    type: string;
    uniqueId: string;
    tags: string[];
    steps: {
        title: string;
        content: string;
        completed: boolean;
        codingTask?: {
            prompt: string;
            hint: string;
            initialFiles: {
                name: string;
                content: string;
            }[];
            expectedFiles: string[];
        };
        evaluation?: {
            criteria: string;
            successMessage: string;
            failureMessage: string;
        };
        duration?: string;
    }[];
}

// 로드맵 카테고리 타입 정의 수정 - 최적화된 구조
type RoadmapCategory = 
  // 기본 관점
  'role' | 'skill' | 'foundation' |
  // 응용 관점
  'application-area' | 'methodology' | 'project' |
  // 학습자 관점
  'learner-level' | 'goal' | 'learning-style' | 'time-investment';

// 로드맵 아이템 타입 정의
interface RoadmapItem {
    id: string;
    title: string;
    isNew?: boolean;
    category: RoadmapCategory;
    description?: string;
    difficulty?: string;
    icon?: string;
    progress?: number;      // 진행률
    reviewScore?: number;   // 리뷰 점수 (5점 만점)
    duration?: string;      // 예상 소요 시간
    students?: number;      // 수강 학생 수
    lastUpdated?: string;   // 마지막 업데이트 날짜
    steps?: {
        title: string;
        content: string;
        completed: boolean;
        codingTask?: {
            prompt: string;
            hint: string;
            initialFiles: {
                name: string;
                content: string;
            }[];
            expectedFiles: string[];
        };
        evaluation?: {
            criteria: string;
            successMessage: string;
            failureMessage: string;
        };
        duration?: string;
    }[];
}

interface LeftPanelProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
    items?: CurriculumItem[];
    viewType?: 'curriculum' | 'roadmap';
}

const getProgressColor = (progress: number): string => {
    if (progress === 100) {
        return 'var(--vscode-debugIcon-startForeground)';
    } else if (progress >= 50) {
        return 'var(--vscode-debugIcon-continueForeground)';
    } else if (progress > 0) {
        return 'var(--vscode-charts-orange)';
    }
    return 'var(--vscode-editor-foreground)';
};

// 난이도를 한국어로 변환하는 함수 추가
const getDifficultyText = (difficulty?: string): string => {
    if (!difficulty) return '';
    
    switch (difficulty.toLowerCase()) {
        case 'beginner': return '초급';
        case 'intermediate': return '중급';
        case 'advanced': return '고급';
        default: return difficulty;
    }
};

// 역할 ID를 이름으로 변환하는 도우미 함수
const getRoleName = (roleId: string): string => {
    const roleNames: Record<string, string> = {
        'frontend': '프론트엔드',
        'backend': '백엔드',
        'fullstack': '풀스택',
        'devops': '데브옵스', 
        'ai-engineer': 'AI 엔지니어',
        'data-analyst': '데이터 분석가'
    };
    
    return roleNames[roleId] || roleId;
};

// 역할 기반 로드맵 데이터
const roleBadedRoadmaps: RoadmapItem[] = [
    { 
        id: 'frontend', 
        title: '프론트엔드', 
        category: 'role',
        description: '웹 애플리케이션의 사용자 인터페이스와 상호작용을 개발하는 역할입니다.',
        difficulty: 'intermediate',
        icon: 'browser',
        progress: 65,
        reviewScore: 4.5,
        duration: '3개월',
        students: 1528,
        lastUpdated: '2023-11-15',
        steps: [
            { title: 'HTML/CSS 기초', content: '', completed: true },
            { title: 'JavaScript 기초', content: '', completed: true },
            { title: '프레임워크 학습', content: '', completed: false },
            { title: '상태 관리', content: '', completed: false }
        ]
    },
    { 
        id: 'backend', 
        title: '백엔드', 
        category: 'role',
        description: '서버 측 로직과 데이터베이스 관리를 담당하는 역할입니다.',
        difficulty: 'advanced',
        icon: 'server',
        progress: 40,
        reviewScore: 4.2,
        duration: '4개월',
        students: 1245,
        lastUpdated: '2023-10-20',
        steps: [
            { title: '서버 기초', content: '', completed: true },
            { title: '데이터베이스', content: '', completed: false },
            { title: 'API 개발', content: '', completed: false }
        ]
    },
    { id: 'devops', title: '데브옵스', category: 'role', icon: 'gear' },
    { id: 'fullstack', title: '풀스택', category: 'role', icon: 'layers' },
    { id: 'ai-engineer', title: 'AI 엔지니어', category: 'role', icon: 'circuit-board' },
    { id: 'data-analyst', title: '데이터 분석가', isNew: true, category: 'role', icon: 'graph' },
    { id: 'ai-data-scientist', title: 'AI/데이터 사이언티스트', category: 'role' },
    { id: 'android', title: '안드로이드', category: 'role' },
    { id: 'ios', title: 'iOS', category: 'role' },
    { id: 'postgresql', title: '포스트그레SQL', category: 'role' },
    { id: 'blockchain', title: '블록체인', category: 'role' },
    { id: 'qa', title: '품질 관리', category: 'role' },
    { id: 'software-architect', title: '소프트웨어 아키텍트', category: 'role' },
    { id: 'cyber-security', title: '사이버 보안', category: 'role' },
    { id: 'ux-design', title: 'UX 디자인', category: 'role' },
    { id: 'game-developer', title: '게임 개발자', category: 'role' },
    { id: 'technical-writer', title: '기술 문서 작성자', category: 'role' },
    { id: 'mlops', title: 'MLOps', category: 'role' },
    { id: 'product-manager', title: '제품 관리자', category: 'role' },
    { id: 'engineering-manager', title: '엔지니어링 관리자', category: 'role' },
    { id: 'developer-relations', title: '개발자 관계', isNew: true, category: 'role' },
    { 
        id: 'automation-engineer', 
        title: '자동화 엔지니어', 
        category: 'role',
        description: '업무 프로세스와 시스템을 자동화하는 솔루션을 개발하는 전문가',
        icon: 'debug-step-over',
        isNew: true
    },
];

// 기술 기반 로드맵 데이터
const skillBasedRoadmaps: RoadmapItem[] = [
    { id: 'computer-science', title: '컴퓨터 과학', category: 'skill', icon: 'symbol-class' },
    { id: 'react', title: '리액트', category: 'skill', icon: 'symbol-event' },
    { id: 'vue', title: '뷰', category: 'skill', icon: 'symbol-color' },
    { id: 'angular', title: '앵귤러', category: 'skill', icon: 'symbol-namespace' },
    { id: 'javascript', title: '자바스크립트', category: 'skill' },
    { id: 'nodejs', title: '노드JS', category: 'skill' },
    { id: 'typescript', title: '타입스크립트', category: 'skill' },
    { id: 'python', title: '파이썬', category: 'skill' },
    { id: 'sql', title: 'SQL', category: 'skill' },
    { id: 'system-design', title: '시스템 설계', category: 'skill' },
    { id: 'api-design', title: 'API 설계', category: 'skill' },
    { id: 'aspnet-core', title: 'ASP.NET Core', category: 'skill' },
    { id: 'java', title: '자바', category: 'skill' },
    { id: 'cpp', title: 'C++', category: 'skill' },
    { id: 'flutter', title: '플러터', category: 'skill' },
    { id: 'spring-boot', title: '스프링 부트', category: 'skill' },
    { id: 'go', title: 'Go 로드맵', category: 'skill' },
    { id: 'rust', title: '러스트', category: 'skill' },
    { id: 'graphql', title: 'GraphQL', category: 'skill' },
    { id: 'design-architecture', title: '설계와 아키텍처', category: 'skill' },
    { id: 'design-system', title: '디자인 시스템', category: 'skill' },
    { id: 'react-native', title: '리액트 네이티브', category: 'skill' },
    { id: 'aws', title: 'AWS', category: 'skill' },
    { id: 'code-review', title: '코드 리뷰', category: 'skill' },
    { id: 'docker', title: '도커', category: 'skill' },
    { id: 'kubernetes', title: '쿠버네티스', category: 'skill' },
    { id: 'linux', title: '리눅스', category: 'skill' },
    { id: 'mongodb', title: '몽고DB', category: 'skill' },
    { id: 'prompt-engineering', title: '프롬프트 엔지니어링', category: 'skill' },
    { id: 'terraform', title: '테라폼', category: 'skill' },
    { id: 'data-structures', title: '자료구조와 알고리즘', category: 'skill' },
    { id: 'git-github', title: 'Git과 GitHub', category: 'skill' },
    { id: 'redis', title: '레디스', category: 'skill' },
    { id: 'php', title: 'PHP', isNew: true, category: 'skill' },
    { id: 'cloudflare', title: '클라우드플레어', isNew: true, category: 'skill' },
    { 
        id: 'unity', 
        title: '유니티', 
        category: 'skill',
        description: '인기 있는 크로스 플랫폼 게임 엔진 및 개발 환경',
        icon: 'cube'
    },
    { 
        id: 'unreal-engine', 
        title: '언리얼 엔진', 
        category: 'skill',
        description: '고품질 3D 게임 및 시뮬레이션을 위한 전문 게임 엔진',
        icon: 'lightbulb'
    },
    { 
        id: 'rpa', 
        title: 'RPA (로봇 프로세스 자동화)', 
        category: 'skill',
        description: '반복적인 업무를 자동화하는 소프트웨어 로봇 기술',
        icon: 'run-all',
        isNew: true
    },
];

// 응용 영역(domain + industry 통합) 로드맵 데이터 수정 - 중복 항목 제거
const applicationAreaRoadmaps: RoadmapItem[] = [
    { 
        id: 'automation', 
        title: '자동화', 
        category: 'application-area',
        description: '소프트웨어를 활용한 업무 프로세스 자동화와 로봇 프로세스 자동화(RPA) 기술',
        icon: 'debug-restart',
        difficulty: 'intermediate',
        duration: '2개월',
        reviewScore: 4.6,
        isNew: true
    },
    { 
        id: 'game-development', 
        title: '게임 개발', 
        category: 'application-area',
        description: '다양한 플랫폼용 게임 개발 및 게임 엔진 활용 기술',
        icon: 'layout-centered',
        difficulty: 'advanced',
        duration: '6개월',
        reviewScore: 4.8
    },
    {
        id: 'game-design', 
        title: '게임 디자인', 
        category: 'application-area',
        description: '게임 메커니즘, 레벨 디자인, 사용자 경험 설계에 관한 학습',
        icon: 'preview',
        difficulty: 'intermediate',
        duration: '3개월'
    },
    { 
        id: 'web-dev', 
        title: '웹 개발', 
        category: 'application-area',
        description: '웹 애플리케이션 및 웹사이트 개발을 위한 기술과 도구',
        difficulty: 'intermediate',
        icon: 'globe', 
        steps: [
            { title: '프론트엔드 기초', content: '', completed: true },
            { title: '백엔드 기초', content: '', completed: true },
            { title: '웹 보안', content: '', completed: false }
        ]
    },
    { 
        id: 'mobile-dev', 
        title: '모바일 개발', 
        category: 'application-area',
        description: 'iOS와 Android 앱 개발을 위한 기술과 프레임워크',
        difficulty: 'intermediate',
        icon: 'device-mobile'
    },
    { 
        id: 'ai-ml', 
        title: 'AI & 머신러닝', 
        category: 'application-area',
        description: '인공지능, 머신러닝, 딥러닝 기술 학습',
        difficulty: 'advanced',
        icon: 'brain'
    },
    { 
        id: 'data-science', 
        title: '데이터 사이언스', 
        category: 'application-area',
        icon: 'dashboard'
    },
    { id: 'e-commerce', title: '이커머스', category: 'application-area' },
];

// 학습자 수준(career-level + difficulty 통합) 로드맵 데이터
const learnerLevelRoadmaps: RoadmapItem[] = [
    // 기존 난이도 기반 항목
    { 
        id: 'beginner-friendly', 
        title: '입문자 과정', 
        category: 'learner-level',
        description: '프로그래밍 경험이 없는 사람도 시작할 수 있는 로드맵',
        difficulty: 'beginner',
        icon: 'smiley',
        steps: [
            { title: '프로그래밍 기초 개념', content: '', completed: false },
            { title: '첫 프로그램 작성하기', content: '', completed: false },
            { title: '간단한 프로젝트', content: '', completed: false }
        ]
    },
    { 
        id: 'intermediate-challenge', 
        title: '중급자 과정', 
        category: 'learner-level',
        description: '기본기를 가진 개발자를 위한 심화 과정',
        difficulty: 'intermediate',
        icon: 'thumbsup'
    },
    { 
        id: 'expert-mastery', 
        title: '전문가 과정', 
        category: 'learner-level',
        description: '고급 개념과 복잡한 시스템을 다루는 로드맵',
        difficulty: 'advanced',
        icon: 'star-full'
    },
    
    // 기존 경력 수준 항목
    { 
        id: 'junior-dev', 
        title: '주니어 개발자', 
        category: 'learner-level',
        description: '0-2년 경력 개발자를 위한 로드맵',
        difficulty: 'beginner',
        icon: 'rocket'
    },
    { 
        id: 'mid-level-dev', 
        title: '미드레벨 개발자', 
        category: 'learner-level',
        description: '2-5년 경력 개발자를 위한 로드맵',
        difficulty: 'intermediate',
        icon: 'graph'
    },
    { 
        id: 'senior-dev', 
        title: '시니어 개발자', 
        category: 'learner-level',
        description: '5년 이상 경력 개발자를 위한 로드맵',
        difficulty: 'advanced',
        icon: 'verified'
    }
];

// 프로젝트 유형 기반 로드맵
const projectRoadmaps: RoadmapItem[] = [
    { 
        id: 'ecommerce', 
        title: '이커머스 플랫폼', 
        category: 'project',
        description: '온라인 쇼핑몰 및 마켓플레이스 개발 로드맵',
        difficulty: 'intermediate',
        icon: 'cart'
    },
    { 
        id: 'saas-app', 
        title: 'SaaS 애플리케이션', 
        category: 'project',
        description: '구독 기반 소프트웨어 서비스 개발 로드맵',
        difficulty: 'advanced',
        icon: 'multiple-windows'
    },
    { 
        id: 'social-network', 
        title: '소셜 네트워크', 
        category: 'project',
        description: '소셜 미디어 플랫폼 개발 로드맵',
        difficulty: 'intermediate',
        icon: 'organization'
    },
    { 
        id: 'content-platform', 
        title: '콘텐츠 플랫폼', 
        category: 'project',
        description: '비디오/오디오 스트리밍 플랫폼 개발 로드맵',
        difficulty: 'advanced',
        icon: 'play'
    }
];

// 개발 방법론 기반 로드맵
const methodologyRoadmaps: RoadmapItem[] = [
    { 
        id: 'agile', 
        title: '애자일 개발', 
        category: 'methodology',
        description: '애자일 방법론을 활용한 개발 프로세스 학습',
        difficulty: 'intermediate',
        icon: 'iterations'
    },
    { 
        id: 'tdd', 
        title: '테스트 주도 개발', 
        category: 'methodology',
        description: 'TDD 방식으로 개발하는 방법론 학습',
        difficulty: 'intermediate',
        icon: 'beaker'
    },
    { 
        id: 'devops-ci-cd', 
        title: 'CI/CD 파이프라인', 
        category: 'methodology',
        description: '지속적 통합/배포 방법론 학습',
        difficulty: 'advanced',
        icon: 'sync'
    },
    { 
        id: 'microservices', 
        title: '마이크로서비스', 
        category: 'methodology',
        description: '마이크로서비스 아키텍처 개발 접근법',
        icon: 'split-horizontal'
    },
    { 
        id: 'domain-driven', 
        title: '도메인 주도 설계', 
        category: 'methodology',
        difficulty: 'advanced',
        icon: 'type-hierarchy'
    }
];

// 학습 목표 기반 로드맵
const goalBasedRoadmaps: RoadmapItem[] = [
    { 
        id: 'job-ready', 
        title: '취업 준비', 
        category: 'goal',
        description: '개발자 채용 시장에 빠르게 진입하기 위한 로드맵',
        difficulty: 'beginner',
        icon: 'briefcase',
        steps: [
            { title: '기본 기술 습득', content: '', completed: false },
            { title: '포트폴리오 구성', content: '', completed: false },
            { title: '기술 면접 준비', content: '', completed: false }
        ]
    },
    { 
        id: 'skill-upgrade', 
        title: '역량 강화', 
        category: 'goal',
        description: '기존 기술을 더 심화하거나 새로운 기술을 습득하는 로드맵',
        difficulty: 'intermediate',
        icon: 'graph-line'
    },
    { 
        id: 'certification', 
        title: '자격증 취득', 
        category: 'goal',
        description: 'AWS, Azure, Google Cloud 등 기술 자격증 준비 로드맵',
        difficulty: 'intermediate',
        icon: 'verified'
    },
    { 
        id: 'freelance', 
        title: '프리랜서 준비', 
        category: 'goal',
        description: '독립 개발자/프리랜서로 활동하기 위한 로드맵',
        icon: 'person'
    }
];

// 학습 방식 기반 로드맵
const learningStyleRoadmaps: RoadmapItem[] = [
    { 
        id: 'hands-on', 
        title: '실습 중심 학습', 
        category: 'learning-style',
        description: '실제 프로젝트를 만들며 배우는 방식',
        difficulty: 'beginner',
        icon: 'tools'
    },
    { 
        id: 'theory-first', 
        title: '이론 중심 학습', 
        category: 'learning-style',
        description: '개념과 원리를 먼저 이해하는 방식',
        difficulty: 'intermediate',
        icon: 'book'
    },
    { 
        id: 'challenge-based', 
        title: '도전 과제 기반 학습', 
        category: 'learning-style',
        description: '문제를 해결하며 배우는 방식',
        difficulty: 'intermediate',
        icon: 'puzzle'
    },
    { 
        id: 'peer-learning', 
        title: '동료 학습', 
        category: 'learning-style',
        description: '팀 프로젝트와 코드 리뷰를 통한 학습',
        icon: 'accounts'
    }
];

// 학습 시간 투자 기반 로드맵
const timeInvestmentRoadmaps: RoadmapItem[] = [
    { 
        id: 'quick-path', 
        title: '빠른 학습 경로', 
        category: 'time-investment',
        description: '필수 개념만 집중적으로 학습하는 최소 시간 경로',
        difficulty: 'beginner',
        icon: 'clock'
    },
    { 
        id: 'balanced-path', 
        title: '균형 잡힌 경로', 
        category: 'time-investment',
        description: '이론과 실습의 균형이 잡힌 중간 시간 투자 경로',
        difficulty: 'intermediate',
        icon: 'balance-scale'
    },
    { 
        id: 'deep-path', 
        title: '깊이 있는 경로', 
        category: 'time-investment',
        description: '근본 원리부터 고급 구현까지 철저히 이해하는 장기 투자 경로',
        difficulty: 'advanced',
        icon: 'milestone'
    }
];

// 기초 지식 기반 로드맵
const foundationRoadmaps: RoadmapItem[] = [
    { 
        id: 'computer-science-foundation', 
        title: '컴퓨터 과학 기초', 
        category: 'foundation',
        description: '알고리즘, 자료구조, 운영체제 등 기초 컴퓨터 과학 지식',
        difficulty: 'intermediate',
        icon: 'library'
    },
    { 
        id: 'math-foundation', 
        title: '수학적 기초', 
        category: 'foundation',
        description: '선형대수, 확률, 통계 등 개발자를 위한 필수 수학',
        difficulty: 'intermediate',
        icon: 'symbol-numeric'
    },
    { 
        id: 'software-principles', 
        title: '소프트웨어 원칙', 
        category: 'foundation',
        description: '디자인 패턴, 아키텍처 원칙, 클린 코드 등 영속적인 소프트웨어 개발 원칙',
        difficulty: 'advanced',
        icon: 'checklist'
    },
    { 
        id: 'problem-solving', 
        title: '문제 해결 능력', 
        category: 'foundation',
        description: '분석적 사고와 문제 해결 능력을 키우는 로드맵',
        difficulty: 'intermediate',
        icon: 'lightbulb'
    }
];

// 로드맵 모드 타입 수정
type RoadmapMode = 'browse' | 'generate';

const LeftPanel: React.FC<LeftPanelProps> = ({ selectedId, onSelect, items = [], viewType = 'curriculum' }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [curriculumData, setCurriculumData] = useState<CurriculumDocument[]>([]);
    const [activeRoadmapType, setActiveRoadmapType] = useState<RoadmapCategory>('role');
    const [roadmapMode, setRoadmapMode] = useState<RoadmapMode>('browse');
    const [roadmapFilters, setRoadmapFilters] = useState<any>(null);
    const [roleSelection, setRoleSelection] = useState<string | null>(null);
    const [displayData, setDisplayData] = useState<(RoadmapItem | CurriculumItem | CurriculumDocument)[]>([]);
    const [showRoadmapView, setShowRoadmapView] = useState<boolean>(false);
    const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);

    // 정적 로드맵 기본 필터 정의
    const staticRoadmapFilters = {
        'learner-level': ['beginner'],       // 입문자
        'learning-goal': ['skill-upgrade'],  // 역량 강화
        'learning-style': ['hands-on'],      // 실습 중심
        'time-investment': ['quick-path']    // 빠른 경로(3개월)
    };

    // 현재 표시할 데이터 명확하게 선택
    const getRoadmapDataByType = (type: RoadmapCategory): RoadmapItem[] => {
        console.log(`카테고리 데이터 로드: ${type}`);
        
        switch (type) {
            case 'role':
                return roleBadedRoadmaps;
            case 'skill':
                return skillBasedRoadmaps;
            case 'foundation':
                return foundationRoadmaps;
            case 'application-area':
                return applicationAreaRoadmaps;
            case 'methodology':
                return methodologyRoadmaps;
            case 'project':
                return projectRoadmaps;
            default:
                console.warn(`지원되지 않는 로드맵 유형: ${type}`);
                return [];
        }
    };

    // API를 통해 커리큘럼 데이터 로드 (viewType이 curriculum이고 items가 없을 때만)
    useEffect(() => {
        if (viewType === 'curriculum' && !items) {
            const fetchCurriculum = async () => {
            setLoading(true);
            setError(null);

            try {
                    const response = await axios.get('/api/curriculum');
                    if (response.data.success) {
                        setCurriculumData(response.data.data);
                } else {
                        setError(response.data.message || '데이터 로드 실패');
                }
            } catch (err) {
                    console.error('커리큘럼 로드 오류:', err);
                setError('커리큘럼 목록을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

            fetchCurriculum();
        }
    }, [viewType, items]);

    // 항목 클릭 핸들러
    const handleItemClick = (id: string, item: any) => {
        // 파이썬 로드맵의 경우 특별 처리
        if (id === 'python') {
            alert('파이썬 로드맵은 준비 중입니다. 다른 로드맵을 선택해주세요.');
            return;
        }
        
        setSelectedRoadmap(id);
        setShowRoadmapView(true);
        onSelect(id);
    };

    // 탭 전환 함수 개선
    const changeRoadmapType = (type: RoadmapCategory) => {
        console.log(`카테고리 변경: ${type}`);
        setActiveRoadmapType(type);
        
        // 이전 선택 항목 초기화 (선택적)
        if (selectedId) {
            setTimeout(() => {
                onSelect('');
            }, 50);
        }
    };

    // 뷰 타입에 따라 적절한 데이터를 로드하는 함수 추가
    const loadDisplayData = () => {
        if (viewType === 'roadmap') {
            return getRoadmapDataByType(activeRoadmapType);
        } else if (viewType === 'curriculum') {
            // 커리큘럼 데이터 처리
            if (items && items.length > 0) {
                return items;
            }
            return curriculumData;
        }
        return [];
    };

    // 뷰 타입이나 로드맵 타입 변경 시 데이터 업데이트
    useEffect(() => {
        const data = loadDisplayData();
        console.log(`데이터 로드: ${viewType}, 항목 수: ${data.length}`);
        setDisplayData(data as unknown as (RoadmapItem | CurriculumItem | CurriculumDocument)[]);
    }, [viewType, activeRoadmapType, items, curriculumData]);

    // 로드맵 모드 토글 버튼 UI 수정 - 2개 모드로 통합
    const renderRoadmapModeToggle = () => {
        if (viewType !== 'roadmap') return null;

    return (
            <div className="roadmap-mode-toggle">
                <button 
                    className={`mode-button ${roadmapMode === 'browse' ? 'active' : ''}`}
                    onClick={() => setRoadmapMode('browse')}
                >
                    로드맵 둘러보기
                </button>
                <button 
                    className={`mode-button ${roadmapMode === 'generate' ? 'active' : ''}`}
                    onClick={() => setRoadmapMode('generate')}
                >
                    맞춤 로드맵 만들기
                </button>
            </div>
        );
    };
    
    // 로드맵 생성기 처리 함수
    const handleGenerateRoadmap = (filters: any) => {
        // 필터 기반으로 맞춤형 로드맵 생성 로직
        console.log("로드맵 생성 필터:", filters);
        
        // API 호출 또는 로컬 로직으로 로드맵 생성 처리
        // ...
        
        // 생성된 로드맵 ID로 선택 처리
        onSelect('generated-roadmap-id');
        
        // 브라우즈 모드로 전환
        setRoadmapMode('browse');
    };

    // 추가 아이콘 매핑 정의 (아이콘이 없는 항목용)
    const getIconForItem = (item: any): string => {
        // 이미 아이콘이 있는 경우 그대로 사용
        if (item.icon) return item.icon;
        
        // 카테고리별 기본 아이콘
        const categoryIcons: Record<string, string> = {
            'role': 'person',
            'skill': 'tools',
            'foundation': 'book',
            'application-area': 'globe',
            'methodology': 'organization',
            'project': 'folder-type',
            'learner-level': 'graph',
            'goal': 'target',
            'learning-style': 'pencil',
            'time-investment': 'watch'
        };
        
        // 제목에 따른 특정 기술 아이콘
        if (item.title.includes('Python') || item.title.includes('파이썬')) return 'symbol-namespace';
        if (item.title.includes('Java') || item.title.includes('자바')) return 'coffee';
        if (item.title.includes('React') || item.title.includes('리액트')) return 'react';
        if (item.title.includes('Angular') || item.title.includes('앵귤러')) return 'symbol-event';
        if (item.title.includes('Vue') || item.title.includes('뷰')) return 'symbol-color';
        if (item.title.includes('Node') || item.title.includes('노드')) return 'nodejs';
        if (item.title.includes('Database') || item.title.includes('데이터베이스')) return 'database';
        
        // 카테고리별 기본 아이콘 반환
        return categoryIcons[item.category] || 'symbol-misc';
    };

    // 아이템 렌더링 함수 개선
    const renderItemCard = (item: any, isSelected: boolean, onClick: () => void) => {
        const icon = getIconForItem(item);

                return (
                    <div
                        key={item.id}
                className={`item-card ${isSelected ? 'selected' : ''}`}
                onClick={onClick}
            >
                <div className="card-content">
                    <div className="item-header">
                        <div className="icon-container">
                            <i className={`codicon codicon-${icon}`}></i>
                                </div>
                        <div className="item-title-container">
                            <div className="item-title">
                                {item.title}
                                {item.isNew && <span className="new-badge">신규</span>}
                            </div>
                            {item.lastUpdated && (
                                <div className="item-updated">
                                    <i className="codicon codicon-history"></i>
                                    {new Date(item.lastUpdated).toLocaleDateString('ko-KR', {year: 'numeric', month: 'short', day: 'numeric'})} 업데이트
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {item.description && (
                        <div className="item-description">{item.description}</div>
                    )}
                    
                    <div className="item-meta">
                        {item.difficulty && (
                            <div className="item-badge difficulty">
                                <i className="codicon codicon-dashboard"></i>
                                {getDifficultyText(item.difficulty)}
                            </div>
                        )}
                        
                        {item.duration && (
                            <div className="item-badge duration">
                                <i className="codicon codicon-clock"></i>
                                {item.duration}
                            </div>
                        )}
                        
                        {item.students && (
                            <div className="item-badge students">
                                <i className="codicon codicon-account"></i>
                                {item.students.toLocaleString()}명
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="card-footer">
                    {item.progress !== undefined && (
                        <div className="item-progress-container">
                            <div className="progress-label">
                                <span>진행률</span>
                                <span className="progress-value">{item.progress}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div 
                                    className="progress-bar-fill" 
                                    style={{ 
                                        width: `${item.progress}%`
                                    }}
                                ></div>
                                </div>
                            </div>
                    )}
                    
                    {item.reviewScore !== undefined && (
                        <div className="item-review">
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <i 
                                        key={star}
                                        className={`codicon ${star <= Math.round(item.reviewScore || 0) ? 'codicon-star-full' : 'codicon-star-empty'}`}
                                    ></i>
                                ))}
                        </div>
                            <span className="review-score">
                                {item.reviewScore.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 로딩 UI
    if (loading) {
        return <div className="left-panel-loading">커리큘럼 로딩 중...</div>;
    }

    // 오류 UI
    if (error) {
        return <div className="left-panel-error">{error}</div>;
    }

    return (
        <div className="left-panel">
            {viewType === 'roadmap' && !showRoadmapView && renderRoadmapModeToggle()}
            
            {/* 로드맵 뷰 표시 */}
            {showRoadmapView && selectedRoadmap && (
                <div className="roadmap-view-wrapper">
                    <div className="roadmap-header">
                        <button onClick={() => setShowRoadmapView(false)} className="back-button">
                            <i className="codicon codicon-arrow-left"></i> 돌아가기
                        </button>
                        <h2 className="roadmap-title">{selectedRoadmap} 로드맵</h2>
                    </div>
                    <div className="roadmap-content">
                        <p>로드맵 내용은 곧 제공될 예정입니다.</p>
                        <p>선택된 로드맵: {selectedRoadmap}</p>
                    </div>
                </div>
            )}
            
            {/* 로드맵 둘러보기 모드 - 로드맵 뷰가 표시되지 않을 때만 보여줌 */}
            {viewType === 'roadmap' && roadmapMode === 'browse' && !showRoadmapView && (
                <>
                    {/* 카테고리 선택기 */}
                    <div className="roadmap-type-selector">
                        <div className="group-title">카테고리</div>
                        <div className="type-buttons-grid">
                            {/* 첫 번째 줄 */}
                            <button 
                                className={`type-button ${activeRoadmapType === 'role' ? 'active' : ''}`}
                                onClick={() => changeRoadmapType('role')}
                            >
                                역할 기반
                            </button>
                            <button 
                                className={`type-button ${activeRoadmapType === 'skill' ? 'active' : ''}`}
                                onClick={() => changeRoadmapType('skill')}
                            >
                                기술 기반
                            </button>
                            <button 
                                className={`type-button ${activeRoadmapType === 'foundation' ? 'active' : ''}`}
                                onClick={() => changeRoadmapType('foundation')}
                            >
                                기초 지식
                            </button>
                            
                            {/* 두 번째 줄 */}
                            <button 
                                className={`type-button ${activeRoadmapType === 'application-area' ? 'active' : ''}`}
                                onClick={() => changeRoadmapType('application-area')}
                            >
                                응용 영역
                            </button>
                            <button 
                                className={`type-button ${activeRoadmapType === 'methodology' ? 'active' : ''}`}
                                onClick={() => changeRoadmapType('methodology')}
                            >
                                개발 방법론
                            </button>
                            <button 
                                className={`type-button ${activeRoadmapType === 'project' ? 'active' : ''}`}
                                onClick={() => changeRoadmapType('project')}
                            >
                                프로젝트 유형
                            </button>
                        </div>
                    </div>
                    
                    {/* 아이템 목록 */}
                    <div className="items-container">
                        {displayData && displayData.length > 0 ? (
                            displayData.map(item => renderItemCard(
                                item, 
                                selectedId === item.id, 
                                () => handleItemClick(item.id, item)  // 아이템 데이터도 전달
                            ))
                        ) : (
                            <div className="empty-list">해당 카테고리에 로드맵이 없습니다.</div>
                        )}
                    </div>
                </>
            )}
            
            {/* 맞춤형 로드맵 생성 모드 */}
            {viewType === 'roadmap' && roadmapMode === 'generate' && (
                <RoadmapGenerator onGenerateRoadmap={handleGenerateRoadmap} />
            )}
            
            {/* 커리큘럼 모드 */}
            {viewType === 'curriculum' && (
                <div className="items-container">
                    {displayData && displayData.length > 0 ? (
                        displayData.map(item => renderItemCard(
                            item, 
                            selectedId === item.id, 
                            () => handleItemClick(item.id, item)
                        ))
                    ) : (
                        <div className="empty-list">커리큘럼이 없습니다.</div>
                    )}
                </div>
            )}
            
            <style jsx>{`
                .left-panel {
                                display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow-y: auto;
                    padding: 8px;
                }
                
                .roadmap-selector-container {
                    margin-bottom: 16px;
                }
                
                .roadmap-type-group {
                    margin-bottom: 8px;
                }
                
                .group-title {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--vscode-descriptionForeground);
                                margin-bottom: 4px;
                    padding-left: 4px;
                            }

                .group-buttons {
                                display: flex;
                    flex-wrap: wrap;
                    background-color: var(--vscode-editor-background);
                    border-radius: 4px;
                    border: 1px solid var(--vscode-panel-border);
                    padding: 4px;
                    gap: 4px;
                }
                
                .type-button {
                    flex: 0 0 calc(50% - 4px);
                    background: none;
                    border: none;
                    padding: 6px 8px;
                    font-size: 12px;
                    cursor: pointer;
                    border-radius: 3px;
                                color: var(--vscode-foreground);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .type-button.active {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                
                .type-button:hover:not(.active) {
                    background-color: var(--vscode-list-hoverBackground);
                }
                
                .items-container {
                    flex: 1;
                    overflow-y: auto;
                }
                
                .roadmap-item-header {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 8px;
                }
                
                .new-badge {
                    font-size: 10px;
                    background-color: var(--vscode-editorInfo-foreground, #2196f3);
                    color: white;
                                padding: 2px 6px;
                                border-radius: 10px;
                    font-weight: bold;
                }

                .progress-wrapper {
                                margin-top: 8px;
                }
                
                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    margin-bottom: 4px;
                }
                
                .progress-track {
                    height: 4px;
                    background-color: var(--vscode-editorWidget-background, rgba(0,0,0,0.1));
                    border-radius: 2px;
                                overflow: hidden;
                    position: relative;
                            }

                            .progress-bar {
                                position: absolute;
                                height: 100%;
                                left: 0;
                                top: 0;
                                border-radius: 2px;
                                transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
                                box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
                            }

                            .progress-glow {
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                background: linear-gradient(
                                    90deg,
                                    transparent,
                                    rgba(255, 255, 255, 0.1),
                                    transparent
                                );
                                animation: progress-glow 2s ease-in-out infinite;
                            }

                            @keyframes progress-glow {
                                0% {
                                    transform: translateX(-100%);
                                    opacity: 0;
                                }
                                50% {
                                    opacity: 1;
                                }
                                100% {
                                    transform: translateX(100%);
                                    opacity: 0;
                                }
                            }

                            .curriculum-item {
                                position: relative;
                                padding: 12px;
                                border-radius: 6px;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                margin-bottom: 8px;
                                border: 1px solid transparent;
                                background-color: var(--vscode-editor-background);
                            }

                            .curriculum-item:hover {
                                background-color: var(--vscode-list-hoverBackground);
                                border-color: var(--vscode-list-focusOutline);
                            }

                            .curriculum-item.selected {
                                background-color: var(--vscode-list-activeSelectionBackground);
                                border-color: var(--vscode-focusBorder);
                            }

                            .curriculum-item h3 {
                                margin: 0;
                                font-size: 14px;
                                color: var(--vscode-foreground);
                                font-weight: 500;
                            }

                            .curriculum-item p {
                                margin: 4px 0 0 0;
                                font-size: 12px;
                                color: var(--vscode-foreground);
                                opacity: 0.8;
                            }

                            .left-panel-loading,
                            .left-panel-error {
                                padding: 15px;
                                text-align: center;
                                color: var(--vscode-foreground);
                                font-size: 13px;
                            }

                            .left-panel-error {
                                color: var(--vscode-errorForeground);
                            }

                .difficulty-badge {
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 500;
                }

                .item-icon {
                    font-size: 16px;
                    color: var(--vscode-symbolIcon-classForeground);
                    min-width: 16px;
                }

                .roadmap-mode-toggle {
                    margin-bottom: 16px;
                }

                .mode-button {
                    background: none;
                    border: none;
                    padding: 6px 8px;
                    font-size: 12px;
                    cursor: pointer;
                    border-radius: 3px;
                    color: var(--vscode-foreground);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .mode-button.active {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }

                .mode-button:hover:not(.active) {
                    background-color: var(--vscode-list-hoverBackground);
                }

                .static-roadmap-container {
                    padding: 16px;
                }

                .static-roadmap-title {
                    font-size: 18px;
                    margin-top: 0;
                    margin-bottom: 8px;
                }

                .static-roadmap-description {
                    font-size: 14px;
                    margin-bottom: 16px;
                    color: var(--vscode-descriptionForeground);
                }

                .empty-list {
                    padding: 16px;
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                }

                /* 아이템 카드 스타일 개선 */
                .item-card {
                    margin: 0 0 16px 0;
                    border-radius: 8px;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    overflow: hidden;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
                    display: flex;
                    flex-direction: column;
                }
                
                .item-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    border-color: var(--vscode-focusBorder);
                }
                
                .item-card.selected {
                    background-color: var(--vscode-list-activeSelectionBackground);
                    color: var(--vscode-list-activeSelectionForeground);
                    border-color: var(--vscode-focusBorder);
                    box-shadow: 0 0 0 2px var(--vscode-focusBorder);
                }
                
                .card-content {
                    padding: 16px;
                    flex: 1;
                }
                
                .item-header {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }
                
                .icon-container {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background-color: var(--vscode-badge-background);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    flex-shrink: 0;
                }
                
                .icon-container i {
                    font-size: 20px;
                    color: var(--vscode-badge-foreground);
                }
                
                .item-title-container {
                    flex: 1;
                }
                
                .item-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 4px;
                    line-height: 1.3;
                    color: var(--vscode-editor-foreground);
                    display: flex;
                    align-items: center;
                }
                
                .new-badge {
                    font-size: 10px;
                    font-weight: normal;
                    background-color: var(--vscode-notificationsInfoIcon-foreground);
                    color: white;
                    padding: 1px 6px;
                    border-radius: 10px;
                    margin-left: 8px;
                    text-transform: uppercase;
                }
                
                .item-updated {
                    font-size: 11px;
                    color: var(--vscode-descriptionForeground);
                    display: flex;
                    align-items: center;
                }
                
                .item-updated i {
                    font-size: 12px;
                    margin-right: 4px;
                }
                
                .item-description {
                    margin-bottom: 12px;
                    font-size: 13px;
                    line-height: 1.5;
                    color: var(--vscode-foreground);
                    opacity: 0.9;
                }
                
                .item-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                
                .item-badge {
                    display: flex;
                    align-items: center;
                    font-size: 11px;
                    padding: 3px 8px;
                    border-radius: 12px;
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    color: var(--vscode-editor-foreground);
                }
                
                .item-badge i {
                    font-size: 12px;
                    margin-right: 4px;
                }
                
                .item-badge.difficulty {
                    background-color: var(--vscode-activityBarBadge-background);
                    color: var(--vscode-activityBarBadge-foreground);
                }
                
                .item-badge.duration {
                    background-color: var(--vscode-statusBarItem-warningBackground);
                    color: var(--vscode-statusBarItem-warningForeground);
                }
                
                .item-badge.students {
                    background-color: var(--vscode-statusBarItem-remoteBackground);
                    color: var(--vscode-statusBarItem-remoteForeground);
                }
                
                .card-footer {
                    padding: 12px 16px;
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    border-top: 1px solid var(--vscode-panel-border);
                }
                
                .item-progress-container {
                    margin-bottom: 10px;
                }
                
                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    margin-bottom: 6px;
                    color: var(--vscode-editor-foreground);
                }
                
                .progress-value {
                    font-weight: 600;
                }
                
                .progress-bar-bg {
                    height: 6px;
                    background-color: var(--vscode-button-secondaryBackground);
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .progress-bar-fill {
                    height: 100%;
                    border-radius: 3px;
                    background: linear-gradient(90deg, 
                      var(--vscode-debugIcon-startForeground) 0%, 
                      var(--vscode-charts-blue) 100%);
                }
                
                .item-review {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 12px;
                }
                
                .stars {
                    display: flex;
                }
                
                .stars i {
                    color: #E3B341;
                    margin-right: 2px;
                    font-size: 14px;
                }
                
                .review-score {
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--vscode-editor-foreground);
                }

                .roadmap-type-selector {
                    padding: 12px;
                    background: var(--vscode-sideBar-background);
                    border-bottom: 1px solid var(--vscode-panel-border);
                }

                .group-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--vscode-panelTitle-activeForeground);
                }

                .type-buttons-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .type-button {
                    padding: 6px 8px;
                    font-size: 12px;
                    border: 1px solid var(--vscode-button-border);
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                    white-space: nowrap;
                }

                .type-button:hover {
                    background: var(--vscode-button-secondaryHoverBackground);
                }

                .type-button.active {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border-color: var(--vscode-focusBorder);
                }

                .roadmap-view-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .roadmap-view-header {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    background: var(--vscode-sideBar-background);
                }

                .back-button {
                    display: flex;
                    align-items: center;
                    background: none;
                    border: none;
                    color: var(--vscode-button-foreground);
                    cursor: pointer;
                    padding: 4px 8px;
                    margin-right: 8px;
                    border-radius: 4px;
                }

                .back-button:hover {
                    background: var(--vscode-button-hoverBackground);
                }

                .roadmap-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--vscode-editor-foreground);
                    margin: 0;
                }
                        `}</style>
        </div>
    );
};

export default LeftPanel;