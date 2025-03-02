---

# 📘 1권 2부 7장: 파일 및 데이터베이스 관리

## 📌 목차
7.1 CSV 및 JSON 파일 처리  
7.2 SQLite 데이터베이스 연결  
7.3 MySQL 및 PostgreSQL과 연동하기  
7.4 ORM (Object Relational Mapping) 개념 및 활용  

## 7.1 CSV 및 JSON 파일 처리

### ✅ 7.1.1 CSV 파일 다루기
CSV(Comma-Separated Values)는 데이터를 쉼표로 구분하여 저장하는 텍스트 파일 형식입니다.

**장점:**
- 간단한 데이터 구조
- Excel과 호환성이 좋음
- 텍스트 에디터로 읽기 가능

**주의사항:**
- `newline=''` 옵션 사용 (줄바꿈 문제 방지)
- 인코딩 설정 (한글 처리)
- 데이터 타입 변환 필요 (모든 값이 문자열로 읽힘)

```python
import csv

# CSV 파일 쓰기 예제
data = [
    ['이름', '나이', '도시'],
    ['Alice', 25, 'Seoul'],
    ['Bob', 30, 'Busan']
]

with open('data.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerows(data)

# CSV 파일 읽기 예제
with open('data.csv', 'r', encoding='utf-8') as file:
    reader = csv.reader(file)
    next(reader)  # 헤더 건너뛰기
    for row in reader:
        name, age, city = row
        print(f"{name}님은 {age}세이고 {city}에 살고 있습니다.")
```

### ✅ 7.1.2 JSON 파일 다루기
JSON은 데이터를 키-값 쌍으로 저장하는 텍스트 기반 형식입니다.

**특징:**
- 계층적 데이터 구조 표현 가능
- 웹 API에서 널리 사용
- 다양한 데이터 타입 지원 (문자열, 숫자, 불리언, 배열, 객체)

**주요 메서드:**
- `json.dump()`: Python 객체를 JSON 파일로 저장
- `json.load()`: JSON 파일을 Python 객체로 로드
- `json.dumps()`: Python 객체를 JSON 문자열로 변환
- `json.loads()`: JSON 문자열을 Python 객체로 변환

```python
import json

# JSON 데이터 생성
data = {
    'name': 'Alice',
    'age': 25,
    'city': 'Seoul',
    'hobbies': ['reading', 'swimming'],
    'has_license': True
}

# JSON 파일로 저장
with open('data.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, indent=4, ensure_ascii=False)

# JSON 파일 읽기
with open('data.json', 'r', encoding='utf-8') as file:
    loaded_data = json.load(file)
    print(f"이름: {loaded_data['name']}")
    print(f"취미: {', '.join(loaded_data['hobbies'])}")
```

## 7.2 SQLite 데이터베이스 연결

SQLite는 파일 기반의 경량 데이터베이스입니다.

**장점:**
- 설치가 필요 없음
- 파일 기반으로 동작
- 이식성이 좋음

**주요 개념:**
- Connection: 데이터베이스 연결 객체
- Cursor: SQL 명령을 실행하는 객체
- Transaction: 데이터베이스 작업 단위

```python
import sqlite3

# 데이터베이스 연결
def create_connection():
    try:
        conn = sqlite3.connect('example.db')
        return conn
    except sqlite3.Error as e:
        print(f"데이터베이스 연결 오류: {e}")
        return None

# 테이블 생성
def create_table(conn):
    try:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER,
                city TEXT
            )
        ''')
        conn.commit()
    except sqlite3.Error as e:
        print(f"테이블 생성 오류: {e}")

# 데이터 삽입
def insert_user(conn, name, age, city):
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (name, age, city) VALUES (?, ?, ?)",
            (name, age, city)
        )
        conn.commit()
    except sqlite3.Error as e:
        print(f"데이터 삽입 오류: {e}")

# 실행 예제
conn = create_connection()
if conn:
    create_table(conn)
    insert_user(conn, "Alice", 25, "Seoul")
    conn.close()
```

## 7.3 MySQL 및 PostgreSQL과 연동하기

### MySQL 연동
MySQL은 가장 널리 사용되는 오픈소스 관계형 데이터베이스입니다.

**설치 및 설정:**
1. MySQL 서버 설치
2. `mysql-connector-python` 패키지 설치
3. 데이터베이스 및 사용자 생성

```python
import mysql.connector

def connect_mysql():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="your_username",
            password="your_password",
            database="your_database"
        )
        return conn
    except mysql.connector.Error as e:
        print(f"MySQL 연결 오류: {e}")
        return None

# MySQL 연결 및 테이블 생성 예제
conn = connect_mysql()
if conn:
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            age INT,
            city VARCHAR(255)
        )
    ''')
    conn.close()
```

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

## 📌 7장 요약

### 1. CSV 및 JSON 파일 처리
- **CSV**: 쉼표로 구분된 데이터 형식
  - `csv.reader()`, `csv.writer()` 사용
  - 엑셀과 호환성이 좋음
- **JSON**: 키-값 쌍으로 구성된 데이터 형식
  - `json.dump()`, `json.load()` 사용
  - 웹 API에서 널리 사용

### 2. SQLite 데이터베이스
- 파일 기반의 경량 데이터베이스
- CRUD 연산 지원
- 트랜잭션 처리 가능

### 3. MySQL/PostgreSQL
- 클라이언트-서버 기반 데이터베이스
- 대규모 데이터 처리에 적합
- 보안 및 사용자 관리 기능

### 4. ORM
- 객체와 데이터베이스 매핑
- SQLAlchemy 활용
- SQL 없이 파이썬 코드로 데이터베이스 조작

### 💡 핵심 포인트
1. 데이터 형식에 따른 적절한 모듈 선택
2. 데이터베이스 연결 시 보안 고려
3. 트랜잭션 관리의 중요성
4. ORM을 통한 효율적인 데이터 관리

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

---