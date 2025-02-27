import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoadmapState {
  viewportState: {
    x: number;
    y: number;
    zoom: number;
  } | null;
  nodePositions: Record<string, { x: number; y: number }>;
  nodeProgress: Record<string, 'completed' | 'in-progress' | 'not-started'>;
}

const initialState: RoadmapState = {
  viewportState: null,
  nodePositions: {},
  nodeProgress: {}
};

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState,
  reducers: {
    setViewport: (state, action: PayloadAction<{ x: number; y: number; zoom: number } | null>) => {
      state.viewportState = action.payload;
    },
    setNodePosition: (state, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) => {
      const { id, position } = action.payload;
      state.nodePositions[id] = position;
    },
    setNodeProgress: (state, action: PayloadAction<{ id: string; status: 'completed' | 'in-progress' | 'not-started' }>) => {
      const { id, status } = action.payload;
      state.nodeProgress[id] = status;
    },
    resetRoadmap: (state) => {
      state.viewportState = null;
      state.nodePositions = {};
    }
  }
});

export const { setViewport, setNodePosition, setNodeProgress, resetRoadmap } = roadmapSlice.actions;

export default roadmapSlice.reducer; 