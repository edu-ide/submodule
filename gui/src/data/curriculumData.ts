import { CurriculumItem } from '../types/curriculum';

export const CURRICULUM_DATA: CurriculumItem[] = [
  {
    id: 'frontend-basics',
    title: '프론트엔드 기초',
    description: 'HTML, CSS, JavaScript의 기초를 배웁니다.',
    category: 'frontend',
    difficulty: 'beginner',
    steps: [
      {
        title: '사전 요구사항',
        content: `# 프론트엔드 기초 학습을 위한 사전 요구사항

## 필요한 도구
- 텍스트 에디터 (VS Code 권장)
- 최신 웹 브라우저
- Git 기본 지식

## 기본 지식
- 컴퓨터 기초 활용 능력
- 인터넷 기본 개념 이해
- 파일 시스템 이해

## 개발 환경 설정
1. Node.js 설치
2. VS Code 설치
3. Git 설치`,
        completed: true
      },
      {
        title: '학습 목표',
        content: `# 프론트엔드 기초 학습 목표

## 주요 목표
1. HTML5 문서 구조화 능력 습득
2. CSS를 활용한 스타일링 마스터
3. JavaScript 기본 프로그래밍 이해

## 세부 목표
- 시맨틱 HTML 작성
- 반응형 웹 디자인 구현
- DOM 조작 방법 습득
- 이벤트 처리 이해
- 기본 알고리즘 구현

## 완료 조건
- 모든 실습 과제 제출
- 최종 프로젝트 완성
- 평가 테스트 통과`,
        completed: true
      },
      {
        title: '이론',
        content: `# 웹 개발 기초 이론

## HTML5
- 문서 구조
- 시맨틱 태그
- 폼과 입력
- 멀티미디어 요소

## CSS3
- 선택자와 속성
- 박스 모델
- Flexbox와 Grid
- 반응형 디자인

## JavaScript
- 변수와 데이터 타입
- 제어 구조
- 함수와 스코프
- 객체와 배열
- 비동기 프로그래밍`,
        completed: true
      },
      {
        title: '실습',
        content: `# 실습 과제

## 1. 포트폴리오 웹사이트 만들기
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>내 포트폴리오</title>
</head>
<body>
    <header>
        <h1>환영합니다!</h1>
    </header>
    <!-- 나머지 구조 구현 -->
</body>
</html>
\`\`\`

## 2. 반응형 네비게이션 구현
\`\`\`css
.nav {
    display: flex;
    justify-content: space-between;
}

@media (max-width: 768px) {
    .nav {
        flex-direction: column;
    }
}
\`\`\`

## 3. 동적 기능 추가
\`\`\`javascript
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav').classList.toggle('active');
});
\`\`\``,
        completed: false
      },
      {
        title: '연습 문제',
        content: `# 연습 문제

## HTML/CSS 문제
1. 다음 마크업을 시맨틱 태그를 사용하여 수정하세요.
2. Flexbox를 사용하여 3단 레이아웃을 구현하세요.
3. 미디어 쿼리를 사용하여 모바일 대응을 해보세요.

## JavaScript 문제
1. 배열의 모든 요소 합계를 구하는 함수를 작성하세요.
\`\`\`javascript
function sum(arr) {
    // 여기에 코드를 작성하세요
}
\`\`\`

2. DOM을 조작하여 동적으로 리스트를 생성하세요.
\`\`\`javascript
function createList(items) {
    // 여기에 코드를 작성하세요
}
\`\`\`

## 도전 과제
- 로컬 스토리지를 사용한 할 일 목록 만들기
- 드래그 앤 드롭 기능 구현
- AJAX를 사용한 데이터 로딩`,
        completed: false
      },
      {
        title: '평가',
        content: `# 프론트엔드 기초 평가

        아래의 평가를 통해 프론트엔드 기초 과정에서 배운 내용을 확인해보세요.

        평가를 시작하려면 "평가 시작하기" 버튼을 클릭하세요.`,
        completed: false,
        evaluation: {
          timeLimit: 30,
          questions: [
            {
              id: 'q1',
              type: 'multiple-choice',
              question: 'HTML에서 시맨틱 태그의 주요 목적은 무엇인가요?',
              options: [
                '웹페이지를 예쁘게 꾸미기 위해',
                '검색 엔진 최적화(SEO)를 위해',
                '자바스크립트 코드를 쉽게 작성하기 위해',
                'CSS 스타일링을 쉽게 하기 위해'
              ],
              correctAnswer: '검색 엔진 최적화(SEO)를 위해'
            },
            {
              id: 'q2',
              type: 'essay',
              question: 'CSS Flexbox와 Grid의 주요 차이점을 설명하세요.',
            }
          ]
        }
      },
      {
        title: '코딩 과제',
        content: `# 코딩 과제: To-Do List 구현하기

        아래의 요구사항에 맞춰 간단한 To-Do List를 구현해보세요.`,
        completed: false,
        codingTask: {
          description: '간단한 To-Do List 웹 애플리케이션을 구현합니다.',
          requirements: [
            'index.html 파일에 기본 UI 구현',
            'style.css 파일에 스타일 정의',
            'script.js 파일에 To-Do List 기능 구현',
            '할 일 추가/삭제/완료 기능 구현',
            '로컬 스토리지를 사용하여 데이터 유지'
          ],
          initialFiles: {
            'index.html': `<!DOCTYPE html>
<html>
<head>
    <title>To-Do List</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- 여기에 UI 구현 -->
    <script src="script.js"></script>
</body>
</html>`,
            'style.css': `/* 여기에 스타일 작성 */`,
            'script.js': `// 여기에 JavaScript 코드 작성`
          },
          expectedFiles: ['index.html', 'style.css', 'script.js']
        }
      }
    ]
  },
  {
    id: 'react-basics',
    title: 'React 기초',
    description: 'React의 기본 개념과 사용법을 배웁니다.',
    category: 'frontend',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'React 소개',
        content: `# React 소개\n\n## React란?\nReact는 사용자 인터페이스를 만들기 위한 자바스크립트 라이브러리입니다...`,
        completed: true
      },
      {
        title: 'Component 기초',
        content: `# Component 기초\n\n## Component란?\nComponent는 React에서 재사용 가능한 UI 조각입니다...`,
        completed: false
      },
      {
        title: 'Props와 State',
        content: `# Props와 State\n\n## Props와 State란?\nProps는 부모 컴포넌트에서 자식 컴포넌트로 전달되는 데이터입니다...`,
        completed: false
      }
    ]
  },
  {
    id: 'nodejs-basics',
    title: 'Node.js 기초',
    description: 'Node.js의 기본 개념과 사용법을 배웁니다.',
    category: 'backend',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Node.js 소개',
        content: `# Node.js 소개\n\n## Node.js란?\nNode.js는 Chrome V8 JavaScript 엔진으로 구축된 JavaScript 런타임입니다...`,
        completed: false
      },
      {
        title: 'npm 사용하기',
        content: `# npm 사용하기\n\n## npm이란?\nnpm은 Node.js의 패키지 관리자입니다...`,
        completed: false
      },
      {
        title: '비동기 프로그래밍',
        content: `# 비동기 프로그래밍\n\n## 비동기 프로그래밍이란?\n비동기 프로그래밍은 작업을 병렬로 처리할 수 있게 해주는 프로그래밍 방식입니다...`,
        completed: false
      }
    ]
  },
  {
    id: 'database-basics',
    title: '데이터베이스 기초',
    description: 'SQL과 데이터베이스 기본 개념을 배웁니다.',
    category: 'backend',
    difficulty: 'beginner',
    steps: [
      {
        title: 'DB 소개',
        content: `# 데이터베이스 소개\n\n## 데이터베이스란?\n데이터베이스는 구조화된 데이터의 집합입니다...`,
        completed: true
      },
      {
        title: 'SQL 기초',
        content: `# SQL 기초\n\n## SQL이란?\nSQL은 데이터베이스를 관리하기 위한 표준 언어입니다...`,
        completed: false
      },
      {
        title: '테이블 설계',
        content: `# 테이블 설계\n\n## 테이블 설계란?\n데이터베이스 테이블을 효율적으로 구성하는 방법을 배웁니다...`,
        completed: false
      },
      {
        title: '고급 쿼리',
        content: `# 고급 쿼리\n\n## 고급 SQL 쿼리\n복잡한 데이터를 효율적으로 조회하는 방법을 배웁니다...`,
        completed: false
      }
    ]
  }
];
