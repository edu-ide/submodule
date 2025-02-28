import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 최대 기록 수 상수 정의
const MAX_OUTPUT_HISTORY = 50;

interface Log {
  timestamp: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface CodeBlockState {
  outputHistory: Log[];
  initialized: boolean;
}

interface CodeBlocksState {
  [blockId: string]: CodeBlockState;
}

const initialState: CodeBlocksState = {};

const codeBlockSlice = createSlice({
  name: 'codeBlocks',
  initialState,
  reducers: {
    initializeCodeBlock: (state, action: PayloadAction<string>) => {
      const blockId = action.payload;
      state[blockId] = {
        outputHistory: [],
        initialized: true
      };
    },
    addOutput: (state, action: PayloadAction<{
      blockId: string;
      log: Log;
    }>) => {
      const { blockId, log } = action.payload;
      if (!state[blockId]) {
        state[blockId] = {
          outputHistory: [],
          initialized: true
        };
      }
      
      // 최대 기록 수를 초과하면 가장 오래된 기록 삭제
      if (state[blockId].outputHistory.length >= MAX_OUTPUT_HISTORY) {
        state[blockId].outputHistory.shift();
      }
      
      state[blockId].outputHistory.push(log);
    },
    clearOutput: (state, action: PayloadAction<string>) => {
      const blockId = action.payload;
      // 상태를 완전히 초기화
      state[blockId] = {
        outputHistory: [],
        initialized: true
      };
    },
    removeCodeBlock: (state, action: PayloadAction<string>) => {
      const blockId = action.payload;
      delete state[blockId];
    }
  }
});

export const {
  initializeCodeBlock,
  addOutput,
  clearOutput,
  removeCodeBlock
} = codeBlockSlice.actions;

export default codeBlockSlice.reducer; 