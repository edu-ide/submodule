/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CurriculumItem } from '../../types/curriculum';
import RoadmapGenerator from './RoadmapGenerator';

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

// 역할 기반 로드맵 데이터
const roleBadedRoadmaps: RoadmapItem[] = [
    { 
        id: 'frontend', 
        title: '프론트엔드', 
        category: 'role',
        description: '웹 애플리케이션의 사용자 인터페이스와 상호작용을 개발하는 역할입니다.',
        difficulty: 'intermediate',
        icon: 'browser',
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
];

// 응용 영역(domain + industry 통합) 로드맵 데이터
const applicationAreaRoadmaps: RoadmapItem[] = [
    // 기존 도메인 기반 항목
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
        id: 'game-dev', 
        title: '게임 개발', 
        category: 'application-area',
        icon: 'game',
        isNew: true
    },
    { 
        id: 'data-science', 
        title: '데이터 사이언스', 
        category: 'application-area',
        icon: 'dashboard'
    },
    
    // 기존 산업 분야 항목
    { 
        id: 'fintech', 
        title: '핀테크', 
        category: 'application-area',
        description: '금융 기술 분야의 개발자 로드맵',
        difficulty: 'intermediate',
        icon: 'credit-card',
        steps: [
            { title: '금융 시스템 기초', content: '', completed: false },
            { title: '보안 및 규제 준수', content: '', completed: false },
            { title: '결제 시스템 통합', content: '', completed: false }
        ]
    },
    { 
        id: 'healthtech', 
        title: '헬스테크', 
        category: 'application-area',
        description: '의료 및 건강 관리 기술 분야의 개발자 로드맵',
        difficulty: 'advanced',
        icon: 'heart'
    },
    { 
        id: 'edtech', 
        title: '에듀테크', 
        category: 'application-area',
        description: '교육 기술 분야의 개발자 로드맵',
        difficulty: 'intermediate',
        icon: 'mortar-board'
    }
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

const LeftPanel: React.FC<LeftPanelProps> = ({ selectedId, onSelect, items, viewType = 'curriculum' }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [curriculumData, setCurriculumData] = useState<CurriculumDocument[]>([]);
    const [activeRoadmapType, setActiveRoadmapType] = useState<RoadmapCategory>('role');
    const [roadmapMode, setRoadmapMode] = useState<'browse' | 'generate'>('browse');

    // 현재 표시할 데이터 선택
    const getDisplayData = () => {
        // 로드맵 모드
        if (viewType === 'roadmap') {
            switch (activeRoadmapType) {
                // 기본 관점
                case 'role':
                    return roleBadedRoadmaps;
                case 'skill':
                    return skillBasedRoadmaps;
                case 'foundation':
                    return foundationRoadmaps;
                    
                // 응용 관점
                case 'application-area':
                    return applicationAreaRoadmaps;
                case 'methodology':
                    return methodologyRoadmaps;
                case 'project':
                    return projectRoadmaps;
                    
                // 학습자 관점
                case 'learner-level':
                    return learnerLevelRoadmaps;
                case 'goal':
                    return goalBasedRoadmaps;
                case 'learning-style':
                    return learningStyleRoadmaps;
                case 'time-investment':
                    return timeInvestmentRoadmaps;
                    
                default:
                    return roleBadedRoadmaps;
            }
        }
        
        // 커리큘럼 모드
        if (items) {
            return items;
        }
        
        // API에서 가져온 데이터
        return curriculumData;
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
    const handleItemClick = (id: string) => {
        onSelect(id);
    };

    // 로드맵 분류 선택 UI 업데이트 - 최적화된 그룹 구조
    const renderRoadmapTypeSelector = () => {
        if (viewType !== 'roadmap') return null;
        
        return (
            <div className="roadmap-selector-container">
                <div className="roadmap-type-group">
                    <div className="group-title">기본 관점</div>
                    <div className="group-buttons">
                        <button 
                            className={`type-button ${activeRoadmapType === 'role' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('role')}
                        >
                            역할 기반
                        </button>
                        <button 
                            className={`type-button ${activeRoadmapType === 'skill' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('skill')}
                        >
                            기술 기반
                        </button>
                        <button 
                            className={`type-button ${activeRoadmapType === 'foundation' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('foundation')}
                        >
                            기초 지식
                        </button>
                    </div>
                </div>
                
                <div className="roadmap-type-group">
                    <div className="group-title">응용 관점</div>
                    <div className="group-buttons">
                        <button 
                            className={`type-button ${activeRoadmapType === 'application-area' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('application-area')}
                        >
                            응용 영역
                        </button>
                        <button 
                            className={`type-button ${activeRoadmapType === 'methodology' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('methodology')}
                        >
                            개발 방법론
                        </button>
                        <button 
                            className={`type-button ${activeRoadmapType === 'project' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('project')}
                        >
                            프로젝트 유형
                        </button>
                    </div>
                </div>
                
                <div className="roadmap-type-group">
                    <div className="group-title">학습자 관점</div>
                    <div className="group-buttons">
                        <button 
                            className={`type-button ${activeRoadmapType === 'learner-level' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('learner-level')}
                        >
                            학습자 수준
                        </button>
                        <button 
                            className={`type-button ${activeRoadmapType === 'goal' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('goal')}
                        >
                            학습 목표
                        </button>
                        <button 
                            className={`type-button ${activeRoadmapType === 'learning-style' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('learning-style')}
                        >
                            학습 방식
                        </button>
                        <button 
                            className={`type-button ${activeRoadmapType === 'time-investment' ? 'active' : ''}`}
                            onClick={() => setActiveRoadmapType('time-investment')}
                        >
                            시간 투자
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 로드맵 모드 토글 버튼 UI
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

    // 로딩 UI
    if (loading) {
        return <div className="left-panel-loading">커리큘럼 로딩 중...</div>;
    }

    // 오류 UI
    if (error) {
        return <div className="left-panel-error">{error}</div>;
    }

    // 표시할 데이터 가져오기
    const displayData = getDisplayData();

    return (
        <div className="left-panel">
            {viewType === 'roadmap' && renderRoadmapModeToggle()}
            
            {/* 기존 로드맵 브라우즈 모드 */}
            {viewType === 'roadmap' && roadmapMode === 'browse' && (
                <>
                    {renderRoadmapTypeSelector()}
                    <div className="items-container">
                        {/* 로드맵 아이템 렌더링 (기존 코드) */}
                    </div>
                </>
            )}
            
            {/* 로드맵 생성 모드 */}
            {viewType === 'roadmap' && roadmapMode === 'generate' && (
                <RoadmapGenerator onGenerateRoadmap={handleGenerateRoadmap} />
                // 또는 <RoadmapWizard onComplete={handleGenerateRoadmap} />
            )}
            
            {/* 커리큘럼 모드 (기존 코드) */}
            {viewType === 'curriculum' && (
                <div className="items-container">
                    {/* 커리큘럼 아이템 렌더링 (기존 코드) */}
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
            `}</style>
        </div>
    );
};

export default LeftPanel;