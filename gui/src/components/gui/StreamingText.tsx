import React, { useState, useEffect, useRef } from 'react';

interface StreamingTextProps {
  text: string;
  animate: boolean;
  animationDelay?: number; // ms per character
}

const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  animate,
  animationDelay = 25, // 안정성을 위해 늘린 딜레이 유지
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const textToProcess = String(text || '');

    if (!animate) {
      setDisplayedText(textToProcess);
      currentIndexRef.current = textToProcess.length;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null; // 명시적 null 설정 유지
      }
      return;
    }

    const animateText = () => {
      if (currentIndexRef.current < textToProcess.length) {
        const charToAdd = textToProcess[currentIndexRef.current];
        setDisplayedText((prev) => prev + charToAdd);
        currentIndexRef.current += 1;
        timeoutRef.current = setTimeout(animateText, animationDelay);
      } else {
        timeoutRef.current = null; // 애니메이션 완료 시 null 설정 유지
      }
    };

    setDisplayedText('');
    currentIndexRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null; // 명시적 null 설정 유지
    }

    timeoutRef.current = setTimeout(animateText, 5); // 약간의 초기 딜레이 유지

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null; // 명시적 null 설정 유지
      }
    };
  }, [text, animate, animationDelay]);

  return <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{displayedText || ''}</pre>;
};

export default StreamingText; 