import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { setSelectedLanguage } from '../../redux/slices/languageSlice';
import { useLanguage } from './EducationLayout';

// 다국어 텍스트 정의
const translations = {
  ko: {
    welcome: '에듀센스 플랫폼에 오신 것을 환영합니다',
    selectLanguage: '프로그래밍 언어 선택',
    curriculum: {
      title: '커리큘럼',
      description: '단계별 학습 가이드를 통해 새로운 기술을 배워보세요.'
    },
    roadmap: {
      title: '로드맵',
      description: '체계적인 학습 경로를 통해 프로그래밍 기술을 마스터하세요.'
    }
  },
  en: {
    welcome: 'Welcome to the EduSense Platform',
    selectLanguage: 'Select Programming Language',
    curriculum: {
      title: 'Curriculum',
      description: 'Learn new skills through step-by-step learning guides.'
    },
    roadmap: {
      title: 'Roadmap',
      description: 'Master programming skills through a systematic learning path.'
    }
  },
  ja: {
    welcome: 'エデュセンスプラットフォームへようこそ',
    selectLanguage: 'プログラミング言語を選択',
    curriculum: {
      title: 'カリキュラム',
      description: 'ステップバイステップの学習ガイドで新しいスキルを習得しましょう。'
    },
    roadmap: {
      title: 'ロードマップ',
      description: '体系的な学習パスでプログラミングスキルをマスターしましょう。'
    }
  },
  zh: {
    welcome: '欢迎使用教育感知平台',
    selectLanguage: '选择编程语言',
    curriculum: {
      title: '课程',
      description: '通过分步学习指南学习新技能。'
    },
    roadmap: {
      title: '学习路线图',
      description: '通过系统的学习路径掌握编程技能。'
    }
  }
};

// 프로그래밍 언어 표시 이름
const programmingLanguageNames = {
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#'
};

const EducationHome: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const selectedProgrammingLanguage = useSelector((state: RootState) => state.language.selectedLanguage) || 'python';
  
  // 현재 언어에 맞는 텍스트 선택
  const text = translations[language] || translations.ko;
  
  // 프로그래밍 언어 변경 핸들러
  const handleProgrammingLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    dispatch(setSelectedLanguage(newLanguage));
  };
  
  return (
    <div className="education-home">
      <h1>{text.welcome}</h1>
      
      <div className="language-selection">
        <h2>{text.selectLanguage}</h2>
        <div className="language-options">
          {Object.entries(programmingLanguageNames).map(([key, name]) => (
            <div 
              key={key}
              className={`language-option ${selectedProgrammingLanguage === key ? 'selected' : ''}`}
              onClick={() => dispatch(setSelectedLanguage(key))}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
      
      <div className="education-cards">
        <div 
          className="education-card"
          onClick={() => navigate('/education/curriculum')}
        >
          <div className="card-icon">
            <span className="codicon codicon-book"></span>
          </div>
          <h2>{text.curriculum.title}</h2>
          <p>{text.curriculum.description}</p>
        </div>
        
        <div 
          className="education-card"
          onClick={() => navigate('/education/roadmap')}
        >
          <div className="card-icon">
            <span className="codicon codicon-map"></span>
          </div>
          <h2>{text.roadmap.title}</h2>
          <p>{text.roadmap.description}</p>
        </div>
      </div>
      
      <style jsx>{`
        .education-home {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          font-size: 24px;
          margin-bottom: 24px;
          text-align: center;
        }
        
        .language-selection {
          margin-bottom: 32px;
          text-align: center;
        }
        
        .language-selection h2 {
          font-size: 18px;
          margin-bottom: 16px;
        }
        
        .language-options {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .language-option {
          padding: 8px 16px;
          border: 2px solid var(--vscode-button-background);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .language-option:hover {
          background-color: var(--vscode-button-hoverBackground);
          color: var(--vscode-button-foreground);
        }
        
        .language-option.selected {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }
        
        .education-cards {
          display: flex;
          gap: 24px;
          justify-content: center;
        }
        
        .education-card {
          background-color: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          padding: 24px;
          width: 300px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .education-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .card-icon {
          font-size: 32px;
          margin-bottom: 16px;
          text-align: center;
        }
        
        h2 {
          font-size: 18px;
          margin-bottom: 8px;
          text-align: center;
        }
        
        p {
          color: var(--vscode-descriptionForeground);
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default EducationHome; 