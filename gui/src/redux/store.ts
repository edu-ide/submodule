import { combineReducers, configureStore } from "@reduxjs/toolkit";
import configReducer from "./slices/configSlice";
import miscReducer from "./slices/miscSlice";
import serverStateReducer from "./slices/serverStateReducer";
import stateReducer from "./slices/stateSlice";
import uiStateReducer from "./slices/uiStateSlice";
import roadmapReducer from './roadmapSlice';
import { initialState as roadmapInitialState } from './roadmapSlice';
import codeBlockReducer from './codeBlockSlice';

import { createTransform, persistReducer, persistStore, createMigrate } from "redux-persist";
import { createFilter } from "redux-persist-transform-filter";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// 코드 블록 상태를 위한 transform
const codeBlocksTransform = createTransform(
  // 저장 시 변환
  (inboundState: any) => {
    if (!inboundState) return {};
    return {
      ...inboundState,
      // 실행 중 상태는 저장하지 않음
      isExecuting: false
    };
  },
  // 복원 시 변환
  (outboundState: any) => {
    if (!outboundState) return {};
    return {
      ...outboundState,
      // 복원 시 초기 상태 설정
      isExecuting: false
    };
  },
  { whitelist: ['codeBlocks'] }
);

// 코드 블록 상태를 위한 persist 설정
const codeBlocksPersistConfig = {
  key: 'codeBlocks',
  storage,
  version: 1,
  transforms: [codeBlocksTransform],
  stateReconciler: autoMergeLevel2,
  debug: process.env.NODE_ENV === 'development'
};

const persistedCodeBlocksReducer = persistReducer(codeBlocksPersistConfig, codeBlockReducer);

const rootReducer = combineReducers({
  state: stateReducer,
  config: configReducer,
  misc: miscReducer,
  uiState: uiStateReducer,
  serverState: serverStateReducer,
  roadmap: roadmapReducer,
  codeBlocks: persistedCodeBlocksReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const saveSubsetFilters = [
  createFilter("state", [
    "history",
    "contextItems",
    "sessionId",
    "defaultModelTitle",
  ]),
  createFilter("uiState", [], ["bottomMessage"]),
  createFilter("codeBlocks", ["outputHistory", "initialized"]),
];

// 마이그레이션 설정
const migrations = {
  0: (state: any) => ({
    ...state,
    codeBlocks: {}
  }),
  1: (state: any) => ({
    ...state,
    codeBlocks: {
      ...state.codeBlocks,
      initialized: true,
      outputHistory: state.codeBlocks?.outputHistory || []
    }
  })
};

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  blacklist: ['uiState'],
  whitelist: ['roadmap', 'codeBlocks'],
  transforms: [
    ...saveSubsetFilters,
    codeBlocksTransform
  ],
  stateReconciler: autoMergeLevel2,
  debug: process.env.NODE_ENV === 'development',
  migrate: createMigrate(migrations, { debug: true })
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PURGE',
          'persist/REGISTER',
          'codeBlocks/clearOutput',
          'codeBlocks/initializeCodeBlock',
          'codeBlocks/addOutput',
          'codeBlocks/removeCodeBlock'
        ],
        ignoredPaths: ['codeBlocks'],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
