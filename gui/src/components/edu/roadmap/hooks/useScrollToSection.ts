import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UseScrollToSectionProps {
  contentRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  contentLoaded: boolean;
}

/**
 * 특정 섹션으로 스크롤하는 기능을 제공하는 훅
 */
export const useScrollToSection = ({ contentRef, isLoading, contentLoaded }: UseScrollToSectionProps) => {
  const location = useLocation();
  
  // URL에서 섹션 파라미터 추출
  useEffect(() => {
    if (!isLoading && contentLoaded && contentRef.current) {
      try {
        const queryParams = new URLSearchParams(location.search);
        const sectionParam = queryParams.get('section');
        
        if (sectionParam) {
          console.log('URL에서 section 파라미터 감지:', sectionParam);
          // URL의 section 파라미터가 있으면 스크롤 실행
          setTimeout(() => {
            console.log('URL 쿼리 파라미터 기반 스크롤 실행:', sectionParam);
            scrollToSection(sectionParam);
          }, 800);
        }
      } catch (error) {
        console.error('섹션 스크롤 처리 중 오류:', error);
      }
    }
  }, [isLoading, contentLoaded, location.search]);

  // 특정 섹션으로 스크롤하는 함수
  const scrollToSection = (sectionParam: string) => {
    console.log('스크롤 함수 실행 - contentRef 존재 여부:', !!contentRef.current);
    console.log('스크롤 대상 섹션:', sectionParam);
    
    // 마크다운 렌더링 확인
    if (!contentRef.current) {
      console.warn('contentRef가 없음 - 컴포넌트가 마운트되지 않았을 수 있음');
      // 600ms 후에 다시 시도
      setTimeout(() => scrollToSection(sectionParam), 600);
      return false; // 스크롤 실패
    }

    try {
      // 모든 헤딩 요소 검색 (data-heading-text 속성 사용)
      const allHeadings = contentRef.current.querySelectorAll('[data-heading-text]');
      console.log('찾은 헤딩 요소 수:', allHeadings?.length);
      
      if (!allHeadings || allHeadings.length === 0) {
        console.warn('헤딩 요소를 찾을 수 없음 - DOM이 아직 렌더링되지 않았을 수 있음');
        // DOM이 아직 로드되지 않았을 수 있으므로 재시도 (시간 연장)
        setTimeout(() => scrollToSection(sectionParam), 1000);
        return false;
      }
      
      let foundHeading = null;
      
      // 디버깅: 모든 헤딩 출력
      console.log('모든 헤딩 목록:');
      allHeadings.forEach((heading, index) => {
        const headingText = heading.getAttribute('data-heading-text') || '';
        const headingLevel = heading.getAttribute('data-heading-level') || '';
        console.log(`${index}: h${headingLevel} - "${headingText}" - ID: "${heading.id}"`);
      });
      
      // 섹션 이름 정규화 (마크다운 서식 제거)
      const normalizedSection = sectionParam.toLowerCase()
        .replace(/^#+\s+/, '') // 마크다운 헤딩 기호 제거 (예: '## ' -> '')
        .replace(/^\*+\s+/, '') // 마크다운 볼드/이탤릭 기호 제거
        .replace(/^_+\s+/, '') // 마크다운 볼드/이탤릭 기호 제거
        .replace(/[^\w\s가-힣]/g, '') // 이모티콘 및 특수문자 제거
        .trim();
      
      console.log('정규화된 섹션 이름:', normalizedSection);
      
      // 먼저 h2 헤딩만 필터링
      const h2Headings = Array.from(allHeadings).filter(heading => 
        heading.getAttribute('data-heading-level') === '2'
      );
      
      console.log('h2 헤딩 요소 수:', h2Headings.length);
      
      // h2 헤딩 중에서 content_section 텍스트를 포함하는 것 찾기
      for (let i = 0; i < h2Headings.length; i++) {
        const heading = h2Headings[i];
        const headingText = heading.getAttribute('data-heading-text') || '';
        
        // 헤딩 텍스트 정규화
        const normalizedHeading = headingText.toLowerCase()
          .replace(/^#+\s+/, '') // 마크다운 헤딩 기호 제거
          .replace(/^\*+\s+/, '') // 마크다운 볼드/이탤릭 기호 제거
          .replace(/^_+\s+/, '') // 마크다운 볼드/이탤릭 기호 제거
          .replace(/[^\w\s가-힣]/g, '') // 이모티콘 및 특수문자 제거
          .trim();
      
        console.log(`h2 헤딩 #${i}:`, normalizedHeading);
        console.log(`비교: "${normalizedHeading}" vs "${normalizedSection}"`);
        
        // 완전 일치 또는 포함 관계 확인
        if (normalizedHeading === normalizedSection) {
          console.log('h2에서 완전 일치하는 헤딩 찾음:', headingText);
          foundHeading = heading;
          break;
        } else if (normalizedHeading.includes(normalizedSection)) {
          console.log('h2 헤딩이 섹션 이름을 포함함:', headingText);
          foundHeading = heading;
          break;
        } else if (normalizedSection.includes(normalizedHeading)) {
          console.log('섹션 이름이 h2 헤딩을 포함함:', headingText);
          foundHeading = heading;
          break;
        }
      }
      
      // h2에서 찾지 못한 경우 모든 헤딩에서 검색
      if (!foundHeading) {
        console.log('h2에서 찾지 못함, 모든 헤딩에서 검색');
        
        // 섹션 이름과 일치하는 헤딩 찾기
        for (let i = 0; i < allHeadings.length; i++) {
          const heading = allHeadings[i];
          const headingText = heading.getAttribute('data-heading-text') || '';
          const headingLevel = heading.getAttribute('data-heading-level') || '';
          
          // 헤딩 텍스트 정규화
          const normalizedHeading = headingText.toLowerCase()
            .replace(/^#+\s+/, '') // 마크다운 헤딩 기호 제거
            .replace(/^\*+\s+/, '') // 마크다운 볼드/이탤릭 기호 제거
            .replace(/^_+\s+/, '') // 마크다운 볼드/이탤릭 기호 제거
            .replace(/[^\w\s가-힣]/g, '') // 이모티콘 및 특수문자 제거
            .trim();
          
          console.log(`헤딩 #${i} (h${headingLevel}):`, normalizedHeading);
          console.log(`비교: "${normalizedHeading}" vs "${normalizedSection}"`);
          // 완전 일치 또는 포함 관계 확인
          if (normalizedHeading === normalizedSection) {
            console.log('완전 일치하는 헤딩 찾음:', headingText);
            foundHeading = heading;
            break;
          } else if (normalizedHeading.includes(normalizedSection)) {
            console.log('헤딩이 섹션 이름을 포함함:', headingText);
            if (!foundHeading) {
              foundHeading = heading;
            }
          } else if (normalizedSection.includes(normalizedHeading)) {
            console.log('섹션 이름이 헤딩을 포함함:', headingText);
            if (!foundHeading) {
              foundHeading = heading;
            }
          }
        }
      }
      
      if (foundHeading) {
        console.log('최종 선택된 헤딩:', foundHeading.getAttribute('data-heading-text'));
    
        // 스크롤 위치 계산 디버깅
        const rect = foundHeading.getBoundingClientRect();
        console.log('헤딩 위치 정보:', {
          top: rect.top,
          pageYOffset: window.pageYOffset,
          scrollY: window.scrollY,
          clientHeight: document.documentElement.clientHeight,
          heading: foundHeading.textContent
        });
        
        // 시각적으로 강조 표시 (더 눈에 띄게)
        foundHeading.style.backgroundColor = 'var(--vscode-editor-findMatchHighlightBackground)';
        foundHeading.style.padding = '8px';
        foundHeading.style.borderRadius = '4px';
        
        // 화살표 이모지 추가 (DOM 직접 조작)
        try {
          // 기존 화살표가 있으면 제거
          const existingArrow = foundHeading.querySelector('.section-arrow');
          if (existingArrow) {
            existingArrow.remove();
          }
          
          const arrow = document.createElement('span');
          arrow.textContent = '👉 ';
          arrow.className = 'section-arrow';
          arrow.style.fontSize = '1.5em'; // 화살표 크기 키움
          arrow.style.color = 'var(--vscode-editorWarning-foreground)'; // 경고색으로 강조
          foundHeading.prepend(arrow);
          
          console.log('화살표 이모지 추가 성공');
        } catch (error) {
          console.error('화살표 이모지 추가 실패:', error);
        }
        
        // 단일 스크롤 방식으로 변경 - 모든 중첩 타이머 제거하고 한 번에 실행
        const performSmoothScroll = () => {
          try {
            console.log('단일 스크롤 메서드 실행 시작');
            
            // 컨테이너 참조 확인
            if (!contentRef.current) {
              console.warn('스크롤 시도 시 contentRef가 존재하지 않음');
              return;
            }
            
            // 헤딩 위치 최신 정보 가져오기
            const headingRect = foundHeading.getBoundingClientRect();
            const containerRect = contentRef.current.getBoundingClientRect();
            
            // 오프셋 균일하게 설정 (중요: 충분한 여백)
            const SCROLL_OFFSET = 120;
            
            // 스크롤 위치 계산 - 컨테이너 내부 상대 위치
            const relativeTop = headingRect.top - containerRect.top;
            const targetScrollTop = contentRef.current.scrollTop + relativeTop - SCROLL_OFFSET;
            
            console.log('스크롤 위치 계산:', {
              containerTop: containerRect.top,
              headingTop: headingRect.top,
              relativeTop,
              targetScrollTop,
              currentScrollTop: contentRef.current.scrollTop
            });
            
            // 부드러운 스크롤 적용 - smooth behavior 사용
            contentRef.current.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth' // 부드러운 스크롤로 변경
            });
            
            console.log('컨테이너 스크롤 완료');
          } catch (error) {
            console.error('스크롤 실행 오류:', error);
            
            // 폴백: 기본 scrollIntoView 사용
            try {
              foundHeading.scrollIntoView({
                block: 'start',
                behavior: 'smooth' // 부드러운 스크롤로 변경
              });
              
              // 추가 여백 적용 (지연 적용으로 충돌 방지)
              setTimeout(() => {
                if (contentRef.current) {
                  contentRef.current.scrollBy({
                    top: -150,
                    behavior: 'smooth' // 부드러운 스크롤로 변경
                  });
                }
                console.log('폴백 스크롤 성공');
              }, 500); // 스크롤 완료 후 여백 조정
            } catch (fallbackError) {
              console.error('폴백 스크롤 실패:', fallbackError);
            }
          }
        };
        
        // 스크롤 실행 - 한 번만 실행
        performSmoothScroll();
        
        // 일정 시간 후 강조 효과 제거
        setTimeout(() => {
          try {
            foundHeading.style.backgroundColor = '';
            foundHeading.style.padding = '';
            foundHeading.style.borderRadius = '';
            const arrowElement = foundHeading.querySelector('.section-arrow');
            if (arrowElement) {
              arrowElement.remove();
            }
            console.log('강조 효과 제거 성공');
          } catch (error) {
            console.error('강조 효과 제거 실패:', error);
          }
        }, 5000); // 5초 후 제거
        
        return true; // 스크롤 성공
      } else {
        console.warn('일치하는 헤딩을 찾을 수 없음:', sectionParam);
        return false; // 스크롤 실패
      }
    } catch (error) {
      console.error('스크롤 처리 중 오류 발생:', error);
      return false; // 스크롤 실패
    }
  };

  return {
    scrollToSection
  };
};

export default useScrollToSection; 