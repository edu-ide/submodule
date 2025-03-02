---

# 📘 1권 2부 8장: 에러와 디버깅

## 📌 목차
8.1 에러(예외)란?  
8.2 예외 처리 (try-except)  
8.3 자주 발생하는 예외 종류  
8.4 예외 발생 (raise)  
8.5 디버깅 기법  
8.6 단위 테스트 (unittest)  

## 8.1 에러(예외)란?

### 에러의 종류:
1. **문법 오류 (Syntax Error)**
   - 코드 작성 규칙 위반
   - 프로그램 실행 전에 발견
   - IDE에서 바로 표시됨

2. **런타임 오류 (Runtime Error)**
   - 프로그램 실행 중 발생
   - 예외 처리로 대응 가능
   - 사용자 입력 등으로 발생

3. **논리 오류 (Logical Error)**
   - 프로그램은 실행되지만 결과가 잘못됨
   - 디버깅이 가장 어려움
   - 단위 테스트로 발견 가능

```python
# 문법 오류 예시
# print("Hello"  # SyntaxError: ')'이 빠짐

# 런타임 오류 예시
try:
    print(10 / 0)  # ZeroDivisionError 발생
except ZeroDivisionError as e:
    print(f"오류 발생: {e}")

# 논리 오류 예시
def calculate_average(numbers):
    return sum(numbers) / len(numbers)  # 빈 리스트일 때 ZeroDivisionError

try:
    print(calculate_average([]))  # 오류 발생
except ZeroDivisionError:
    print("리스트가 비어있습니다.")
```

## 8.2 예외 처리 (try-except)

### ✅ 8.2.1 기본 예외 처리 구문
```python
try:
    # 예외가 발생할 수 있는 코드
except 예외종류:
    # 예외 처리 코드
else:
    # 예외가 발생하지 않았을 때 실행
finally:
    # 항상 실행되는 코드
```

### ✅ 8.2.2 예외 처리 패턴
1. **특정 예외만 처리**
2. **여러 예외 동시 처리**
3. **모든 예외 처리**
4. **예외 정보 활용**

```python
# 1. 특정 예외 처리
def divide_numbers():
    try:
        num1 = int(input("첫 번째 숫자: "))
        num2 = int(input("두 번째 숫자: "))
        result = num1 / num2
        print(f"결과: {result}")
    except ValueError:
        print("숫자를 입력해야 합니다.")
    except ZeroDivisionError:
        print("0으로 나눌 수 없습니다.")

# 2. 여러 예외 동시 처리
def process_list(lst):
    try:
        value = lst[0] + "10"
        return value
    except (IndexError, TypeError) as e:
        return f"오류 발생: {type(e).__name__}"

# 3. 모든 예외 처리
def safe_operation():
    try:
        # 위험한 연산
        pass
    except Exception as e:
        print(f"예상치 못한 오류: {e}")
    finally:
        print("작업 완료")
```

## 8.3 자주 발생하는 예외 종류

### ✅ 8.3.1 주요 예외 클래스
1. **ValueError**: 부적절한 값
2. **TypeError**: 부적절한 타입
3. **IndexError**: 인덱스 범위 초과
4. **KeyError**: 존재하지 않는 키
5. **FileNotFoundError**: 파일 없음
6. **AttributeError**: 존재하지 않는 속성
7. **ImportError**: 모듈 임포트 실패

```python
def demonstrate_exceptions():
    # ValueError
    try:
        int("abc")
    except ValueError as e:
        print(f"ValueError: {e}")
    
    # TypeError
    try:
        "123" + 456
    except TypeError as e:
        print(f"TypeError: {e}")
    
    # IndexError
    try:
        [1, 2, 3][10]
    except IndexError as e:
        print(f"IndexError: {e}")
    
    # KeyError
    try:
        {"a": 1}["b"]
    except KeyError as e:
        print(f"KeyError: {e}")
```

## 8.4 예외 발생 (raise)

### ✅ 8.4.1 사용자 정의 예외
- 특정 상황에 맞는 커스텀 예외 생성
- `Exception` 클래스 상속
- 의미 있는 에러 메시지 제공

```python
class InvalidAgeError(Exception):
    """나이가 유효하지 않을 때 발생하는 예외"""
    def __init__(self, age, message="유효하지 않은 나이입니다"):
        self.age = age
        self.message = message
        super().__init__(self.message)

def verify_age(age):
    if not isinstance(age, int):
        raise TypeError("나이는 정수여야 합니다")
    if age < 0 or age > 150:
        raise InvalidAgeError(age)
    return True

# 테스트
try:
    verify_age(200)
except InvalidAgeError as e:
    print(e)
```

## 8.5 디버깅 기법

### ✅ 8.5.1 디버깅 도구
1. **`print()` 함수**
   - 간단한 값 확인
   - 코드 흐름 추적
2. **`logging` 모듈**
   - 다양한 로그 레벨
   - 파일 저장 가능
3. **`pdb` 디버거**
   - 대화형 디버깅
   - 중단점 설정

```python
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='app.log'
)

def complex_calculation(x, y):
    logging.debug(f"입력값: x={x}, y={y}")
    
    try:
        result = x / y
        logging.info(f"계산 결과: {result}")
        return result
    except Exception as e:
        logging.error(f"오류 발생: {e}")
        raise
```

## 8.6 단위 테스트

### ✅ 8.6.1 테스트 작성 원칙
1. **독립성**: 각 테스트는 독립적으로 실행
2. **반복성**: 동일한 결과 보장
3. **단순성**: 하나의 기능만 테스트
4. **자동화**: 자동으로 실행 가능

```python
import unittest

def calculate_grade(score):
    if not isinstance(score, (int, float)):
        raise TypeError("점수는 숫자여야 합니다")
    if score < 0 or score > 100:
        raise ValueError("점수는 0~100 사이여야 합니다")
    
    if score >= 90: return 'A'
    elif score >= 80: return 'B'
    elif score >= 70: return 'C'
    else: return 'F'

class TestGradeCalculation(unittest.TestCase):
    def test_valid_grades(self):
        self.assertEqual(calculate_grade(95), 'A')
        self.assertEqual(calculate_grade(85), 'B')
        self.assertEqual(calculate_grade(75), 'C')
        self.assertEqual(calculate_grade(65), 'F')
    
    def test_invalid_types(self):
        with self.assertRaises(TypeError):
            calculate_grade("not a number")
    
    def test_out_of_range(self):
        with self.assertRaises(ValueError):
            calculate_grade(-1)
        with self.assertRaises(ValueError):
            calculate_grade(101)

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
```

## 🎯 8장 실습 문제

### [실습 1] 사용자 입력 예외 처리
사용자로부터 나이를 입력받아 성인 여부를 판단하는 프로그램을 작성하세요.
- 나이는 1~120 사이의 정수여야 함
- 잘못된 입력에 대한 예외 처리 포함
- 로깅을 사용하여 입력값 기록

```python
import logging

logging.basicConfig(level=logging.INFO)

class AgeError(Exception):
    """나이 입력이 잘못된 경우 발생하는 예외"""
    pass

def check_adult(age):
    """나이를 확인하여 성인 여부를 반환하는 함수"""
    try:
        age = int(age)
        if not 1 <= age <= 120:
            raise AgeError("나이는 1~120 사이여야 합니다.")
        logging.info(f"입력된 나이: {age}")
        return age >= 18
    except ValueError:
        raise AgeError("나이는 숫자여야 합니다.")

# 테스트
try:
    age = input("나이를 입력하세요: ")
    if check_adult(age):
        print("성인입니다.")
    else:
        print("미성년자입니다.")
except AgeError as e:
    print(f"오류: {e}")
```

---