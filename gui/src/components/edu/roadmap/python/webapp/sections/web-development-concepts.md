---

# 📘 13.1 웹 개발의 핵심 구성 요소

## ✅ 13.1.1 웹 애플리케이션 아키텍처

웹 애플리케이션은 일반적으로 다음 세 가지 주요 구성 요소로 이루어집니다:

1. **프론트엔드**
   - HTML: 웹 페이지 구조
   - CSS: 스타일링
   - JavaScript: 동적 기능

2. **백엔드**
   - 서버 로직
   - 데이터 처리
   - API 구현

3. **데이터베이스**
   - 데이터 저장
   - 쿼리 처리
   - 데이터 관리

웹 애플리케이션의 기본 구조를 이해하는 것은 효율적인 웹 개발의 첫 번째 단계입니다.

## ✅ 13.1.2 클라이언트-서버 모델

웹 애플리케이션은 클라이언트-서버 모델을 기반으로 작동합니다:

1. **클라이언트**: 사용자가 상호작용하는 인터페이스 (브라우저, 모바일 앱 등)
2. **서버**: 요청을 처리하고 응답을 생성하는 시스템

HTTP(Hypertext Transfer Protocol)는
클라이언트와 서버 간의 통신을 담당합니다.

## ✅ 13.1.3 HTTP 요청과 응답 사이클

HTTP 통신의 기본 메커니즘을 이해해야 합니다:

1. **요청 메서드**: GET, POST, PUT, DELETE 등
2. **응답 상태 코드**: 200(성공), 404(찾을 수 없음), 500(서버 오류) 등
3. **헤더**: 요청/응답에 대한 메타데이터
4. **본문**: 전송되는 실제 데이터

## ✅ 13.1.4 MVC/MVT 패턴

웹 애플리케이션 설계에 널리 사용되는 아키텍처 패턴:

1. **MVC (Model-View-Controller)**
   - Model: 데이터와 비즈니스 로직
   - View: 사용자 인터페이스
   - Controller: 모델과 뷰 사이의 중재자

2. **MVT (Model-View-Template)** - Django에서 사용
   - Model: 데이터와 비즈니스 로직
   - View: 비즈니스 로직 (컨트롤러 역할)
   - Template: 사용자 인터페이스

```python
# Flask 기본 설정 예제
from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
db = SQLAlchemy(app)

class User(db.Model):
    """사용자 모델"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

@app.route('/')
def home():
    """홈페이지 라우트"""
    return render_template('index.html')

@app.route('/api/users')
def get_users():
    """사용자 목록 API"""
    users = User.query.all()
    return jsonify([{'username': user.username, 'email': user.email} for user in users])
```

## ✅ 13.1.5 RESTful 웹 서비스 원칙

REST(Representational State Transfer) 아키텍처 스타일의 핵심 원칙:

1. **자원 기반 상호작용**: URL은 자원을 식별
2. **HTTP 메서드 의미 활용**: GET(조회), POST(생성), PUT(수정), DELETE(삭제)
3. **무상태 통신**: 각 요청은 독립적으로 처리
4. **균일한 인터페이스**: 일관된 방식으로 자원에 접근

## ✅ 13.1.6 웹 보안 기초

웹 애플리케이션 개발 시 고려해야 할 주요 보안 사항:

1. **인증과 권한**: 사용자 신원 확인 및 접근 제어
2. **입력 검증**: SQL 인젝션, XSS 공격 방지
3. **CSRF 보호**: 사이트 간 요청 위조 방지
4. **HTTPS 사용**: 통신 암호화
5. **비밀번호 해싱**: 사용자 비밀번호 보호

--- 

# 1.3.1 웹 개발 개념 및 기본 원리

웹 애플리케이션 개발을 위한 핵심 개념과 아키텍처를 이해하면 효율적인 개발이 가능합니다. 이 섹션에서는 웹 개발의 기초를 학습합니다.

## 1.3.1.1 웹 애플리케이션 아키텍처

웹 애플리케이션은 다양한 구성 요소로 이루어져 있으며, 이들이 어떻게 상호작용하는지 이해하는 것이 중요합니다.

### 주요 구성 요소

- **프론트엔드(Frontend)**: 사용자 인터페이스와 클라이언트 측 로직
  - HTML: 웹 페이지의 구조 정의
  - CSS: 웹 페이지의 스타일과 레이아웃 정의
  - JavaScript: 동적 기능과 사용자 상호작용 구현
  
- **백엔드(Backend)**: 서버 측 로직과 데이터 처리
  - 서버: 클라이언트 요청을 처리하고 응답 생성 (Python, Flask, Django 등)
  - 데이터베이스: 데이터 저장 및 관리 (MySQL, PostgreSQL, MongoDB 등)
  - API: 클라이언트와 서버 간 데이터 교환을 위한 인터페이스

### 웹 애플리케이션 구조 예시

```
웹 애플리케이션
├── 프론트엔드
│   ├── HTML (구조)
│   ├── CSS (스타일)
│   └── JavaScript (기능)
└── 백엔드
    ├── 웹 서버 (Nginx, Apache)
    ├── 애플리케이션 서버 (Flask, Django)
    └── 데이터베이스 (MySQL, PostgreSQL)
```

## 1.3.1.2 클라이언트-서버 모델

웹은 기본적으로 클라이언트-서버 모델을 따르며, 이는 웹의 기본 동작 방식을 이해하는 핵심입니다.

### 클라이언트-서버 통신 과정

1. **클라이언트**: 사용자가 웹 브라우저를 통해 서버에 요청을 보냄
2. **서버**: 요청을 처리하고 적절한 응답을 생성
3. **클라이언트**: 서버로부터 받은 응답을 처리하여 사용자에게 표시

### 예시: 웹 페이지 요청 과정

```python
# 클라이언트-서버 통신을 보여주는 간단한 Python 예시
import requests

# 클라이언트가 서버에 요청을 보냄
response = requests.get('https://example.com')

# 서버 응답 상태 확인
print(f"상태 코드: {response.status_code}")

# 서버 응답 내용 확인
print(f"응답 내용 일부: {response.text[:100]}...")
```

## 1.3.1.3 HTTP 요청과 응답 사이클

HTTP(Hypertext Transfer Protocol)는 웹에서 데이터를 주고받는 프로토콜로, 클라이언트와 서버 간의 통신을 정의합니다.

### HTTP 요청 방식 (Methods)

- **GET**: 리소스 조회 (데이터 요청)
- **POST**: 리소스 생성 (데이터 제출)
- **PUT**: 리소스 수정 (전체 업데이트)
- **PATCH**: 리소스 일부 수정 (부분 업데이트)
- **DELETE**: 리소스 삭제

### HTTP 상태 코드

- **1xx**: 정보 응답
- **2xx**: 성공 응답 (200 OK, 201 Created)
- **3xx**: 리다이렉션 (301 Moved Permanently)
- **4xx**: 클라이언트 오류 (404 Not Found, 403 Forbidden)
- **5xx**: 서버 오류 (500 Internal Server Error)

### Python으로 HTTP 요청 보내기

```python
import requests

# GET 요청
response = requests.get('https://api.example.com/users')
print(f"GET 응답: {response.status_code}")

# POST 요청 (새로운 사용자 생성)
new_user = {"name": "홍길동", "email": "hong@example.com"}
response = requests.post('https://api.example.com/users', json=new_user)
print(f"POST 응답: {response.status_code}")

# PUT 요청 (사용자 정보 업데이트)
updated_user = {"name": "홍길동", "email": "newhong@example.com"}
response = requests.put('https://api.example.com/users/123', json=updated_user)
print(f"PUT 응답: {response.status_code}")

# DELETE 요청 (사용자 삭제)
response = requests.delete('https://api.example.com/users/123')
print(f"DELETE 응답: {response.status_code}")
```

## 1.3.1.4 MVC/MVT 패턴

웹 애플리케이션은 일반적으로 코드를 구조화하기 위한 설계 패턴을 사용합니다. 가장 일반적인 패턴은 MVC(Model-View-Controller)와 Django에서 사용하는 MVT(Model-View-Template)입니다.

### MVC 패턴 (Model-View-Controller)

- **모델(Model)**: 데이터와 비즈니스 로직 처리
- **뷰(View)**: 사용자 인터페이스와 데이터 표현
- **컨트롤러(Controller)**: 모델과 뷰 사이의 중개자 역할, 사용자 입력 처리

### MVT 패턴 (Model-View-Template, Django)

- **모델(Model)**: 데이터와 비즈니스 로직 (MVC의 모델과 동일)
- **뷰(View)**: 사용자 요청 처리 및 응답 생성 (MVC의 컨트롤러와 유사)
- **템플릿(Template)**: 사용자 인터페이스와 데이터 표현 (MVC의 뷰와 유사)

### MVC와 MVT 비교

| 요소 | MVC 패턴 | MVT 패턴 (Django) |
|------|---------|-----------------|
| 데이터 관리 | Model | Model |
| 비즈니스 로직 | Controller | View |
| 데이터 표현 | View | Template |

### MVC 패턴 예시 (Flask)

```python
# model.py - 데이터 관리
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    @staticmethod
    def get_all_users():
        # 데이터베이스에서 사용자 가져오기
        return [User("홍길동", "hong@example.com"), User("김철수", "kim@example.com")]

# controller.py - 비즈니스 로직
from flask import render_template
from model import User

def user_list():
    users = User.get_all_users()
    return render_template('users.html', users=users)

# view (템플릿) - users.html
# <ul>
#   {% for user in users %}
#     <li>{{ user.name }} ({{ user.email }})</li>
#   {% endfor %}
# </ul>
```

### MVT 패턴 예시 (Django)

```python
# models.py - 데이터 관리
from django.db import models

class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

# views.py - 비즈니스 로직 (컨트롤러 역할)
from django.shortcuts import render
from .models import User

def user_list(request):
    users = User.objects.all()
    return render(request, 'users.html', {'users': users})

# templates/users.html - 템플릿 (뷰 역할)
# <ul>
#   {% for user in users %}
#     <li>{{ user.name }} ({{ user.email }})</li>
#   {% endfor %}
# </ul>
```

웹 개발의 기본 개념과 아키텍처를 이해하면 Python 기반 웹 프레임워크인 Flask와 Django를 사용하여 효율적인 웹 애플리케이션을 구축할 수 있습니다. 다음 섹션에서는 Flask를 사용한 웹 애플리케이션 개발에 대해 자세히 알아보겠습니다.
