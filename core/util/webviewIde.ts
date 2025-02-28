export class WebviewIde implements IDE {
  // ... existing code ...

  async createPracticeFile(language: string, code: string): Promise<void> {
    return this.request("createPracticeFile", { language, code });
  }
} 