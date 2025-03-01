---

# 📘 파일 및 데이터베이스 관리 - MySQL 및 PostgreSQL 연동

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