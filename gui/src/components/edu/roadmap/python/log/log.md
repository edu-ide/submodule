---

# 📘 1권 2부 9장: 로깅과 테스트 자동화

## 📌 목차
9.1 로깅(logging) 개념 및 사용법  
9.2 테스트 자동화 개념  
9.3 unittest를 사용한 단위 테스트  
9.4 pytest를 사용한 심화 테스트  
9.5 코드 커버리지 분석  

## 9.1 로깅(logging) 개념 및 사용법

### ✅ 9.1.1 로깅의 중요성
1. **디버깅 용이성**
   - 실시간 문제 추적
   - 오류 원인 분석
   - 성능 모니터링
2. **운영 관리**
   - 시스템 상태 모니터링
   - 보안 감사
   - 사용자 행동 분석
3. **규정 준수**
   - 감사 추적
   - 데이터 변경 이력
   - 접근 기록

```python
import logging

# 로깅 기본 설정
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def process_data(data):
    """데이터 처리 함수 예시"""
    logger.debug(f"데이터 처리 시작: {data}")
    try:
        result = data * 2
        logger.info(f"처리 완료: {result}")
        return result
    except Exception as e:
        logger.error(f"처리 중 오류 발생: {e}", exc_info=True)
        raise
```

### ✅ 9.1.2 로그 레벨 상세 설명
| 레벨      | 값  | 사용 시점                     |
|-----------|-----|-------------------------------|
| DEBUG     | 10  | 상세한 정보, 문제 해결용      |
| INFO      | 20  | 정상 동작 확인용             |
| WARNING   | 30  | 잠재적 문제 경고             |
| ERROR     | 40  | 오류 발생, 기능 동작 실패     |
| CRITICAL  | 50  | 시스템 중단 수준의 심각한 문제 |

## 9.2 테스트 자동화 개념

### ✅ 9.2.1 테스트 자동화의 이점
1. **품질 향상**
   - 버그 조기 발견
   - 회귀 테스트 용이
   - 일관된 테스트 수행
2. **개발 생산성**
   - 반복 작업 감소
   - 빠른 피드백
   - 리팩토링 안정성
3. **문서화 효과**
   - 코드 동작 방식 이해
   - 사용 예제 제공
   - 요구사항 명세

```python
# 테스트할 클래스 예제
class Calculator:
    def add(self, x, y):
        return x + y
    
    def subtract(self, x, y):
        return x - y
    
    def multiply(self, x, y):
        return x * y
    
    def divide(self, x, y):
        if y == 0:
            raise ValueError("0으로 나눌 수 없습니다")
        return x / y
```

### ✅ 9.2.2 테스트 종류
1. **단위 테스트 (Unit Test)**
   - 개별 함수/메서드 테스트
   - 독립적인 테스트
   - 빠른 실행 속도
2. **통합 테스트 (Integration Test)**
   - 여러 모듈 연동 테스트
   - 실제 환경과 유사
   - 외부 의존성 포함
3. **시스템 테스트 (System Test)**
   - 전체 시스템 테스트
   - 엔드투엔드 테스트
   - 사용자 시나리오

```python
import unittest

class TestCalculator(unittest.TestCase):
    def setUp(self):
        """각 테스트 전에 실행"""
        self.calc = Calculator()
    
    def test_add(self):
        """덧셈 테스트"""
        self.assertEqual(self.calc.add(2, 3), 5)
        self.assertEqual(self.calc.add(-1, 1), 0)
        self.assertEqual(self.calc.add(0, 0), 0)
    
    def test_divide(self):
        """나눗셈 테스트"""
        self.assertEqual(self.calc.divide(6, 2), 3)
        self.assertEqual(self.calc.divide(5, 2), 2.5)
        
        # 예외 테스트
        with self.assertRaises(ValueError):
            self.calc.divide(10, 0)
```

## 9.3 pytest를 사용한 고급 테스트

### ✅ 9.3.1 pytest 특징
1. **간결한 문법**
   - `assert` 문 사용
   - 자동 테스트 발견
   - 풍부한 실패 정보
2. **픽스처 (Fixture)**
   - 테스트 환경 설정
   - 재사용 가능
   - 의존성 주입
3. **파라미터화 테스트**
   - 여러 입력값 테스트
   - 코드 중복 감소
   - 테스트 케이스 확장

```python
import pytest

@pytest.fixture
def calculator():
    """Calculator 객체를 생성하는 픽스처"""
    return Calculator()

@pytest.mark.parametrize("x, y, expected", [
    (3, 5, 8),
    (-1, 1, 0),
    (0, 0, 0)
])
def test_add_parametrize(calculator, x, y, expected):
    """파라미터화된 덧셈 테스트"""
    assert calculator.add(x, y) == expected

def test_divide_by_zero(calculator):
    """0으로 나누기 예외 테스트"""
    with pytest.raises(ValueError):
        calculator.divide(10, 0)
```

## 9.4 테스트 커버리지

### ✅ 9.4.1 커버리지 측정
1. **라인 커버리지**
   - 실행된 코드 라인 수
   - 가장 기본적인 지표
   - 쉽게 이해 가능
2. **분기 커버리지**
   - `if/else` 분기 테스트
   - 조건문 검증
   - 논리적 경로 확인
3. **경로 커버리지**
   - 모든 실행 경로
   - 가장 완벽한 테스트
   - 구현 비용이 높음

```python
# coverage.py 사용 예제

'''
# 터미널에서 실행:
coverage run -m pytest test_calculator.py
coverage report
coverage html  # HTML 리포트 생성
'''

def complex_function(x):
    """커버리지 테스트를 위한 복잡한 함수"""
    if x < 0:
        return "음수"
    elif x == 0:
        return "영"
    else:
        if x % 2 == 0:
            return "짝수"
        else:
            return "홀수"

# 테스트 함수
def test_complex_function():
    assert complex_function(-1) == "음수"
    assert complex_function(0) == "영"
    assert complex_function(2) == "짝수"
    assert complex_function(3) == "홀수"
```

## 🎯 9장 실습 문제

### [실습 1] 로깅 시스템 구현
사용자 로그인 시스템에 로깅을 추가하는 프로그램을 작성하세요.
- 파일과 콘솔에 동시에 로그 출력
- 로그 레벨별 적절한 메시지 작성
- 예외 처리와 로깅 연동

```python
import logging
from datetime import datetime

class UserSystem:
    def __init__(self):
        self.logger = self._setup_logger()
        self.users = {}
    
    def _setup_logger(self):
        """로거 설정"""
        logger = logging.getLogger('user_system')
        logger.setLevel(logging.DEBUG)
        
        # 파일 핸들러
        fh = logging.FileHandler('user_system.log')
        fh.setLevel(logging.DEBUG)
        
        # 콘솔 핸들러
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        
        # 포맷터
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        fh.setFormatter(formatter)
        ch.setFormatter(formatter)
        
        logger.addHandler(fh)
        logger.addHandler(ch)
        
        return logger
    
    def register(self, username, password):
        """사용자 등록"""
        self.logger.debug(f"사용자 등록 시도: {username}")
        
        if username in self.users:
            self.logger.warning(f"이미 존재하는 사용자: {username}")
            raise ValueError("이미 존재하는 사용자입니다.")
        
        self.users[username] = {
            'password': password,
            'registered_at': datetime.now()
        }
        self.logger.info(f"사용자 등록 완료: {username}")
    
    def login(self, username, password):
        """로그인"""
        self.logger.debug(f"로그인 시도: {username}")
        
        if username not in self.users:
            self.logger.error(f"존재하지 않는 사용자: {username}")
            raise ValueError("사용자가 존재하지 않습니다.")
        
        if self.users[username]['password'] != password:
            self.logger.warning(f"잘못된 비밀번호: {username}")
            raise ValueError("비밀번호가 일치하지 않습니다.")
        
        self.logger.info(f"로그인 성공: {username}")
        return True

# 테스트
if __name__ == "__main__":
    user_system = UserSystem()
    
    try:
        user_system.register("alice", "password123")
        user_system.login("alice", "password123")
        user_system.login("bob", "wrong_password")  # 오류 발생
    except ValueError as e:
        print(f"오류: {e}")
```

---