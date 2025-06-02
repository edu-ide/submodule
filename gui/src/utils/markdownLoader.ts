import fs from 'fs';
import path from 'path';
import { store } from '../redux/store';
import { setBottomMessage } from '../redux/slices/uiStateSlice';
import React from 'react';

export const loadMarkdownContent = async (filePath: string): Promise<string> => {
  try {
    const apiEndpoint = `http://localhost:9000/edu/content/${filePath}`;
    console.log('Requesting markdown from:', apiEndpoint);
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      console.error('Server response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Markdown load error:', error);
    // 임시 로컬 파일 로딩 폴백
    const localContent = await fetch(`./edu/content/${filePath}`)
      .then(res => res.text())
      .catch(() => {
        throw new Error('Local fallback also failed');
      });
    return localContent;
  }
}; 