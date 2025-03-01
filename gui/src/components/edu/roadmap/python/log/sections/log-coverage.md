---

# 📘 로깅과 테스트 자동화 - 코드 커버리지

## 9.5 코드 커버리지 측정

### ✅ 9.5.1 코드 커버리지란?
코드 커버리지는 소프트웨어 테스트가 소스 코드의 어느 부분까지 실행했는지 측정하는 지표입니다. 높은 커버리지는 코드가 테스트로 충분히 검증되었음을 의미합니다.

1. **커버리지 유형**
   - **라인 커버리지**: 실행된 코드 라인의 비율
   - **분기 커버리지**: 조건문의 모든 분기가 실행된 비율
   - **함수 커버리지**: 호출된 함수의 비율

2. **커버리지의 중요성**
   - 테스트 누락 부분 식별
   - 코드 품질 향상
   - 리팩토링 안전성 제공

### ✅ 9.5.2 Python의 coverage.py 사용법

```python
# 설치
# pip install coverage

# Calculator 클래스
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

# 테스트 파일 (test_calculator.py)
import unittest
from calculator import Calculator

class TestCalculator(unittest.TestCase):
    def setUp(self):
        self.calc = Calculator()
    
    def test_add(self):
        self.assertEqual(self.calc.add(3, 5), 8)
    
    def test_divide(self):
        self.assertEqual(self.calc.divide(10, 2), 5)
        with self.assertRaises(ValueError):
            self.calc.divide(10, 0)

# 커버리지 실행 명령어
# coverage run -m unittest test_calculator.py
# coverage report
# coverage html  # HTML 보고서 생성
```

### ✅ 9.5.3 커버리지 개선 전략
1. **테스트 케이스 추가**
   - 누락된 코드 경로 식별
   - 경계값 테스트 추가
   - 예외 상황 테스트
2. **불필요한 코드 제거**
   - 죽은 코드(Dead code) 식별
   - 중복 코드 리팩토링
3. **복잡한 함수 분할**
   - 단일 책임 원칙 적용
   - 테스트 용이성 향상 