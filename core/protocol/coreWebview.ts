import { ProfileDescription } from "../config/ConfigHandler.js";
import { ToCoreFromIdeOrWebviewProtocol } from "./core.js";
import { ToWebviewFromIdeOrCoreProtocol } from "./webview.js";
import { EducationContent } from "./types.js";

export type ToCoreFromWebviewProtocol = ToCoreFromIdeOrWebviewProtocol & {
  didChangeSelectedProfile: [{ id: string }, void];
  addEducationContextToChat: [{ content: EducationContent }, void];
};

export type ToWebviewFromCoreProtocol = ToWebviewFromIdeOrCoreProtocol & {
  didChangeAvailableProfiles: [{ profiles: ProfileDescription[] }, void];
  showToast: [{ message: string }, void];
  addEducationContextToChat: [{ content: EducationContent }, void];
};
