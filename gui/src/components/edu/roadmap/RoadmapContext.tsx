import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ReactFlowInstance } from '@xyflow/react';

interface RoadmapContextType {
  viewportState: {
    x: number;
    y: number;
    zoom: number;
  } | null;
  nodePositions: Record<string, { x: number; y: number }>;
  setViewportState: (state: { x: number; y: number; zoom: number } | null) => void;
  setNodePositions: React.Dispatch<React.SetStateAction<Record<string, { x: number; y: number }>>>;
  flowInstance: ReactFlowInstance | null;
  setFlowInstance: (instance: ReactFlowInstance | null) => void;
}

const defaultContext: RoadmapContextType = {
  viewportState: null,
  nodePositions: {},
  setViewportState: () => {},
  setNodePositions: () => {},
  flowInstance: null,
  setFlowInstance: () => {}
};

const RoadmapContext = createContext<RoadmapContextType>(defaultContext);

export const RoadmapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [viewportState, setViewportState] = useState<{ x: number; y: number; zoom: number } | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null);

  return (
    <RoadmapContext.Provider
      value={{
        viewportState,
        setViewportState,
        nodePositions,
        setNodePositions,
        flowInstance,
        setFlowInstance
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => useContext(RoadmapContext); 