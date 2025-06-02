import { useState, useEffect, useCallback } from 'react';
import { fetchRoadmapContent, fetchRoadmapData } from '../constants';
import { useDispatch } from 'react-redux';
import { setHeaderInfo, setBottomMessage } from '../../../../redux/slices/uiStateSlice';
import React from 'react';

interface ContentData {
  title: string;
  description: string;
  content: string;
  order: string;
  prerequisites: string[];
}

interface UseRoadmapContentProps {
  roadmapId: string | undefined;
  contentId: string | undefined;
}

/**
 * 로드맵 콘텐츠를 로드하는 훅
 */
export const useRoadmapContent = ({ roadmapId, contentId }: UseRoadmapContentProps) => {
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [realContentId, setRealContentId] = useState<string | null>(null);
  const [contentSection, setContentSection] = useState<string | null>(null);
  const dispatch = useDispatch();
  
  // 데이터 검증 함수
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
  
  // contentId가 실제 ID인지 타이틀인지 확인하고 실제 ID를 설정하는 함수
  const determineRealContentId = useCallback(async (contentIdParam: string | undefined) => {
    if (!contentIdParam || !roadmapId) return null;
    
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
        }
      });
      
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

  // realContentId가 결정되면 콘텐츠 로드
  useEffect(() => {
    const loadContent = async () => {
      if (!realContentId || !roadmapId) {
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
          React.createElement('div', null, 
            '콘텐츠 로드 실패',
            React.createElement('br'),
            `ID: ${realContentId}`,
            React.createElement('br'),
            `오류: ${errorMessage}`
          )
        ));
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [realContentId, dispatch, roadmapId]);

  // ID를 타이틀로 변환하는 함수
  const getNodeTitleForUrl = async (nodeId: string) => {
    if (!roadmapId) return nodeId;
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

  // 다음 콘텐츠 ID 가져오기
  const getNextContentId = async () => {
    if (!roadmapId || !contentData || !contentData.order) return null;
    
    try {
      const roadmapContent = await fetchRoadmapContent(roadmapId);
      const roadmapData = await fetchRoadmapData(roadmapId);
      const currentOrder = contentData.order;
      
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
        return nextContentId;
      }
      
      return null;
    } catch (error) {
      console.error('다음 콘텐츠 조회 실패:', error);
      return null;
    }
  };

  // 이전 콘텐츠 ID 가져오기
  const getPrevContentId = async () => {
    if (!roadmapId || !contentData || !contentData.order) return null;
    
    try {
      const roadmapContent = await fetchRoadmapContent(roadmapId);
      const roadmapData = await fetchRoadmapData(roadmapId);
      const currentOrder = contentData.order;
      
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
        return prevContentId;
      }
      
      return null;
    } catch (error) {
      console.error('이전 콘텐츠 조회 실패:', error);
      return null;
    }
  };

  return {
    contentData,
    isLoading,
    error,
    realContentId,
    contentSection,
    setContentSection,
    getNodeTitleForUrl,
    getNextContentId,
    getPrevContentId
  };
};

export default useRoadmapContent; 