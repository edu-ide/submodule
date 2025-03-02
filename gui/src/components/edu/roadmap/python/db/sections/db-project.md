---

# 📘 파일 및 데이터베이스 관리 - 실습 프로젝트

## 🎯 7장 실습 문제

### [실습 1] 학생 성적 관리 시스템
CSV 파일을 사용하여 학생들의 성적을 관리하는 프로그램을 작성하세요.

```python
import csv

class StudentManager:
    def __init__(self, filename):
        self.filename = filename
        
    def add_student(self, name, korean, english, math):
        """학생 성적 추가"""
        with open(self.filename, 'a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([name, korean, english, math])
    
    def get_average(self):
        """전체 학생의 과목별 평균 계산"""
        with open(self.filename, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            next(reader)  # 헤더 건너뛰기
            scores = list(reader)
            
        if not scores:
            return None
            
        korean_avg = sum(float(score[1]) for score in scores) / len(scores)
        english_avg = sum(float(score[2]) for score in scores) / len(scores)
        math_avg = sum(float(score[3]) for score in scores) / len(scores)
        
        return {
            '국어': korean_avg,
            '영어': english_avg,
            '수학': math_avg
        }

# 테스트
manager = StudentManager('students.csv')
manager.add_student('홍길동', 90, 85, 95)
manager.add_student('김철수', 88, 92, 87)
averages = manager.get_average()
print('과목별 평균:', averages)
```

### [실습 2] 도서 관리 데이터베이스
SQLite를 사용하여 도서 관리 시스템을 구현하세요.

```python
import sqlite3

class LibraryDB:
    def __init__(self, db_name):
        self.conn = sqlite3.connect(db_name)
        self.create_table()
    
    def create_table(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT,
                year INTEGER,
                available BOOLEAN DEFAULT 1
            )
        ''')
        self.conn.commit()
    
    def add_book(self, title, author, year):
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT INTO books (title, author, year)
            VALUES (?, ?, ?)
        ''', (title, author, year))
        self.conn.commit()
    
    def search_books(self, keyword):
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT * FROM books
            WHERE title LIKE ? OR author LIKE ?
        ''', (f'%{keyword}%', f'%{keyword}%'))
        return cursor.fetchall()

# 테스트
library = LibraryDB('library.db')
library.add_book('파이썬 프로그래밍', '홍길동', 2023)
results = library.search_books('파이썬')
print('검색 결과:', results)
```

### [실습 3] ORM을 활용한 회원 관리
SQLAlchemy ORM을 사용하여 회원 관리 시스템을 구현하세요.

```python
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class Member(Base):
    __tablename__ = 'members'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True)
    join_date = Column(DateTime, default=datetime.now)
    
    def __repr__(self):
        return f"<Member(name='{self.name}', email='{self.email}')>"

class MemberManager:
    def __init__(self):
        self.engine = create_engine('sqlite:///members.db')
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
    
    def add_member(self, name, email):
        member = Member(name=name, email=email)
        self.session.add(member)
        self.session.commit()
    
    def get_all_members(self):
        return self.session.query(Member).all()

# 테스트
manager = MemberManager()
manager.add_member('홍길동', 'hong@example.com')
members = manager.get_all_members()
print('전체 회원:', members)
```

### 💡 실습 문제 해설

1. **학생 성적 관리 시스템**
   - CSV 파일을 사용하여 데이터 저장
   - 클래스를 활용한 구조적 설계
   - 예외 처리 포함

2. **도서 관리 데이터베이스**
   - SQLite를 사용한 영구 저장
   - CRUD 연산 구현
   - 검색 기능 구현

3. **ORM 회원 관리**
   - SQLAlchemy를 활용한 객체 지향적 설계
   - 데이터베이스 스키마 정의
   - 세션 관리

### 🚀 추가 도전 과제
1. 파일 입출력에 대한 예외 처리 추가
2. 데이터 유효성 검사 기능 구현
3. 백업 및 복구 기능 추가
4. 로깅 시스템 구현 