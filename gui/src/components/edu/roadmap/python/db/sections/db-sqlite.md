---

# 📘 파일 및 데이터베이스 관리 - SQLite 데이터베이스

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