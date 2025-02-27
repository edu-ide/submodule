import { combineReducers, configureStore } from "@reduxjs/toolkit";
import configReducer from "./slices/configSlice";
import miscReducer from "./slices/miscSlice";
import serverStateReducer from "./slices/serverStateReducer";
import stateReducer from "./slices/stateSlice";
import uiStateReducer from "./slices/uiStateSlice";
import roadmapReducer from './roadmapSlice';
import { initialState as roadmapInitialState } from './roadmapSlice';

import { createTransform, persistReducer, persistStore } from "redux-persist";
import { createFilter } from "redux-persist-transform-filter";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const rootReducer = combineReducers({
  state: stateReducer,
  config: configReducer,
  misc: miscReducer,
  uiState: uiStateReducer,
  serverState: serverStateReducer,
  roadmap: roadmapReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const windowIDTransform = (windowID) =>
  createTransform(
    // transform state on its way to being serialized and persisted.
    (inboundState, key) => {
      return { [windowID]: inboundState };
    },
    // transform state being rehydrated
    (outboundState, key) => {
      return outboundState[windowID] || {};
    }
  );

const saveSubsetFilters = [
  createFilter("state", [
    "history",
    "contextItems",
    "sessionId",
    "defaultModelTitle",
  ]),
  createFilter("uiState", [], ["bottomMessage"]),
];

const persistConfig = {
  key: "root",
  storage,
  blacklist: ['uiState'],
  whitelist: ['roadmap'],
  transforms: [
    ...saveSubsetFilters,
    // windowIDTransform((window as any).windowId || "undefinedWindowId"),
  ],
  stateReconciler: autoMergeLevel2,
  version: 1,
  migrate: (state, version) => {
    if (state && version !== 1) {
      // 이전 버전 데이터 변환 로직
      return { ...state, roadmap: roadmapInitialState };
    }
    return state;
  }
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
