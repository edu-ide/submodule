import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRICULUM_DATA } from '../../data/curriculumData';

const CurriculumList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="curriculum-list">
      <h1>커리큘럼 목록</h1>
      
      <div className="items-grid">
        {CURRICULUM_DATA.map(item => (
          <div 
            key={item.id} 
            className="item-card"
            onClick={() => navigate(`/education/curriculum/${item.id}`)}
          >
            <div className="item-title">{item.title}</div>
            <div className="item-description">{item.description}</div>
            <div className="item-meta">
              <span className="difficulty">{item.difficulty}</span>
              <span className="duration">{item.duration}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* 스타일은 기존 스타일을 활용 */}
    </div>
  );
};

export default CurriculumList; 