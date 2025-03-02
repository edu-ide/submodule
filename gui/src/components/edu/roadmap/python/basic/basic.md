아래는 제공된 JSON 문서를 마크다운 형식으로 변환한 결과입니다. 코드 블록, 제목, 표 등은 원문의 구조를 유지하며 마크다운 문법에 맞게 작성되었습니다.

---

# 📘 1권 1부 2장: 파이썬 기초 문법

## 📌 목차  
2.1 변수와 데이터 타입  
2.2 기본 데이터 타입  
2.3 기본 연산자  
2.4 조건문 (if, else, elif)  
2.5 반복문 (for, while)  
2.6 함수 정의 및 사용

## 2.1 변수와 데이터 타입
### ✅ 변수란?
변수(Variable)는 데이터를 저장하는 공간입니다.  
파이썬에서는 변수 선언 시 데이터 타입을 자동으로 감지하기 때문에, 별도로 타입을 명시할 필요가 없습니다.

### ✅ 변수 선언과 할당  
변수는 `이름 = 값` 형식으로 선언합니다.

```python
# 변수 선언 및 할당
name = "Alice"      # 문자열(String)
age = 25           # 정수(Integer)
height = 167.5     # 실수(Float)
is_student = True  # 불리언(Boolean)

print(name)  # Alice
print(age)   # 25
print(height)  # 167.5
print(is_student)  # True
```

## 2.2 기본 데이터 타입
### ✅ 데이터 타입이란?
데이터 타입은 프로그래밍에서 다루는 데이터의 종류를 의미합니다.  
파이썬의 기본 데이터 타입들은 각각 고유한 특성과 사용 목적을 가지고 있습니다.

| 데이터 타입 | 설명                   | 예제                        |
|------------|------------------------|-----------------------------|
| `int`      | 정수형 (Integer)       | `age = 25`                  |
| `float`    | 실수형 (Floating Point)| `pi = 3.14`                 |
| `str`      | 문자열 (String)        | `name = "Python"`           |
| `bool`     | 불리언 (Boolean)       | `is_active = True`          |
| `list`     | 리스트 (List)          | `fruits = ["apple", "banana"]` |
| `tuple`    | 튜플 (Tuple)           | `colors = ("red", "blue")`  |
| `dict`     | 딕셔너리 (Dictionary)  | `person = {"name": "Alice", "age": 25}` |
| `set`      | 집합 (Set)             | `unique_numbers = {1, 2, 3}` |

### ✅ 간단한 문자열(String) 
문자열은 텍스트를 저장하는 데이터 타입입니다.

```python
text = "Hello, World!"
print(text)
```

### ✅ 데이터 타입 예제  
정수형, 실수형, 문자열, 불리언, 리스트, 튜플, 딕셔너리, 집합

```python
# 정수형(int)
num1 = 100
print(f"정수형: {num1}, 타입: {type(num1)}")

# 실수형(float)
num2 = 3.14
print(f"실수형: {num2}, 타입: {type(num2)}")

# 문자열(str)
text = "안녕하세요"
print(f"문자열: {text}, 타입: {type(text)}")

# 불리언(bool)
is_python = True
print(f"불리언: {is_python}, 타입: {type(is_python)}")

# 리스트(list)
numbers = [1, 2, 3, 4, 5]
print(f"리스트: {numbers}, 타입: {type(numbers)}")

# 튜플(tuple)
coordinates = (10, 20)
print(f"튜플: {coordinates}, 타입: {type(coordinates)}")

# 딕셔너리(dict)
student = {"이름": "김철수", "나이": 20, "학년": 2}
print(f"딕셔너리: {student}, 타입: {type(student)}")

# 집합(set)
unique_chars = {"a", "b", "c", "a"}  # 중복된 'a'는 한 번만 저장됨
print(f"집합: {unique_chars}, 타입: {type(unique_chars)}")
```

## 2.3 기본 연산자
### ✅ 연산자란?
연산자는 데이터를 처리하기 위한 기호입니다.  
파이썬은 다양한 종류의 연산자를 제공하여 데이터 처리를 용이하게 합니다.

### ✅ 연산자의 종류
1. 산술 연산자  
2. 비교 연산자  
3. 논리 연산자  
4. 할당 연산자  

| 연산자 | 설명     | 예제      |
|--------|----------|-----------|
| `+`    | 덧셈     | `a + b`   |
| `-`    | 뺄셈     | `a - b`   |
| `*`    | 곱셈     | `a * b`   |
| `/`    | 나눗셈   | `a / b`   |
| `//`   | 몫       | `a // b`  |
| `%`    | 나머지   | `a % b`   |
| `**`   | 거듭제곱 | `a ** b`  |

### ✅ 간단한 연산자 예제

```python
x = 10
y = 3

print(x + y)  # 13
print(x - y)  # 7
print(x * y)  # 30
print(x / y)  # 3.3333
print(x // y)  # 3
print(x % y)  # 1
print(x ** y)  # 1000
```

### ✅ 연산자 예제  
산술, 비교, 논리 연산자

```python
# 산술 연산자 예제
a, b = 10, 3

print("=== 산술 연산자 ===")
print(f"덧셈: {a} + {b} = {a + b}")
print(f"뺄셈: {a} - {b} = {a - b}")
print(f"곱셈: {a} * {b} = {a * b}")
print(f"나눗셈: {a} / {b} = {a / b}")
print(f"몫: {a} // {b} = {a // b}")
print(f"나머지: {a} % {b} = {a % b}")
print(f"거듭제곱: {a} ** {b} = {a ** b}")

# 비교 연산자 예제
print("\n=== 비교 연산자 ===")
print(f"{a} > {b}: {a > b}")
print(f"{a} < {b}: {a < b}")
print(f"{a} >= {b}: {a >= b}")
print(f"{a} <= {b}: {a <= b}")
print(f"{a} == {b}: {a == b}")
print(f"{a} != {b}: {a != b}")

# 논리 연산자 예제
x = True
y = False

print("\n=== 논리 연산자 ===")
print(f"and: {x} and {y} = {x and y}")
print(f"or: {x} or {y} = {x or y}")
print(f"not: not {x} = {not x}")
```

## 2.4 조건문 (if, else, elif)
### ✅ 조건문이란?
조건문은 특정 조건이 **참(True)**이면 특정 코드를 실행하는 구조입니다.

### ✅ if-else 구문
기본적인 조건 분기를 처리합니다.

```python
age = 18

if age >= 18:
    print("성인입니다.")
else:
    print("미성년자입니다.")

# elif 사용 예제
score = 85

if score >= 90:
    print("A 학점")
elif score >= 80:
    print("B 학점")
else:
    print("C 학점")
```

## 2.5 반복문 (for, while)
### ✅ for 반복문
리스트, 튜플, 문자열 등 반복 가능한 객체에서 값을 하나씩 꺼내 반복 실행합니다.

### ✅ while 반복문
조건이 **참(True)**인 동안 반복 실행됩니다.

```python
# for 반복문 예제
print("for 반복문:")
for i in range(5):
    print(i)

# while 반복문 예제
print("\nwhile 반복문:")
count = 0
while count < 5:
    print(count)
    count += 1

# 리스트를 이용한 for 반복문
print("\n리스트 반복:")
fruits = ["사과", "바나나", "체리"]
for fruit in fruits:
    print(fruit)
```

## 2.6 함수 정의 및 사용
### 2.6.1 함수란?
함수(Function)는 특정 작업을 수행하는 코드 블록입니다.

- 코드를 재사용할 수 있어 유지보수가 편리합니다.
- 동일한 코드를 여러 번 작성할 필요 없이 호출하여 사용할 수 있습니다.

### ✅ 함수 정의 및 호출
파이썬에서는 `def` 키워드를 사용하여 함수를 정의할 수 있습니다.

```python
# 함수 정의
def greet():
    print("안녕하세요! 파이썬을 시작해봅시다.")

# 함수 호출
greet()
```

### 2.6.2 매개변수 (Parameters)와 인수 (Arguments)
함수에 매개변수(Parameter)를 전달하면, 다양한 값을 입력받아 실행할 수 있습니다.

```python
# 매개변수가 있는 함수
def greet(name):
    print(f"안녕하세요, {name}님!")

# 함수 호출 (인수 전달)
greet("Alice")
greet("Bob")
```

### 2.6.3 반환값 (Return Value)
함수에서 `return` 키워드를 사용하면 결과 값을 반환할 수 있습니다.

```python
# 두 수의 합을 반환하는 함수
def add(a, b):
    return a + b

# 함수 호출
result = add(3, 5)
print(f"결과: {result}")
```

### 2.6.4 기본값 매개변수 (Default Parameters)
매개변수에 기본값을 설정하면, 함수를 호출할 때 인수를 생략할 수 있습니다.

```python
def greet(name="Guest"):
    print(f"안녕하세요, {name}님!")

greet()  # 기본값 사용
greet("Alice")  # 새로운 값 전달
```

### 2.6.5 가변 매개변수 (*args)
가변 매개변수를 사용하면 여러 개의 값을 함수에 전달할 수 있습니다.

```python
# 여러 개의 숫자를 더하는 함수
def add_numbers(*args):
    return sum(args)

# 함수 호출
print(add_numbers(1, 2, 3))  # 6
print(add_numbers(10, 20, 30, 40))  # 100
```

### 2.6.6 키워드 인수 (**kwargs)
키워드 인수를 사용하면 매개변수를 딕셔너리 형태로 받을 수 있습니다.

```python
def introduce(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

introduce(name="Alice", age=25, city="Seoul")
```

### 2.6.7 람다 함수 (Lambda Function)
람다 함수는 한 줄로 작성할 수 있는 익명 함수입니다.

- 일반적인 함수보다 짧고 간결한 코드를 작성할 수 있습니다.
- `lambda` 키워드를 사용하여 정의합니다.

```python
# 일반 함수
def square(x):
    return x ** 2

# 람다 함수
square_lambda = lambda x: x ** 2

# 함수 호출
print(square(5))  # 25
print(square_lambda(5))  # 25
```

## 🎯 실습 문제

### 1. 두 수의 곱을 반환하는 함수
두 개의 숫자를 입력받아 곱한 결과를 반환하는 함수를 작성하세요.

요구사항:
- 함수 이름: `multiply`
- 두 개의 매개변수 사용
- 정수와 실수 모두 처리 가능
- 결과 값 반환

```python
def multiply(a, b):
    return a * b

# 테스트
print("=== 두 수의 곱 계산 프로그램 ==="\n)
print(f"3 * 4 = {multiply(3, 4)}")
print(f"2.5 * 4 = {multiply(2.5, 4)}")

# 사용자 입력 테스트
try:
    num1 = float(input("첫 번째 숫자를 입력하세요: "))
    num2 = float(input("두 번째 숫자를 입력하세요: "))
    print(f"결과: {num1} * {num2} = {multiply(num1, num2)}")
except ValueError:
    print("올바른 숫자를 입력해주세요.")
```

### 2. 여러 개의 숫자 합계 구하기
가변 인자를 사용하여 여러 숫자의 합을 계산하는 함수를 작성하세요.

요구사항:
- 함수 이름: `sum_numbers`
- 가변 인자(`*args`) 사용
- 입력된 모든 숫자의 합계 반환
- 숫자가 없는 경우 0 반환

```python
def sum_numbers(*args):
    return sum(args)

# 테스트
print("=== 여러 숫자의 합계 계산 프로그램 ==="\n)
print(f"1, 2, 3의 합: {sum_numbers(1, 2, 3)}")
print(f"10, 20, 30, 40의 합: {sum_numbers(10, 20, 30, 40)}")
print(f"인자가 없는 경우: {sum_numbers()}")

# 사용자 입력 테스트
try:
    numbers = [float(x) for x in input("숫자들을 공백으로 구분하여 입력하세요: ").split()]
    print(f"입력한 숫자들의 합: {sum_numbers(*numbers)}")
except ValueError:
    print("올바른 숫자를 입력해주세요.")
```

### 3. 세제곱 계산 람다 함수
`lambda`를 사용하여 세제곱을 계산하는 함수를 작성하세요.

요구사항:
- `lambda` 표현식 사용
- 한 줄로 작성
- 세제곱 값 반환

```python
cube = lambda x: x ** 3

# 테스트
print("=== 세제곱 계산 프로그램 ==="\n)
print(f"3의 세제곱: {cube(3)}")
print(f"4의 세제곱: {cube(4)}")

# 사용자 입력 테스트
try:
    num = float(input("\n숫자를 입력하세요: "))
    print(f"{num}의 세제곱: {cube(num)}")
except ValueError:
    print("올바른 숫자를 입력해주세요.")
```

### 4. 학점 계산 프로그램
점수를 입력받아 학점을 출력하는 프로그램을 작성하세요.

요구사항:
- 90점 이상: A
- 80점 이상: B
- 70점 이상: C
- 60점 이상: D
- 60점 미만: F

```python
def get_grade(score):
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    else:
        return 'F'

# 테스트
print("=== 학점 계산 프로그램 ==="\n)

try:
    score = float(input("점수를 입력하세요 (0-100): "))
    if 0 <= score <= 100:
        grade = get_grade(score)
        print(f"점수: {score}점")
        print(f"학점: {grade}")
    else:
        print("0에서 100 사이의 점수를 입력해주세요.")
except ValueError:
    print("올바른 숫자를 입력해주세요.")
```

### 5. 짝수 출력 프로그램
1부터 100까지의 숫자 중 짝수만 출력하는 프로그램을 작성하세요.

요구사항:
- `for` 문 사용
- `range()` 함수 활용
- 짝수 판별 로직 구현

```python
print("=== 1부터 100까지의 짝수 출력 프로그램 ==="\n)

print("짝수 목록:")
for i in range(2, 101, 2):
    print(i, end=" ")

# 통계 정보
even_count = len(range(2, 101, 2))
print(f"\n\n총 짝수의 개수: {even_count}개")
print(f"짝수들의 합: {sum(range(2, 101, 2))}")
```

### 6. 최대값 찾기 프로그램
리스트에서 가장 큰 수를 찾는 프로그램을 작성하세요.

요구사항:
- 빈 리스트 처리
- 최대값 찾기
- 결과 출력

```python
def find_max(numbers):
    if not numbers:  # 빈 리스트 체크
        return None
    return max(numbers)

# 테스트
print("=== 최대값 찾기 프로그램 ==="\n)

# 테스트 케이스
test_list = [17, 92, 18, 33, 58, 7, 33, 42]
print(f"리스트: {test_list}")
max_num = find_max(test_list)
print(f"최대값: {max_num}")

# 사용자 입력 테스트
try:
    numbers = [float(x) for x in input("\n숫자들을 공백으로 구분하여 입력하세요: ").split()]
    result = find_max(numbers)
    if result is not None:
        print(f"입력한 숫자들 중 최대값: {result}")
    else:
        print("숫자를 입력해주세요.")
except ValueError:
    print("올바른 숫자를 입력해주세요.")
```

## 📌 2장 요약
✅ 변수는 데이터를 저장하는 공간이며, 타입 선언이 필요 없음  
✅ 문자열은 작은따옴표(') 또는 큰따옴표(")로 감쌀 수 있음  
✅ 리스트(list)는 수정 가능, 튜플(tuple)은 수정 불가능  
✅ `if-else`를 사용하여 조건문 작성 가능  
✅ `for`, `while`을 사용하여 반복문을 작성할 수 있음  

---

마크다운 형식으로 변환하면서 원문의 내용과 구조를 충실히 반영했습니다. 추가로 수정하거나 보완할 부분이 있다면 말씀해주세요!