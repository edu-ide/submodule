---

# 📘 로깅과 테스트 자동화 - pytest 고급 테스트

## 9.4 pytest를 사용한 고급 테스트

### ✅ 9.4.1 pytest 특징
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

### ✅ 9.4.2 pytest 고급 기능
1. **테스트 마커**
   - `@pytest.mark.slow`
   - `@pytest.mark.skip`
   - `@pytest.mark.xfail`
2. **플러그인 시스템**
   - pytest-cov (코드 커버리지)
   - pytest-mock (모킹)
   - pytest-django (Django 테스트)
3. **테스트 설정**
   - conftest.py
   - pytest.ini
   - 명령행 옵션 