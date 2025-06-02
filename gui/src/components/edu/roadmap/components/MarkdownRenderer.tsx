import React from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import plantUmlPlugin from '../plantUmlPlugin';
import CodeBlock from '../CodeBlock';
import ConsoleOutput from '../ConsoleOutput';
import InlineCode from '../InlineCode';
import QuizBlock from '../QuizBlock';

interface MarkdownRendererProps {
  content: string;
}

/**
 * 마크다운 콘텐츠를 렌더링하는 컴포넌트
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // 코드 블록 렌더링
  const renderCodeBlock = ({className, children, inline}: {className?: string, children: any, inline?: boolean}) => {
    const code = String(children).trim();
    
    // language- 접두사 제거
    const lang = className?.replace('language-', '') || '';
    const match = /language-(.+)/.exec(className || '');
    if (match && match[1] === 'quiz') {
      return <QuizBlock value={String(children).trim()} />;
    }
    // 터미널 관련 언어인 경우
    const isTerminalLang = ['bash', 'shell', 'sh'].includes(lang);
    if (isTerminalLang) {
      return (
        <CodeBlock 
          language={lang}
          value={code}
        />
      );
    }
    // 인라인 코드나 백틱 하나로 감싼 경우
    if (!className && !code.includes('\n') ) {
      return <InlineCode content={code} />;
    }
    
    // 언어가 지정되지 않은 경우 콘솔 출력으로 처리
    if (!className) {
      return <ConsoleOutput content={code} />;
    }
    
    // 그 외의 경우 일반 CodeBlock 사용
    return (
      <CodeBlock 
        language={lang || 'text'}
        value={code}
      />
    );
  };

  // 볼드체 렌더링을 위한 컴포넌트
  const renderStrong = ({ children, node }: { children: React.ReactNode, node: any }) => {
    console.log('Strong node:', node); // 디버깅을 위한 로그
    return (
      <strong className="bold-text" style={{
        fontWeight: 700,
        color: 'var(--foreground)',
        display: 'inline-block'
      }}>
        {children}
      </strong>
    );
  };

  // 헤딩 렌더링을 위한 컴포넌트
  const renderHeading = ({ level, children, ...props }: { level: number, children?: React.ReactNode, [key: string]: any }) => {
    // 헤딩 텍스트 추출
    const headingText = React.Children.toArray(children || [])
      .map(child => {
        if (typeof child === 'string') return child;
        if (React.isValidElement(child) && child.props.children) {
          if (typeof child.props.children === 'string') return child.props.children;
          return '';
        }
        return '';
      })
      .join('');
    
    // 헤딩 ID 생성 (스크롤 타겟으로 사용)
    const headingId = `heading-${level}-${headingText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 특수문자 제거
      .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
      .replace(/--+/g, '-')}`; // 중복 하이픈 제거
    
    console.log(`헤딩 렌더링: 레벨 ${level}, 텍스트: "${headingText}", ID: "${headingId}"`);
    
    // 헤딩 태그 선택
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    
    // 데이터 속성 추가 (스크롤 타겟으로 사용)
    return (
      <HeadingTag 
        id={headingId} 
        className={`heading-level-${level}`} 
        data-heading-text={headingText}
        data-heading-level={level}
        {...props}
      >
        {children}
      </HeadingTag>
    );
  };
  
  return (
    <Markdown
      children={content}
      remarkPlugins={[
        remarkGfm,
        remarkMath,
      ]}
      rehypePlugins={[
        rehypeKatex,
        [rehypeExternalLinks, { target: '_blank' }],
        rehypeRaw,
        plantUmlPlugin
      ]}
      components={{
        code: renderCodeBlock,
        strong: renderStrong,
        h1: ({ node, ...props }) => renderHeading({ level: 1, ...props }),
        h2: ({ node, ...props }) => renderHeading({ level: 2, ...props }),
        h3: ({ node, ...props }) => renderHeading({ level: 3, ...props }),
        h4: ({ node, ...props }) => renderHeading({ level: 4, ...props }),
        h5: ({ node, ...props }) => renderHeading({ level: 5, ...props }),
        h6: ({ node, ...props }) => renderHeading({ level: 6, ...props })
      }}
    />
  );
};

export default MarkdownRenderer; 