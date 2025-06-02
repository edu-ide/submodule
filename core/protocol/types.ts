/**
 * 교육 콘텐츠 데이터 구조 정의
 * 학습 도우미와 채팅 컨텍스트 간의 데이터 전송을 위한 인터페이스
 */
export interface EditorContentNode {
  type: string;
  attrs?: {
    title?: string;
    content?: string;      // 일반 텍스트/코드 내용
    category?: string;
    markdown?: string;     // 마크다운 형식 여부 (CodeBlock.tsx 호환성)
    requirements?: string; // 제출 결과용 요구사항
    htmlContent?: string;  // 제출 결과용 HTML 내용
    item?: any; // ContextItemWithId 등 다른 타입 허용
    // 기타 필요한 속성 추가 가능
  };
  content?: EditorContentNode[];
  text?: string;
}

export interface EditorContent {
  type: "doc" | "assistant";
  content?: EditorContentNode[];
}
