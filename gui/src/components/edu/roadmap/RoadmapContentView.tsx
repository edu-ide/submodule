import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useDispatch } from 'react-redux';
import { setNodeProgress } from '../../../redux/roadmapSlice';
import { setBottomMessage, setHeaderInfo } from '../../../redux/slices/uiStateSlice';
import { VscCopy, VscOpenPreview, VscFile, VscCommentDiscussion, VscPlay, VscClearAll } from 'react-icons/vsc';
import RoadmapContentSection from './RoadmapContentSection';
import RoadmapContentNavigator from './RoadmapContentNavigator';
import { loadMarkdownContent } from '../../../utils/markdownLoader';
import { useEffect as useHighlightEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // VS Code 스타일 테마
import { fetchRoadmapContent, fetchRoadmapData } from './constants';
import { IdeMessengerContext } from '@/context/IdeMessenger';
import CodeBlock from './CodeBlock';
import ConsoleOutput from './ConsoleOutput';
import InlineCode from './InlineCode';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import plantUmlPlugin from './plantUmlPlugin';
import QuizBlock from './QuizBlock';

interface ContentData {
  title: string;
  description: string;
  content: string;
  order: string;
  prerequisites: string[];
}

// VS Code 테마 색상 변수 (tailwind 변수 사용)
const vsCodeTheme = {
  // 기본 색상
  background: 'var(--background)',           // VSCode 배경
  foreground: 'var(--foreground)',          // 기본 텍스트
  editorBackground: 'var(--background)', // 에디터 배경
  border: 'var(--border)',                   // 테두리
  
  // 강조 색상
  button: {
    background: 'var(--button-background)',
    foreground: 'var(--button-foreground)',
    hover: 'var(--button-hover-background)',
  },
  
  // 입력 요소
  input: {
    background: 'var(--input-background)',
    foreground: 'var(--input-foreground)',
    border: 'var(--input-border)',
  },
  
  // 리스트 관련
  list: {
    activeSelection: {
      background: 'var(--list-active-selection-background)',
      foreground: 'var(--list-active-selection-foreground)',
    },
    hoverBackground: 'var(--list-hover-background)',
  },
  
  // 탭 관련
  tab: {
    activeBackground: 'var(--tab-active-background)',
    activeForeground: 'var(--tab-active-foreground)',
  },
};

const RoadmapContentView: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  const { roadmapId, contentId } = params;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [realContentId, setRealContentId] = useState<string | null>(null);
  const [contentSection, setContentSection] = useState<string | null>(null);

  // 타이틀-ID 매핑 상태 추가
  const [titleToIdMap, setTitleToIdMap] = useState<Record<string, string>>({});
  
  // contentId가 실제 ID인지 타이틀인지 확인하고 실제 ID를 설정하는 함수
  const determineRealContentId = useCallback(async (contentIdParam: string | undefined) => {
    if (!contentIdParam) return null;
    
    try {
      console.log('contentId 파라미터 확인:', contentIdParam);
      
      // 1. 먼저 contentId가 실제 ID인지 확인
      const roadmapContent = await fetchRoadmapContent(roadmapId);
      if (roadmapContent.roadmap[contentIdParam]) {
        console.log('contentId가 실제 ID임:', contentIdParam);
        return contentIdParam;
      }
      
      // 2. contentId가 실제 ID가 아니라면 타이틀로 간주하고 데이터 로드
      const roadmapData = await fetchRoadmapData(roadmapId);
      console.log('로드맵 데이터 노드:', roadmapData.nodes.length);
      
      // 타이틀-ID 매핑 생성
      const titleToId: Record<string, string> = {};
      roadmapData.nodes.forEach(node => {
        if (node.data?.title) {
          const encodedTitle = encodeURIComponent(node.data.title);
          titleToId[encodedTitle] = node.id;
          
          // 디버깅 - 특별히 '데이터 구조'라는 타이틀이 있는지 확인
          if (node.data.title === '데이터 구조') {
            console.log('데이터 구조 노드 발견:', {
              id: node.id,
              encodedTitle: encodedTitle,
              rawTitle: node.data.title
            });
          }
        }
      });
      
      setTitleToIdMap(titleToId);
      console.log('타이틀-ID 매핑:', titleToId);
      
      // 디코딩된 contentId로 실제 ID 찾기
      let decodedContentId;
      try {
        decodedContentId = decodeURIComponent(contentIdParam);
        console.log('디코딩된 contentId:', decodedContentId);
      } catch (e) {
        console.error('contentId 디코딩 오류:', e);
        decodedContentId = contentIdParam;
      }
      
      // URI 디코딩 이후에 한 번 더 확인 (한글 인코딩 문제 대응)
      if (roadmapContent.roadmap[decodedContentId]) {
        console.log('디코딩된 contentId가 실제 ID임:', decodedContentId);
        return decodedContentId;
      }
      
      // 인코딩된 타이틀과 일치하는 노드 ID 찾기
      const matchedNodeId = titleToId[contentIdParam];
      
      if (matchedNodeId) {
        console.log('타이틀에 해당하는 노드 ID 찾음:', matchedNodeId);
        return matchedNodeId;
      }
      
      // 3. 매핑에서 찾지 못한 경우 노드 데이터를 직접 확인
      const matchedNode = roadmapData.nodes.find(node => 
        node.data?.title && (
          encodeURIComponent(node.data.title) === contentIdParam ||
          node.data.title === decodedContentId
        )
      );
      
      if (matchedNode) {
        console.log('노드 데이터에서 일치하는 ID 찾음:', matchedNode.id);
        return matchedNode.id;
      }
      
      // 4. 타이틀 부분 매칭 시도 (예: '데이터 구조'가 부분적으로 일치하는 경우)
      const partialMatchNode = roadmapData.nodes.find(node => 
        node.data?.title && (
          decodedContentId.includes(node.data.title) || 
          node.data.title.includes(decodedContentId)
        )
      );
      
      if (partialMatchNode) {
        console.log('부분 일치하는 노드 ID 찾음:', partialMatchNode.id);
        return partialMatchNode.id;
      }
      
      // 5. '데이터 구조'와 같은 특정 케이스 직접 처리
      if (decodedContentId === '데이터 구조' || contentIdParam === '%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EA%B5%AC%EC%A1%B0') {
        const dataStructureNode = roadmapData.nodes.find(node => node.id === 'data-structures');
        if (dataStructureNode) {
          console.log('특별 케이스 처리 - 데이터 구조:', dataStructureNode.id);
          return dataStructureNode.id;
        }
      }
      
      // 6. 매칭되는 ID를 찾지 못한 경우 원래 contentId 반환하고 오류 로그
      console.warn(`일치하는 노드를 찾지 못함: "${contentIdParam}" / "${decodedContentId}"`);
      console.warn('사용 가능한 노드 ID와 타이틀:');
      roadmapData.nodes.forEach(node => {
        console.warn(`- ID: ${node.id}, 타이틀: ${node.data?.title}`);
      });
      
      return contentIdParam;
      
    } catch (error) {
      console.error('실제 콘텐츠 ID 결정 오류:', error);
      return contentIdParam;
    }
  }, [roadmapId]);
  
  // contentId가 변경될 때마다 실제 ID 결정
  useEffect(() => {
    const fetchRealContentId = async () => {
      const realId = await determineRealContentId(contentId);
      console.log('최종 결정된 실제 콘텐츠 ID:', realId);
      setRealContentId(realId);
    };
    
    fetchRealContentId();
  }, [contentId, determineRealContentId]);

  // Markdown 컴포넌트의 코드 블록 렌더링
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

  // 데이터 검증 함수 추가
  const validateContentData = (data: any): data is ContentData => {
    return (
      typeof data === 'object' &&
      typeof data.title === 'string' &&
      typeof data.description === 'string' &&
      typeof data.content === 'string' &&
      typeof data.order === 'string' &&
      Array.isArray(data.prerequisites)
    );
  };

  console.log('현재 경로 매개변수:', params);
  console.log('로드맵 ID:', roadmapId);
  console.log('URL 콘텐츠 ID/타이틀:', contentId);
  console.log('실제 콘텐츠 ID:', realContentId);

  useEffect(() => {
    const loadContent = async () => {
      if (!realContentId) {
        console.log('실제 콘텐츠 ID가 아직 결정되지 않음');
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log('콘텐츠 로드 시작 - 실제 contentId:', realContentId);
        const roadmapContent = await fetchRoadmapContent(roadmapId);
        console.log('가져온 roadmapContent:', roadmapContent);
        
        if (!roadmapContent || !roadmapContent.roadmap) {
          throw new Error('로드맵 콘텐츠 데이터가 비어있습니다.');
        }

        const contentInfo = roadmapContent.roadmap[realContentId];
        console.log('찾은 contentInfo:', contentInfo);
        
        if (!contentInfo) {
          throw new Error(`콘텐츠 ID(${realContentId})에 해당하는 데이터를 찾을 수 없습니다.`);
        }

        if (!validateContentData(contentInfo)) {
          console.error('잘못된 콘텐츠 데이터 형식:', contentInfo);
          throw new Error('콘텐츠 데이터 형식이 올바르지 않습니다.');
        }
        
        setContentData(contentInfo);
        setError(null);
        
        // 헤더 정보 업데이트
        dispatch(setHeaderInfo({
          title: contentInfo.title,
          description: contentInfo.description
        }));
        
        // ID 기반으로 roadmap 데이터에서 content_section 정보 가져오기
        const fetchContentSection = async () => {
          try {
            const roadmapData = await fetchRoadmapData(roadmapId);
            const nodeWithId = roadmapData.nodes.find(node => node.id === realContentId);
            
            console.log('ID로 찾은 노드:', nodeWithId);
            
            if (nodeWithId && nodeWithId.data?.content_section) {
              console.log('노드에서 content_section 발견:', nodeWithId.data.content_section);
              setContentSection(nodeWithId.data.content_section);
            } else {
              console.log('노드에 content_section이 없음');
              setContentSection(null);
            }
          } catch (error) {
            console.error('content_section 가져오기 실패:', error);
            setContentSection(null);
          }
        };
        
        await fetchContentSection();
        
      } catch (error) {
        console.error('콘텐츠 로드 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        setError(`콘텐츠를 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
        dispatch(setBottomMessage(
          <div>
            콘텐츠 로드 실패
            <br />
            ID: {realContentId}
            <br />
            오류: {errorMessage}
          </div>
        ));
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [realContentId, dispatch, roadmapId]);

  const handleBack = () => {
    navigate(`/education/roadmap/${roadmapId}`);
  };

  const handleCompleteContent = () => {
    if (realContentId) {
      dispatch(setNodeProgress({ 
        id: realContentId, 
        status: 'completed' 
      }));
      navigate(`/education/roadmap/${roadmapId}`);
    }
  };

  // ID를 타이틀로 변환하는 함수
  const getNodeTitleForUrl = async (nodeId: string) => {
    try {
      const roadmapData = await fetchRoadmapData(roadmapId);
      const node = roadmapData.nodes.find(n => n.id === nodeId);
      
      if (node?.data?.title) {
        return encodeURIComponent(node.data.title);
      }
      
      return nodeId; // 타이틀이 없으면 ID 반환
    } catch (error) {
      console.error('노드 타이틀 변환 오류:', error);
      return nodeId;
    }
  };

  // 다음 콘텐츠로 이동
  const handleNextContent = async () => {
    try {
      const roadmapContent = await fetchRoadmapContent(roadmapId);
      const roadmapData = await fetchRoadmapData(roadmapId);
      const currentOrder = contentData?.order;
      
      // 현재 순서 다음의 메인 콘텐츠 찾기 (column이 'main'인 노드만)
      const mainNodes = roadmapData.nodes.filter(node => node.data.column === 'main');
      
      const nextContent = Object.entries(roadmapContent.roadmap)
        .filter(([id, _]) => {
          // mainNodes에서 해당 ID의 노드가 있는지 확인
          return mainNodes.some(node => node.id === id);
        })
        .find(([_, content]) => content.order > currentOrder);
      
      if (nextContent) {
        const [nextContentId] = nextContent;
        
        // ID를 타이틀로 변환
        const nextContentTitle = await getNodeTitleForUrl(nextContentId);
        console.log('다음 콘텐츠 네비게이션:', {
          id: nextContentId,
          title: nextContentTitle,
          url: `/education/roadmap/${roadmapId}/content/${nextContentTitle}`
        });
        
        navigate(`/education/roadmap/${roadmapId}/content/${nextContentTitle}`);
      } else {
        dispatch(setBottomMessage(
          <div>마지막 콘텐츠입니다.</div>
        ));
      }
    } catch (error) {
      console.error('다음 콘텐츠 조회 실패:', error);
    }
  };

  // 이전 콘텐츠로 이동
  const handlePrevContent = async () => {
    try {
      const roadmapContent = await fetchRoadmapContent(roadmapId);
      const roadmapData = await fetchRoadmapData(roadmapId);
      const currentOrder = contentData?.order;
      
      // 현재 순서 이전의 메인 콘텐츠 찾기 (column이 'main'인 노드만)
      const mainNodes = roadmapData.nodes.filter(node => node.data.column === 'main');
      
      const prevContent = Object.entries(roadmapContent.roadmap)
        .filter(([id, _]) => {
          // mainNodes에서 해당 ID의 노드가 있는지 확인
          return mainNodes.some(node => node.id === id);
        })
        .reverse()
        .find(([_, content]) => content.order < currentOrder);
      
      if (prevContent) {
        const [prevContentId] = prevContent;
        
        // ID를 타이틀로 변환
        const prevContentTitle = await getNodeTitleForUrl(prevContentId);
        console.log('이전 콘텐츠 네비게이션:', {
          id: prevContentId,
          title: prevContentTitle,
          url: `/education/roadmap/${roadmapId}/content/${prevContentTitle}`
        });
        
        navigate(`/education/roadmap/${roadmapId}/content/${prevContentTitle}`);
      } else {
        dispatch(setBottomMessage(
          <div>첫 번째 콘텐츠입니다.</div>
        ));
      }
    } catch (error) {
      console.error('이전 콘텐츠 조회 실패:', error);
    }
  };

  // 페이지 로드 시 로드맵 데이터 확인 및 스크롤 처리
  useEffect(() => {
    if (!isLoading && contentData && realContentId) {
      console.log('콘텐츠 로드 완료, 로드맵 데이터 확인 시작');
      
      const checkNodeTypeAndScroll = async () => {
        try {
          // 로드맵 데이터 가져오기
          const roadmapData = await fetchRoadmapData(roadmapId);
          
          // ID로 현재 노드 찾기
          const currentNode = roadmapData.nodes.find(node => node.id === realContentId);
          
          if (!currentNode) {
            console.warn('로드맵에서 현재 노드를 찾을 수 없음:', realContentId);
            return;
          }
          
          console.log('현재 노드 데이터:', currentNode);
          
          // 노드 연결 확인
          const incomingEdges = roadmapData.edges.filter(edge => edge.target === realContentId);
          const outgoingEdges = roadmapData.edges.filter(edge => edge.source === realContentId);
          const hasParentNode = incomingEdges.length > 0;
          const isLeafNode = outgoingEdges.length === 0;
          
          // child 노드 여부 확인
          const isChild = currentNode.data?.column === 'child' || 
                           (hasParentNode && isLeafNode);
          
          console.log('노드 관계 확인:', {
            isChild,
            hasParentNode,
            isLeafNode,
            nodeColumn: currentNode.data?.column,
          });
          
          // child 노드인 경우 content_section 확인
          if (isChild) {
            console.log('차일드 노드 발견, content_section 확인');
            // content_section 결정 (우선순위: 설정된 content_section > title > id)
            let sectionToScroll = '';
            
            if (typeof currentNode.data?.content_section === 'string' && currentNode.data.content_section.trim() !== '') {
              sectionToScroll = currentNode.data.content_section;
              console.log('노드의 content_section 사용:', sectionToScroll);
            } else if (typeof currentNode.data?.title === 'string' && currentNode.data.title.trim() !== '') {
              sectionToScroll = currentNode.data.title;
              console.log('노드 타이틀을 content_section으로 사용:', sectionToScroll);
            } else {
              sectionToScroll = currentNode.id;
              console.log('노드 ID를 content_section으로 사용:', sectionToScroll);
            }
            
            // 스크롤 실행 (지연 적용)
            setTimeout(() => {
              console.log('content_section으로 스크롤 시작:', sectionToScroll);
              scrollToSection(sectionToScroll);
            }, 800);
          } else {
            console.log('일반 노드, 스크롤 필요 없음');
          }
        } catch (error) {
          console.error('노드 타입 확인 중 오류:', error);
        }
      };
      
      checkNodeTypeAndScroll();
    }
  }, [isLoading, contentData, realContentId, roadmapId]);
  
  // 스크롤 함수 분리
  const scrollToSection = (sectionParam: string) => {
    console.log('스크롤 함수 실행 - contentRef 존재 여부:', !!contentRef.current);
    console.log('스크롤 대상 섹션:', sectionParam);
    
    // 마크다운 렌더링 확인
    if (contentRef.current) {

      try {
        // 모든 헤딩 요소 검색 (data-heading-text 속성 사용)
        const allHeadings = contentRef.current.querySelectorAll('[data-heading-text]');
        console.log('찾은 헤딩 요소 수:', allHeadings?.length);
        
        if (allHeadings && allHeadings.length > 0) {
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
              clientHeight: document.documentElement.clientHeight
            });
            
            // 직접 DOM 요소 위치로 스크롤 - 가장 확실한 방법
            try {
              // 컨테이너 요소 찾기 (스크롤 가능한 부모 요소)
              const scrollContainer = contentRef.current;
              
              if (scrollContainer) {
                // 컨테이너 내에서의 상대적 위치 계산
                const containerRect = scrollContainer.getBoundingClientRect();
                const headingRect = foundHeading.getBoundingClientRect();
                const relativeTop = headingRect.top - containerRect.top;
                
                // 현재 스크롤 위치에 상대적 위치 더하기 (오프셋 적용)
                const targetScrollTop = scrollContainer.scrollTop + relativeTop - 150;
                
                console.log('스크롤 계산 정보:', {
                  containerScrollTop: scrollContainer.scrollTop,
                  relativeTop,
                  targetScrollTop
                });
                
                // 직접 스크롤 위치 설정
                scrollContainer.scrollTo({
                  top: targetScrollTop,
                  behavior: 'smooth'
                });
              } else {
                // 컨테이너가 없으면 window 객체로 스크롤
                const absoluteTop = window.scrollY + rect.top - 150;
                window.scrollTo({
                  top: absoluteTop,
                  behavior: 'smooth'
                });
              }
            } catch (error) {
              console.error('스크롤 처리 중 오류:', error);
              // 폴백: 기본 scrollIntoView 사용
              foundHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.scrollBy(0, -150);
            }
            
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
        } else {
          console.warn('헤딩 요소를 찾을 수 없음 - DOM이 아직 렌더링되지 않았을 수 있음');
          return false; // 스크롤 실패
        }
      } catch (error) {
        console.error('스크롤 처리 중 오류 발생:', error);
        return false; // 스크롤 실패
      }
    } else {
      console.warn('contentRef가 없음 - 컴포넌트가 마운트되지 않았을 수 있음');
      return false; // 스크롤 실패
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return (
    <div className="error-container">
      <h2>⚠️ 콘텐츠 로드 실패</h2>
      <p>{error}</p>
      <div className="error-help">
        <p>가능한 원인:</p>
        <ul>
          <li>URL에 잘못된 콘텐츠 ID 또는 타이틀이 포함되어 있습니다</li>
          <li>서버에서 콘텐츠 데이터를 가져오지 못했습니다</li>
          <li>요청한 콘텐츠가 로드맵 데이터에 없습니다</li>
        </ul>
        <p>현재 요청 정보:</p>
        <ul>
          <li>URL 콘텐츠 ID: {contentId}</li>
          <li>결정된 실제 ID: {realContentId}</li>
        </ul>
      </div>
      <button onClick={handleBack} className="back-button">로드맵으로 돌아가기</button>
    </div>
  );
  if (!contentData) return (
    <div className="error-container">
      <h2>⚠️ 콘텐츠 로드 실패</h2>
      <p>문제가 지속되면 관리자에게 문의해주세요</p>
      <button onClick={handleBack}>돌아가기</button>
    </div>
  );

  return (
    <div className="roadmap-content-view">
      <div className="roadmap-content-header">
        <button className="back-button" onClick={handleBack}>
          ← 로드맵으로 돌아가기
        </button>
        {contentData && contentData.title && (
          <h1 className="content-title">{contentData.title}</h1>
        )}
      </div>
      <div className="content-container" ref={contentRef}>
        {contentData && (
          <Markdown
            children={contentData.content}
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
        )}
      </div>

      <div className="navigation-buttons">
        <div className="left-buttons">
          <button onClick={handleBack} className="back-button">
            이전으로
          </button>
          <button onClick={handlePrevContent} className="nav-button">
            ◀ 이전 콘텐츠
          </button>
        </div>
        <div className="right-buttons">
          <button onClick={handleNextContent} className="nav-button">
            다음 콘텐츠 ▶
          </button>
          <button onClick={handleCompleteContent} className="complete-button">
            완료
          </button>
        </div>
      </div>

      <style jsx>{`
        .roadmap-content-view {
          padding: 20px;
          max-width: 100%;
          margin: 0 auto;
          background: ${vsCodeTheme.editorBackground};
          color: ${vsCodeTheme.foreground};
        }
        
        .roadmap-content-header {
          display: flex;
          align-items: center;
          padding: 15px;
          margin-bottom: 20px;
          background: ${vsCodeTheme.editorBackground};
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid ${vsCodeTheme.border};
          position: relative;
        }
        
        .roadmap-content-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background: var(--vscode-terminal-ansiBlue);
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
        
        .back-button {
          padding: 8px 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
          background: ${vsCodeTheme.button.background};
          color: ${vsCodeTheme.button.foreground};
          display: flex;
          align-items: center;
          margin-right: 15px;
        }
        
        .back-button:hover {
          background: ${vsCodeTheme.button.hover};
          transform: translateX(-3px);
        }
        
        .content-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .content-container {
          flex: 1;
          background: ${vsCodeTheme.editorBackground};
          padding: 20px;
          border-radius: 8px;
          overflow-y: auto;
          border: 1px solid ${vsCodeTheme.border};
        }
        
        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: ${vsCodeTheme.editorBackground};
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid ${vsCodeTheme.border};
        }

        .left-buttons,
        .right-buttons {
          display: flex;
          gap: 12px;
        }
        
        .back-button,
        .nav-button,
        .complete-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .nav-button {
          background: ${vsCodeTheme.button.background};
          color: ${vsCodeTheme.button.foreground};
        }
        
        .complete-button {
          background: ${vsCodeTheme.button.background};
          color: ${vsCodeTheme.button.foreground};
        }
        
        .nav-button:hover {
          background: ${vsCodeTheme.button.hover};
        }
        
        .complete-button:hover {
          background: ${vsCodeTheme.button.hover};
        }

        :global(code) {
          background: ${vsCodeTheme.editorBackground};
          color: ${vsCodeTheme.foreground};
          border-color: ${vsCodeTheme.border};
        }

        :global(pre) {
          background: ${vsCodeTheme.background};
          border-color: ${vsCodeTheme.border};
        }

        :global(h2) {
          font-size: 1.8em;
          margin: 1.8em 0 1em;
          padding-bottom: 0.5em;
          border-bottom: 2px solid ${vsCodeTheme.border};
          color: ${vsCodeTheme.foreground};
          font-weight: 600;
        }

        :global(h3) {
          font-size: 1.4em;
          margin: 1.5em 0 1em;
          color: ${vsCodeTheme.foreground};
          font-weight: 600;
        }

        :global(p) {
          margin: 1em 0;
          line-height: 1.8;
          color: ${vsCodeTheme.foreground};
        }

        :global(ul), :global(ol) {
          margin: 1em 0;
          padding-left: 2em;
          color: ${vsCodeTheme.foreground};
        }

        :global(li) {
          margin: 0.7em 0;
          line-height: 1.6;
        }

        :global(a) {
          color: ${vsCodeTheme.button.background};
          text-decoration: none;
        }

        :global(a:hover) {
          text-decoration: underline;
        }

        :global(.bold-text), :global(strong) {
          font-weight: 700 !important;
          color: ${vsCodeTheme.foreground} !important;
          display: inline-block !important;
        }

        :global(blockquote) {
          margin: 1em 0;
          padding: 0.5em 1em;
          border-left: 4px solid ${vsCodeTheme.border};
          background: ${vsCodeTheme.editorBackground};
          color: ${vsCodeTheme.foreground};
        }

        :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
          border: 1px solid ${vsCodeTheme.border};
        }

        :global(hr) {
          border: none;
          border-top: 2px solid ${vsCodeTheme.border};
          margin: 2em 0;
        }

        :global(.highlighted-section) {
          position: relative;
          background-color: rgba(var(--accent-color, 0, 120, 212), 0.2) !important;
          padding: 8px 15px !important;
          border-radius: 6px !important;
          transition: background-color 0.5s ease !important;
          margin: 5px 0 !important;
          box-shadow: 0 0 8px rgba(var(--accent-color, 0, 120, 212), 0.3) !important;
        }

        :global(.partial-match-section) {
          position: relative;
          background-color: rgba(var(--accent-color, 0, 120, 212), 0.1) !important;
          padding: 8px 15px !important;
          border-radius: 6px !important;
          transition: background-color 0.5s ease !important;
          margin: 5px 0 !important;
        }

        :global(.section-arrow) {
          font-size: 1.2em;
          margin-right: 8px;
          display: inline-block;
          animation: bounce 1s infinite;
          color: var(--vscode-textLink-foreground) !important;
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }

        .error-message {
          color: var(--destructive);
          padding: 1em;
          background: var(--destructive-foreground);
          border-radius: 8px;
          border: 1px solid var(--destructive);
        }

        .error-container {
          text-align: center;
          padding: 2em;
          background: ${vsCodeTheme.editorBackground};
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin: 2em auto;
          border: 1px solid var(--destructive);
        }
        
        .error-help {
          text-align: left;
          margin: 1.5em 0;
          padding: 1em;
          background-color: rgba(var(--destructive-rgb), 0.1);
          border-radius: 6px;
        }
        
        .error-help ul {
          margin-bottom: 1.5em;
        }
      `}</style>
    </div>
  );
};

export default RoadmapContentView; 