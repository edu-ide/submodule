---

# 📘 A.4 파이썬 코딩 스타일 가이드

## ✅ A.4.1 PEP 8 스타일 가이드

Python 코드를 작성할 때 지켜야 할 표준 코딩 스타일인 PEP 8(Python Enhancement Proposal 8)의 주요 내용입니다.

1. **들여쓰기와 공백**
   - 들여쓰기는 스페이스 4칸 사용
   - 줄 길이는 최대 79자
   - 긴 표현식의 줄바꿈은 괄호 안에서

2. **명명 규칙**
   - 클래스명: `CamelCase`
   - 함수/변수/메서드: `lowercase_with_underscores`
   - 상수: `UPPERCASE_WITH_UNDERSCORES`
   - 비공개 속성/메서드: `_single_leading_underscore`
   - 내부 속성/메서드: `__double_leading_underscore`

3. **코드 레이아웃**
   - 최상위 함수/클래스 사이에 빈 줄 2개
   - 클래스 내 메서드 사이에 빈 줄 1개
   - 함수 내 논리적 섹션 사이에 빈 줄 1개

```python
# PEP 8 준수 예시
class MyClass:
    """클래스 문서화 문자열은 항상 작성합니다."""
    
    def __init__(self, value):
        self.value = value
        self._private_value = None
    
    def get_value(self):
        """함수 문서화 문자열을 작성합니다."""
        return self.value
    
    def _internal_method(self):
        # 내부적으로만 사용되는 메서드
        return self._private_value

# 함수 정의 전후로 빈 줄 2개
def calculate_something(a, b, c=0):
    """함수의 설명 작성"""
    result = a + b + c
    
    # 논리적 섹션을 구분하는 빈 줄
    if result > 100:
        return "큰 값"
    
    return "작은 값"


# 상수는 대문자로
MAX_SIZE = 100
DEFAULT_NAME = "default"
```

## ✅ A.4.2 코드 문서화

코드를 효과적으로 문서화하기 위한 Docstring 작성법과 가이드라인입니다.

1. **Docstring 형식**
   - Google Style
   - NumPy/SciPy Style
   - reStructuredText(reST) Style

```python
# Google Style Docstring 예시
def fetch_data(url, timeout=30, retry=3):
    """외부 API로부터 데이터를 가져옵니다.
    
    특정 URL에서 데이터를 가져오며, 실패 시 재시도합니다.
    
    Args:
        url (str): 데이터를 가져올 API 엔드포인트 URL
        timeout (int, optional): 요청 타임아웃 시간(초). 기본값: 30
        retry (int, optional): 실패 시 재시도 횟수. 기본값: 3
    
    Returns:
        dict: 가져온 데이터를 포함하는 사전
    
    Raises:
        ConnectionError: 서버 연결에 실패한 경우
        ValueError: 응답 형식이 올바르지 않은 경우
    
    Examples:
        >>> data = fetch_data('https://api.example.com/data')
        >>> print(data['status'])
        'success'
    """
    # 함수 구현 부분
```

## ✅ A.4.3 코드 리팩토링 가이드

기존 코드를 개선하기 위한 리팩토링 기법들입니다.

```python
# 리팩토링 전
def process_data(data):
    result = []
    for item in data:
        if item > 0:
            result.append(item * 2)
    return result

# 리팩토링 후 (리스트 컴프리헨션 활용)
def process_data(data):
    return [item * 2 for item in data if item > 0]

# 리팩토링 전
def get_user_info(user_id):
    user = db.query(f"SELECT * FROM users WHERE id = {user_id}")
    if user:
        name = user[0]
        email = user[1]
        age = user[2]
        return {"name": name, "email": email, "age": age}
    else:
        return None

# 리팩토링 후 (함수 분리 및 보안 개선)
def get_user_by_id(user_id):
    """안전한 방식으로 사용자 정보를 조회합니다."""
    query = "SELECT name, email, age FROM users WHERE id = %s"
    return db.query(query, (user_id,))

def format_user_info(user_data):
    """사용자 데이터를 형식화합니다."""
    if not user_data:
        return None
    
    return {
        "name": user_data[0],
        "email": user_data[1],
        "age": user_data[2]
    }

def get_user_info(user_id):
    """사용자 ID로 정보를 조회하고 형식화합니다."""
    user_data = get_user_by_id(user_id)
    return format_user_info(user_data)
```

--- 