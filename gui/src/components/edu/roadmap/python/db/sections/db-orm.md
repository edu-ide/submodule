---

# 📘 파일 및 데이터베이스 관리 - ORM 개념 및 활용

## 7.4 ORM (Object Relational Mapping)

ORM은 객체지향 프로그래밍의 클래스와 관계형 데이터베이스를 연결해주는 기술입니다.

**장점:**
- SQL 쿼리 직접 작성 불필요
- 객체지향적인 코드 작성
- 데이터베이스 변경 용이

**SQLAlchemy 특징:**
- Python에서 가장 인기있는 ORM
- 다양한 데이터베이스 지원
- 강력한 쿼리 빌더 제공

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 기본 클래스 생성
Base = declarative_base()

# 모델 정의
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    age = Column(Integer)
    city = Column(String(50))
    
    def __repr__(self):
        return f"<User(name='{self.name}', age={self.age}, city='{self.city}')>"

# 데이터베이스 엔진 생성
engine = create_engine('sqlite:///orm_example.db')
Base.metadata.create_all(engine)

# 세션 생성
Session = sessionmaker(bind=engine)
session = Session()

# 데이터 추가 예제
new_user = User(name='Alice', age=25, city='Seoul')
session.add(new_user)
session.commit()

# 데이터 조회 예제
users = session.query(User).filter(User.age >= 20).all()
for user in users:
    print(user)
``` 