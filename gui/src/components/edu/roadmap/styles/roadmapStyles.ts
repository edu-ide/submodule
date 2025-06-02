import { css } from '@emotion/react';

// 로드맵 스타일 정의
export const roadmapStyles = css`
  /* 기본 레이아웃 스타일 */
  .roadmap-view-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    overflow: hidden;
  }
  
  .navigation-path {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 8px 0;
    border-bottom: 1px solid var(--vscode-panel-border);
  }
  
  .back-button {
    background-color: transparent;
    border: none;
    color: var(--vscode-textLink-foreground);
    cursor: pointer;
    font-size: 0.95rem;
    padding: 0;
    text-decoration: none;
  }
  
  .back-button:hover {
    text-decoration: underline;
  }
  
  .path-separator {
    margin: 0 10px;
    color: var(--vscode-descriptionForeground);
  }
  
  .current-path {
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  /* 보기 모드 컨트롤 */
  .view-controls {
    display: none; /* 보기 모드 버튼을 숨김 - 설정 패널에서 통합 관리 */
  }
  
  .view-mode-button {
    display: none; /* 보기 모드 버튼을 숨김 */
  }
  
  /* 콘텐츠 영역 */
  .roadmap-content {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  
  .flow-view-container {
    height: 700px;
    width: 100%;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
  
  .toc-view-container {
    height: 100%;
    width: 100%;
    overflow: auto;
    padding: 20px;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
  }
  
  /* React Flow 컴포넌트 스타일 */
  .react-flow {
    background-color: var(--vscode-editor-background);
  }
  
  .react-flow__node {
    transition: all 0.2s ease;
  }

  .react-flow__node:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }
  
  /* 엣지 스타일 개선 - 우선 순위 높임 */
  .react-flow__edge {
    z-index: 100 !important;
    transition: stroke-width 0.2s, opacity 0.2s, filter 0.2s;
  }
  
  .react-flow__edge-path {
    stroke: #4a8af4 !important; 
    stroke-width: 2.5px !important;
    opacity: 1 !important;
  }
  
  .react-flow__edge:hover .react-flow__edge-path {
    stroke: #ff5500 !important;
    stroke-width: 3.5px !important;
    filter: drop-shadow(0 0 5px #ff5500) !important;
    z-index: 2000 !important;
  }
  
  /* 패널 및 컨트롤 */
  .roadmap-panel {
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 8px;
    margin: 10px;
    padding: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .roadmap-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .reset-button {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .reset-button:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
  
  .reset-icon {
    margin-right: 6px;
  }
  
  /* 범례 및 가이드 */
  .flow-legend {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 12px;
    padding: 15px;
    z-index: 5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 180px;
  }
  
  .legend-title {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 0.95rem;
    border-bottom: 1px solid var(--vscode-panel-border);
    padding-bottom: 8px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    margin: 8px 0;
  }
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 8px;
  }
  
  .legend-text {
    font-size: 0.9rem;
  }
  
  .flow-mini-guide {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 12px;
    padding: 15px;
    z-index: 5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 280px;
  }
  
  .mini-guide-title {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 0.95rem;
    border-bottom: 1px solid var(--vscode-panel-border);
    padding-bottom: 8px;
  }
  
  .mini-guide-item {
    display: flex;
    align-items: center;
    margin: 8px 0;
    font-size: 0.9rem;
  }
  
  .guide-icon {
    margin-right: 8px;
    font-size: 1.1rem;
  }
  
  /* 로드맵 노드 스타일링 */
  .roadmap-node-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .roadmap-node-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 8px 12px;
    color: var(--vscode-editor-background);
    font-size: 0.85rem;
    font-weight: bold;
  }
  
  .status-icon {
    margin-right: 6px;
  }
  
  .roadmap-node-title {
    padding: 12px 16px 8px;
    font-weight: bold;
    font-size: 1.1rem;
    color: var(--vscode-editor-foreground);
  }
  
  .roadmap-node-description {
    padding: 0 16px 12px;
    font-size: 0.85rem;
    color: var(--vscode-descriptionForeground);
    line-height: 1.4;
  }
  
  /* 노드 콘텐츠 영역 */
  .node-content-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
    background-color: var(--vscode-editor-background);
    border-left: 1px solid var(--vscode-panel-border);
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
    z-index: 10;
    overflow: hidden;
  }
  
  .node-content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--vscode-panel-border);
  }
  
  .node-title {
    margin: 0;
    font-size: 1.5rem;
    color: var(--vscode-editor-foreground);
  }
  
  .close-content-button {
    background: transparent;
    border: none;
    color: var(--vscode-editor-foreground);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 5px;
  }
  
  .node-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
  }
  
  .content-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 1rem;
    color: var(--vscode-descriptionForeground);
  }
  
  .markdown-content {
    line-height: 1.6;
    font-size: 1rem;
  }
  
  .markdown-content h1, .markdown-content h2, .markdown-content h3 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  
  .markdown-content p, .markdown-content ul, .markdown-content ol {
    margin-bottom: 1em;
  }
  
  .markdown-content code {
    font-family: monospace;
    background-color: var(--vscode-textCodeBlock-background);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }
  
  .markdown-content pre {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin: 1em 0;
  }
  
  .markdown-content a {
    color: var(--vscode-textLink-foreground);
    text-decoration: none;
  }
  
  .markdown-content a:hover {
    text-decoration: underline;
  }
  
  .roadmap-flow-container {
    width: 100%;
    height: 100%;
  }
  
  .progress-status {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
    padding: 10px 15px;
    z-index: 5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .progress-bar {
    height: 10px;
    background-color: var(--vscode-editor-lineHighlightBackground);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  
  .progress-fill {
    height: 100%;
    background-color: var(--vscode-terminal-ansiGreen);
    border-radius: 5px;
    transition: width 0.5s ease;
  }
  
  .progress-text {
    font-size: 0.85rem;
    text-align: center;
  }
  
  .guide-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
  }
  
  .guide-content {
    background-color: var(--vscode-editor-background);
    border-radius: 8px;
    padding: 20px;
    max-width: 500px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--vscode-panel-border);
  }
  
  .guide-content h3 {
    margin-top: 0;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--vscode-panel-border);
    font-size: 1.2em;
    color: var(--vscode-editor-foreground);
  }
  
  .guide-content ul {
    margin: 0;
    padding-left: 20px;
  }
  
  .guide-content li {
    margin-bottom: 10px;
    line-height: 1.5;
    color: var(--vscode-editor-foreground);
  }
  
  .close-guide {
    display: block;
    margin-top: 20px;
    padding: 8px 16px;
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    float: right;
    transition: background-color 0.2s ease;
  }
  
  .close-guide:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
`; 