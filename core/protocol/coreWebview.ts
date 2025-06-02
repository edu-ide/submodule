import { ProfileDescription } from "../config/ConfigHandler.js";
import { ToCoreFromIdeOrWebviewProtocol } from "./core.js";
import { ToWebviewFromIdeOrCoreProtocol } from "./webview.js";
import { EditorContent } from "./types.js";
import type { IndexingProgressUpdate, ContextItemWithId, ContinueConfig } from "../index.d.js";

// TipTap 에디터의 교육 블록 타입 정의
export type ToCoreFromWebviewProtocol = ToCoreFromIdeOrWebviewProtocol & {
  didChangeSelectedProfile: [{ id: string }, void];
  addEducationContextToChat: [{
    content: EditorContent,
    shouldRun?: boolean,
    prompt?: string
  }, void];
};

export type ToWebviewFromCoreProtocol = ToWebviewFromIdeOrCoreProtocol & {
  didChangeAvailableProfiles: [{ profiles: ProfileDescription[] }, void];
  showToast: [{ message: string }, void];
  forwardEducationContextToChat: [{
    content: EditorContent,
    shouldRun?: boolean,
    prompt?: string
  }, void];

  practiceSubmissionResult: [
    { practiceId: string; diffResult: string | null; error?: string },
    void
  ];
};
