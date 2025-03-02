# 파이썬 기본 문법

## 📌 변수와 데이터 타입
변수는 데이터를 저장하는 공간이며, 다양한 데이터 타입을 가질 수 있습니다.  
✔ `int` (정수), `float` (실수), `str` (문자열), `bool` (참/거짓)  
✔ `type()` 함수를 사용하여 변수의 타입을 확인 가능  

```python
# 기본 데이터 타입 예제
name = "홍길동"        # 문자열(str)
age = 25              # 정수(int)
height = 175.5        # 실수(float)
is_student = True     # 불리언(bool)

# 데이터 타입 확인
print(f"name의 타입: {type(name)}")
print(f"age의 타입: {type(age)}")
print(f"height의 타입: {type(height)}")
print(f"is_student의 타입: {type(is_student)}")
```

## 📌 연산자
파이썬에서는 다양한 연산자를 제공합니다:

1. **산술 연산자**
   - `+` : 덧셈
   - `-` : 뺄셈
   - `*` : 곱셈
   - `/` : 나눗셈 (실수 결과)
   - `//` : 몫 (정수 나눗셈)
   - `%` : 나머지
   - `**` : 거듭제곱

2. **비교 연산자**
   - `>` : 크다
   - `<` : 작다
   - `>=` : 크거나 같다
   - `<=` : 작거나 같다
   - `==` : 같다
   - `!=` : 같지 않다

3. **논리 연산자**
   - `and` : 논리곱 (둘 다 참일 때 참)
   - `or` : 논리합 (하나라도 참이면 참)
   - `not` : 논리 부정

4. **할당 연산자**
   - `=` : 기본 할당
   - `+=` : 더하기 후 할당
   - `-=` : 빼기 후 할당
   - `*=` : 곱하기 후 할당
   - `/=` : 나누기 후 할당

5. **멤버십 연산자**
   - `in` : 포함 여부 확인
   - `not in` : 비포함 여부 확인

## 📌 조건문
✔ `if` 문은 조건이 참일 때 실행됨  
✔ `elif` 문을 사용하여 여러 조건을 추가 가능  
✔ `else` 문은 모든 조건이 거짓일 때 실행됨  

```python
# if-elif-else 예제
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "D"

print(f"점수: {score}, 학점: {grade}")
```

## 📌 반복문
반복문을 사용하면 동일한 작업을 여러 번 실행할 수 있습니다.  
✔ `for` 문은 특정 범위의 값을 반복  
✔ `while` 문은 조건이 참인 동안 반복  

```python
# for 반복문 - range()
print("for 반복문 - range()")
for i in range(5):  # 0부터 4까지
    print(f"반복 {i}")

# 리스트 순회
fruits = ["사과", "바나나", "딸기"]
print("\nfor 반복문 - 리스트 순회")
for fruit in fruits:
    print(fruit)
    
# while 반복문
count = 0
while count < 3:
    print(f"현재 카운트: {count}")
    count += 1
``` 