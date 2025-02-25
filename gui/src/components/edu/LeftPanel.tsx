/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { CurriculumItem } from '../types/curriculum';

interface LeftPanelProps {
    items: CurriculumItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
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

const LeftPanel = ({ items, selectedId, onSelect }: LeftPanelProps): JSX.Element => {
    return (
        <div className="left-panel">
            {items.map((item) => {
                const totalSteps = item.steps.length;
                const completedSteps = item.steps.filter(step => step.completed === true).length;
                const progress = Math.round((completedSteps / totalSteps) * 100);

                return (
                    <div
                        key={item.id}
                        className={`curriculum-item ${selectedId === item.id ? 'selected' : ''}`}
                        onClick={() => onSelect(item.id)}
                    >
                        <div className="curriculum-content">
                            <div className="header">
                                <h3>{item.title}</h3>
                                <div className="progress-info">
                                    <span className="steps-count">{completedSteps}/{totalSteps}</span>
                                    <span className="percent">{progress}%</span>
                                </div>
                            </div>
                            <p>{item.description}</p>
                            <div className="progress-container">
                                <div 
                                    className="progress-bar"
                                    style={{ 
                                        width: `${progress}%`,
                                        backgroundColor: getProgressColor(progress)
                                    }}
                                >
                                    <div className="progress-glow" />
                                </div>
                            </div>
                        </div>
                        <style>{`
                            .curriculum-content {
                                width: 100%;
                            }

                            .header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 4px;
                            }

                            .progress-info {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            }

                            .steps-count {
                                font-size: 11px;
                                color: var(--vscode-foreground);
                                opacity: 0.7;
                            }

                            .percent {
                                font-size: 11px;
                                color: var(--vscode-foreground);
                                background-color: var(--vscode-editor-background);
                                padding: 2px 6px;
                                border-radius: 10px;
                                min-width: 40px;
                                text-align: center;
                                border: 1px solid var(--vscode-panel-border);
                            }

                            .progress-container {
                                position: relative;
                                height: 3px;
                                background-color: var(--vscode-editor-background);
                                border-radius: 4px;
                                margin-top: 8px;
                                overflow: hidden;
                                border: 1px solid var(--vscode-panel-border);
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
                        `}</style>
                    </div>
                );
            })}
        </div>
    );
};

export default LeftPanel;