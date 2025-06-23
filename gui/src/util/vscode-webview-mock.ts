// Mock for vscode-webview module to prevent import errors in development
// This file provides empty implementations for VSCode webview types

export interface WebviewApi<T = unknown> {
  postMessage(message: any): void;
  getState(): T | undefined;
  setState<T>(newState: T): T;
}

// VSCode webview types are not needed in browser environment
// This mock allows the import to succeed without causing errors