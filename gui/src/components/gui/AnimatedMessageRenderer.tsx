import React from 'react';
import StyledMarkdownPreview from '../markdown/StyledMarkdownPreview';
import StreamingText from './StreamingText';
import { Citation } from 'core'; // Citation 타입 임포트 필요

// StyledMarkdownPreviewProps와 거의 동일한 props를 받도록 정의
interface AnimatedMessageRendererProps {
  source?: string;
  className?: string;
  showCodeBorder?: boolean;
  scrollLocked?: boolean;
  isStreaming?: boolean;
  isLast?: boolean;
  messageIndex?: number;
  integrationSource?: "perplexity" | "continue";
  citations?: Citation[];
  isCodeSnippet?: boolean;
  messageSource?: 'assistant'; // 이 메시지가 aichat에서 왔는지 구분
}

// processCitations 함수 (StyledMarkdownPreview에서 가져옴)
// TODO: 이 함수를 공유 유틸리티로 옮기는 것을 고려
const processCitations = (text: string, citations?: Citation[]) => {
  if (!citations) return text;

  return text.replace(/\[(\d+)\]/g, (match, num) => {
    const citation = citations[parseInt(num) - 1];
    if (!citation) return match;
    // 링크 형식이 아닌, 인용 번호만 표시하도록 유지 (필요시 수정)
    // return `[[${num}]](${citation.url})`;
    return `[${num}]`; // 예: [1], [2]
  });
};


const AnimatedMessageRenderer: React.FC<AnimatedMessageRendererProps> = (props) => {
  const { isLast, isStreaming, messageSource, source, citations, ...restProps } = props;

  // 애니메이션 적용 여부 결정: 마지막 메시지 + 스트리밍 완료 + messageSource가 'assistant'
  const shouldAnimateText = messageSource === 'assistant';

  // Citation 처리
  const processedSource = processCitations(source || "", citations);

  if (shouldAnimateText) {
    console.log("[AnimatedMessageRenderer] Text to animate:", JSON.stringify(processedSource)); // 로그 추가
    // 조건 만족 시 StreamingText 렌더링
    // StreamingText는 pre 태그를 렌더링하므로, StyledMarkdown의 기본 스타일과 유사하게 보일 수 있음
    // 필요하다면 여기서 추가적인 스타일링 wrapper를 적용할 수 있음
    console.log("[AnimatedMessageRenderer] Rendering with StreamingText animation.");
    return <StreamingText text={processedSource} animate={true} />;
  } else {
    // 그 외의 경우 기존 StyledMarkdownPreview 렌더링
    // 처리된 소스를 전달하고, messageSource prop은 더 이상 필요 없으므로 전달하지 않음
    console.log("[AnimatedMessageRenderer] Rendering default StyledMarkdownPreview.");
    return <StyledMarkdownPreview {...restProps} source={processedSource} citations={undefined} />; // citations은 이미 처리했으므로 undefined 전달
  }
};

export default AnimatedMessageRenderer; 