---

# 🎯 6장 실습 문제

### [실습 1] 사용자 정의 모듈 만들기
수학 연산을 수행하는 사용자 정의 모듈을 만들고 사용해보세요.

1. `math_tools.py` 파일 생성
2. `square()`와 `cube()` 함수 구현
3. 다른 파일에서 모듈 import
4. 함수 실행 및 결과 확인

```python
# math_tools.py 파일 내용
def square(n):
    """숫자의 제곱을 반환하는 함수"""
    return n ** 2

def cube(n):
    """숫자의 세제곱을 반환하는 함수"""
    return n ** 3
```

```python
# 모듈 사용 예제
import math_tools

# 제곱 계산
result1 = math_tools.square(4)
print(f"4의 제곱: {result1}")  # 16

# 세제곱 계산
result2 = math_tools.cube(3)
print(f"3의 세제곱: {result2}")  # 27
```

### [실습 2] 모듈 확장하기
`math_tools.py` 모듈에 다음 기능을 추가해보세요:

1. `is_even()`: 짝수 여부 확인
2. `factorial()`: 팩토리얼 계산
3. `sum_range()`: 범위 내 숫자 합계

```python
# math_tools.py 확장
def is_even(n):
    """짝수 여부를 확인하는 함수"""
    return n % 2 == 0

def factorial(n):
    """팩토리얼을 계산하는 함수"""
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

def sum_range(start, end):
    """주어진 범위의 숫자 합계를 계산하는 함수"""
    return sum(range(start, end + 1))
```

```python
# 확장된 모듈 테스트
print(f"10은 짝수인가요? {math_tools.is_even(10)}")
print(f"5 팩토리얼: {math_tools.factorial(5)}")
print(f"1부터 10까지의 합: {math_tools.sum_range(1, 10)}")
```

### 실습 문제 해설
1. **모듈 생성**
   - `.py` 확장자로 파일 생성
   - 관련 함수들을 하나의 파일에 모음
   - 각 함수에 문서화 문자열(docstring) 추가

2. **모듈 사용**
   - `import` 문으로 모듈 불러오기
   - 점(.) 연산자로 함수 접근
   - 함수 실행 및 결과 확인

3. **모듈 확장**
   - 새로운 함수 추가
   - 기존 코드 수정 없이 기능 확장
   - 체계적인 코드 관리

### 추가 도전 과제:
1. 삼각함수 계산 기능 추가 (sin, cos, tan)
2. 통계 함수 추가 (평균, 중앙값, 표준편차)
3. 단위 변환 함수 추가 (미터↔피트, 섭씨↔화씨)

--- 