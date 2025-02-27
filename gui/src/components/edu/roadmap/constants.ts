import pythonRoadmapData from './data/pythonRoadmap.json';
import { Node as FlowNode, Edge as FlowEdge } from '@xyflow/react';

// 파이썬 로드맵 노드 데이터
export const pythonNodes = pythonRoadmapData.nodes as FlowNode[];

// 파이썬 로드맵 엣지 데이터
export const pythonEdges = pythonRoadmapData.edges as FlowEdge[]; 