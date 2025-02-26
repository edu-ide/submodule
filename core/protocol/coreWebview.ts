import { ProfileDescription } from "../config/ConfigHandler.js";
import { ToCoreFromIdeOrWebviewProtocol } from "./core.js";
import { ToWebviewFromIdeOrCoreProtocol } from "./webview.js";
import { EditorContent } from "./types.js";

// TipTap 에디터의 교육 블록 타입 정의
export type ToCoreFromWebviewProtocol = ToCoreFromIdeOrWebviewProtocol & {
  didChangeSelectedProfile: [{ id: string }, void];
  // EditorContent 타입도 허용하도록 변경
  addEducationContextToChat: [{ 
    content: EditorContent, 
    shouldRun?: boolean, 
    prompt?: string 
  }, void];
};

export type ToWebviewFromCoreProtocol = ToWebviewFromIdeOrCoreProtocol & {
  didChangeAvailableProfiles: [{ profiles: ProfileDescription[] }, void];
  showToast: [{ message: string }, void];
  // EditorContent 타입도 허용하도록 변경
  forwardEducationContextToChat: [{ 
    content:  EditorContent, 
    shouldRun?: boolean, 
    prompt?: string 
  }, void];
};
