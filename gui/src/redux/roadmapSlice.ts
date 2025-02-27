import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoadmapState {
  viewportState: {
    x: number;
    y: number;
    zoom: number;
    lastUpdated: number;
  };
  nodePositions: Record<string, { x: number; y: number }>;
  nodeProgress: Record<string, 'completed' | 'in-progress' | 'not-started'>;
}

export const initialState: RoadmapState = {
  viewportState: { 
    x: 0, 
    y: 0, 
    zoom: 1,
    lastUpdated: Date.now()
  },
  nodePositions: {},
  nodeProgress: {}
};

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState,
  reducers: {
    setViewport: (state, action: PayloadAction<{ x: number; y: number; zoom: number }>) => {
      const clampedZoom = Math.min(Math.max(action.payload.zoom, 0.1), 1.5);
      state.viewportState = {
        x: action.payload.x,
        y: action.payload.y,
        zoom: Number(clampedZoom.toFixed(2)),
        lastUpdated: Date.now()
      };
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
      state.viewportState = { x: 0, y: 0, zoom: 1, lastUpdated: Date.now() };
      state.nodePositions = {};
    }
  },
  extraReducers: (builder) => {
    builder.addCase('persist/REHYDRATE', (state, action) => {
    });
  }
});

export const { setViewport, setNodePosition, setNodeProgress, resetRoadmap } = roadmapSlice.actions;

export default roadmapSlice.reducer; 