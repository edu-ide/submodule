/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CurriculumItem } from '../../types/curriculum';
import RoadmapGenerator from './RoadmapGenerator';
import RoadmapView from './RoadmapView';
import { 
    RoadmapCategory,
    RoadmapMode
} from './types';
import { 
    roleBadedRoadmaps, 
    skillBasedRoadmaps, 
    foundationRoadmaps, 
    applicationAreaRoadmaps,
    methodologyRoadmaps,
    projectRoadmaps
} from '../../data/roadmapData';
import { useNavigate } from 'react-router-dom';

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

// 로드맵 표시 방식 상수
const ROADMAP_MODES = {
    BROWSE: 'browse',
    RECOMMENDED: 'recommended'
} as const;

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
    const navigate = useNavigate();

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
                return roleBadedRoadmaps as unknown as RoadmapItem[];
            case 'skill':
                return skillBasedRoadmaps as unknown as RoadmapItem[];
            case 'foundation':
                return foundationRoadmaps as unknown as RoadmapItem[];
            case 'application-area':
                return applicationAreaRoadmaps as unknown as RoadmapItem[];
            case 'methodology':
                return methodologyRoadmaps as unknown as RoadmapItem[];
            case 'project':
                return projectRoadmaps as unknown as RoadmapItem[];
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

    // 로드맵 선택 처리 - 라우터 내비게이션 사용
    const handleRoadmapSelect = (roadmapId: string, item?: any) => {
        // 상태 변경 대신 라우터 내비게이션 사용
        navigate(`/education/roadmap/${roadmapId}`);
        
        // 선택 콜백도 계속 호출 (필요한 경우)
        onSelect(roadmapId);
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
        if (item.icon) return item.icon;
        
        if (item.type === 'roadmap') {
            return 'project';
        } else if (item.type === 'tutorial') {
            return 'book';
        } else if (item.category === 'python') {
            return 'symbol-method';
        } else {
            return 'library';
        }
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

    // 로드맵에서 돌아오기 처리(더 이상 필요 없음)
    // 라우터가 처리하므로 삭제 가능
    // const handleRoadmapBack = () => { ... };

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
            {showRoadmapView && selectedRoadmap ? (
                <RoadmapView 
                    roadmapId={selectedRoadmap} 
                />
            ) : (
                <>
                    {/* 로드맵 둘러보기 모드 - 카테고리 선택기 */}
                    {viewType === 'roadmap' && roadmapMode === 'browse' && (
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
                            
                            {/* 선택된 카테고리의 로드맵 목록 */}
                            <div className="roadmap-items-list">
                                {displayData.map(item => 
                                    renderItemCard(
                                        item, 
                                        selectedId === item.id, 
                                        () => handleRoadmapSelect(item.id, item)
                                    )
                                )}
                            </div>
                        </>
                    )}
                    
                    {/* 로드맵 생성 모드 */}
                    {viewType === 'roadmap' && roadmapMode === 'generate' && (
                        <RoadmapGenerator 
                            onGenerateRoadmap={handleGenerateRoadmap}
                        />
                    )}
                    
                    {/* 커리큘럼 목록 */}
                    {viewType === 'curriculum' && (
                        <div className="curriculum-list">
                            {displayData.map(item => 
                                renderItemCard(
                                    item, 
                                    selectedId === item.id, 
                                    () => onSelect(item.id)
                                )
                            )}
                        </div>
                    )}
                </>
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