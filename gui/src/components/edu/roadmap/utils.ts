import { LearningContent, NodeData } from './types';
import learningContentsData from './data/learningContents.json';

// 학습 콘텐츠 가져오기
export const getLearningContent = (nodeId: string): LearningContent | null => {
  const content = learningContentsData[nodeId as keyof typeof learningContentsData];
  
  if (!content) {
    // 콘텐츠가 없는 경우 기본 콘텐츠 생성
    return null;
  }
  
  return content as LearningContent;
};

// 기본 학습 콘텐츠 생성 (JSON에 없을 경우 사용)
export const generateLearningContent = (nodeData: NodeData): LearningContent => {
  return {
    title: nodeData.title,
    introduction: `${nodeData.description} 이 섹션에서는 ${nodeData.title}에 대한 기본 개념과 중요성을 배우게 됩니다.`,
    theory: `# ${nodeData.title} 이론\n\n${nodeData.title}은(는) 프로그래밍에서 중요한 개념입니다. ${nodeData.status === 'completed' ? '이미 학습한 내용을 복습해봅시다.' : '자세히 알아보겠습니다.'}\n\n## 핵심 개념\n\n- ${nodeData.title}의 기본 원리\n- 활용 사례\n- 주의사항`,
    examples: [
      {
        title: '기본 예제',
        code: `# ${nodeData.title} 예제 코드\ndef example():\n    print("이것은 ${nodeData.title} 예제입니다.")\n    \nexample()`,
        explanation: '위 코드는 기본적인 예제를 보여줍니다.'
      },
      {
        title: '응용 예제',
        code: `# 응용 예제\nimport random\n\ndef advanced_example():\n    value = random.randint(1, 10)\n    print(f"랜덤 값: {value}")\n    \nadvanced_example()`,
        explanation: '응용 예제에서는 라이브러리를 활용한 방법을 보여줍니다.'
      }
    ],
    practice: {
      question: `${nodeData.title}을(를) 활용하여 다음 문제를 해결해보세요.`,
      hints: ['힌트 1', '힌트 2'],
      solution: `# 솔루션 코드\ndef solution():\n    print("이것은 ${nodeData.title}의 솔루션입니다.")\n    \nsolution()`
    },
    quiz: [
      {
        question: `${nodeData.title}에 관한 다음 설명 중 옳은 것은?`,
        options: ['옵션 1', '옵션 2', '옵션 3', '옵션 4'],
        answer: 2,
        explanation: '정답에 대한 설명입니다.'
      }
    ],
    resources: [
      {
        title: '공식 문서',
        url: 'https://docs.python.org/ko/3/',
        type: 'article'
      },
      {
        title: '관련 튜토리얼',
        url: 'https://www.youtube.com/watch?v=example',
        type: 'video'
      }
    ]
  };
}; 