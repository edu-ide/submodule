import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 언어 선택 상태를 위한 인터페이스
interface LanguageState {
  selectedLanguage: string | null;
}

// 초기 상태 설정
const initialState: LanguageState = {
  selectedLanguage: null,
};

// 언어 슬라이스 생성
export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    // 선택된 언어 설정
    setSelectedLanguage: (state, action: PayloadAction<string | null>) => {
      state.selectedLanguage = action.payload;
    },
  },
});

// 액션 생성자 내보내기
export const { setSelectedLanguage } = languageSlice.actions;

// 셀렉터 함수 내보내기
export const selectSelectedLanguage = (state: { language: LanguageState }) => 
  state.language.selectedLanguage;

// 리듀서 내보내기
export default languageSlice.reducer; 