/**
 * 교육 콘텐츠 데이터 구조 정의
 * 학습 도우미와 채팅 컨텍스트 간의 데이터 전송을 위한 인터페이스
 */
export  interface EditorContent {
  type: string;
  content: Array<{
    type: string;
    attrs: {
      title: string;
      content: string;
      category: string;
      markdown: string;
    };
  }>;
}
