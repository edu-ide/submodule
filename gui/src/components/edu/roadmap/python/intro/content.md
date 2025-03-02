# 📘 1권 1장: 파이썬 소개 및 설치

## 📌 목차  
1.1 [order: 1.1] 파이썬이란?  
1.2 [order: 1.2] 파이썬 설치 및 개발 환경 설정  
1.3 [order: 1.3] 파이썬 인터프리터와 기본 명령어  
1.4 [order: 1.4] Jupyter Notebook 설치  
1.5 [order: 1.5] 파이썬 기본 문법  
1.6 [order: 1.6] 데이터 구조 (리스트, 튜플, 딕셔너리 등)  
1.7 [order: 1.7] 입출력 및 파일 처리  

## 1.1 파이썬이란? [order: 1.1]

### ✅ 파이썬 개요  
파이썬(Python)은 **1991년 네덜란드 프로그래머 "귀도 반 로섬(Guido van Rossum)"**이 개발한 프로그래밍 언어입니다.  
현재 파이썬은 웹 개발, 데이터 분석, 인공지능(AI), 머신러닝, 자동화, 임베디드 시스템 등 다양한 분야에서 널리 사용되고 있습니다.  

### ✅ 파이썬의 주요 특징  
✔ 문법이 간결하고 가독성이 뛰어남  
✔ C, C++, Java 등 다양한 언어와 쉽게 연동 가능  
✔ 강력한 표준 라이브러리 및 서드파티 라이브러리 지원  
✔ Windows, macOS, Linux 등 다양한 운영체제에서 실행 가능  
✔ 인터프리터 방식으로 실행되며, 동적 타입(변수 선언 불필요)  
✔ 웹 개발, 데이터 분석, 머신러닝 등 다양한 분야에서 활용 가능  

### ✅ 파이썬이 사용되는 대표적인 분야  
- 🔹 **웹 개발**: Django, Flask 프레임워크를 활용한 웹 애플리케이션 개발  
- 🔹 **데이터 분석**: Pandas, NumPy, Matplotlib을 활용한 데이터 처리 및 시각화  
- 🔹 **머신러닝 & AI**: TensorFlow, PyTorch를 활용한 인공지능 모델 개발  
- 🔹 **자동화 스크립트**: 업무 자동화, 웹 크롤링, 시스템 관리 등  
- 🔹 **임베디드 시스템**: Raspberry Pi, IoT 기기 개발  
- 🔹 **게임 개발**: Pygame을 활용한 게임 제작  

## 1.2 파이썬 설치 및 개발 환경 설정 [order: 1.2]

### ✅ 파이썬 다운로드 및 설치  
1️⃣ **[Python 공식 홈페이지](https://www.python.org/downloads/)** 에 접속  
2️⃣ 다운로드 페이지에서 **최신 버전의 파이썬(Python 3.x)**을 다운로드  
3️⃣ 설치 진행 중 **"Add Python to PATH"** 옵션을 반드시 체크  
4️⃣ 설치가 완료되면 **명령 프롬프트(Windows) 또는 터미널(macOS/Linux)**에서 아래 명령어로 확인  

파이썬은 쉬운 문법과 강력한 기능을 가진 프로그래밍 언어입니다.

1. `Windows + R` 키를 눌러 `cmd` 입력 후 엔터 (명령 프롬프트 실행)
2. 다음 명령어 입력 후 엔터:

```bash
python --version
```
또는
```bash
python3 --version
```

✅ Python 버전이 출력되면 이미 설치됨  
❌ `python is not recognized` 오류 발생 시 Python을 설치해야 함  

✅ pip가 설치되어 있는지 확인
```bash
pip --version
```

✅ `pip 23.x.x from ...` 과 같은 결과가 나오면 설치됨  
❌ 오류 발생 시 pip 설치 필요 → 다음 명령어 실행:

```bash
python -m ensurepip --default-pip
```

### ✅ 파이썬 설치
다음 명령어를 실행하여 파이썬을 설치할 수 있습니다.

```bash
pip install python
```

### ✅ 파이썬 버전 확인
다음 명령어를 실행하여 파이썬 버전을 확인할 수 있습니다.

```bash
python --version
```

✅ **출력 예시 (설치가 정상적으로 완료된 경우)**  
```bash
Python 3.10.4
```

✔ 정상적으로 버전이 출력되면 파이썬이 성공적으로 설치된 것입니다!  

### ✅ 파이썬 버전 확인 스크립트
`hi.py` 파일 생성:

```python
# 파일명 hi.py
# 설치된 파이썬 버전 확인
print("Hello, Python!")
import sys
print(sys.version)
```

명령 프롬프트에서 실행:
```bash
python hi.py
```

**출력:**
```
Hello, Python!
3.12.6 (tags/v3.12.6:a4a2d2b, Sep  6 2024, 20:11:23) [MSC v.1940 64 bit (AMD64)]
```

## 1.3 파이썬 인터프리터와 기본 명령어 [order: 1.3]

### ✅ 파이썬 인터프리터 실행하기  
설치가 완료되었다면, **파이썬 인터프리터(Python Shell)**를 실행할 수 있습니다.  

🖥 **Windows**: `cmd(명령 프롬프트)`에서 실행  
🖥 **macOS/Linux**: `Terminal`에서 실행  

```bash
python
```

실행하면 아래와 같은 파이썬 인터프리터 화면이 표시됩니다.  

```python
Python 3.10.4 (default, Apr 19 2023, 18:14:58)
[GCC 11.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

이제 간단한 명령어를 입력해 봅시다!  

### ✅ 기본 명령어 실행
```python
# 기본적인 파이썬 명령어 실행
print("Hello, Python!")  # 문자열 출력

2 + 3  # 덧셈 연산

10 / 2  # 나눗셈 연산

# 변수 선언
name = "Alice"
print(name)
```

**출력:**
```
Hello, Python!
Alice
```

✅ **CMD(명령 프롬프트)에서 실행**  
아래 내용을 `hi.py`로 메모장에 저장 후 실행:

```python
# 파일명 hi.py
print("Hello, Python!")
import sys
print(sys.version)
```

```bash
python hi.py
```

실행 시:
```
Hello, Python!
3.xx.xx
```

## 1.4 Jupyter Notebook 설치 [order: 1.4]

### 1. 명령 프롬프트(cmd) 또는 PowerShell 실행
### 2. 다음 명령어 입력 후 엔터:
```bash
pip install notebook
```

✅ 설치 완료 후 확인:
```bash
jupyter --version
```

✅ 정상적인 결과 예시:
```yaml
jupyter core     : 4.x.x
jupyter-notebook : 6.x.x
jupyter client   : 7.x.x
```

### 3. Jupyter Notebook 실행하기
✅ 실행 방법
```bash
jupyter notebook
```

📌 실행하면 기본 웹 브라우저에서 **Jupyter Notebook**이 자동으로 열립니다.  
만약 브라우저가 열리지 않으면, 아래 주소를 직접 입력하여 접근할 수 있습니다.  
- `localhost:8888`
- `http://127.0.0.1:8888`
- `http://localhost:8888/tree`

### 4. 가상환경에서 Jupyter Notebook 사용 (선택 사항)
💡 **여러 프로젝트를 관리하려면 가상환경을 사용하는 것이 좋습니다.**

✅ 가상환경 만들기
```bash
python -m venv myenv
```

✅ 가상환경 활성화
```bash
myenv\Scripts\activate
```

✅ 가상환경에 Jupyter 설치
```bash
pip install notebook
```

✅ 가상환경에서 Jupyter 실행
```bash
jupyter notebook
```

### 5. Jupyter Notebook 기본 사용법
✅ 새로운 노트북 생성
1. **Jupyter Notebook 실행**
2. **브라우저에서 `New → Python 3` 클릭**
3. **새로운 노트북(`.ipynb`) 파일이 생성됨**

✅ 첫 번째 코드 실행
코드 셀에 다음 입력 후 `Shift + Enter` 실행:
```python
print("Hello, Jupyter!")
```

**출력:**
```
Hello, Jupyter!
```

### 6. Jupyter Notebook 제거 방법 (필요할 경우)
Jupyter를 제거하고 싶다면 다음 명령어 실행:
```bash
pip uninstall notebook
```

✅ **삭제 후 `jupyter --version`을 입력했을 때 오류가 나오면 완전히 삭제된 것임**

### 7. 문제 해결 (에러 발생 시)
✅ `jupyter: command not found` 또는 `jupyter is not recognized` 오류 해결
```bash
python -m notebook
```
또는
```bash
python -m pip install --upgrade notebook
```

✅ Jupyter Notebook이 실행되지 않는 경우
1. `Ctrl + C`로 서버 종료 후 다시 실행
2. 브라우저가 자동으로 열리지 않으면 **`http://127.0.0.1:8888`** 직접 입력

## 1.5 파이썬 기본 문법 [order: 1.5]

### 📌 1.5.1 변수와 데이터 타입 [order: 1.5.1]  
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

### 📌 1.5.2 연산자 [order: 1.5.2]
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

```python
# 산술 연산자 예제
print("=== 산술 연산자 ===")
a = 10
b = 3

print(f"덧셈: {a + b}")       # 13
print(f"뺄셈: {a - b}")       # 7
print(f"곱셈: {a * b}")       # 30
print(f"나눗셈: {a / b}")     # 3.3333...
print(f"몫: {a // b}")        # 3
print(f"나머지: {a % b}")     # 1
print(f"제곱: {a ** b}")      # 1000
```

**출력:**
```
=== 산술 연산자 ===
덧셈: 13
뺄셈: 7
곱셈: 30
나눗셈: 3.3333333333333335
몫: 3
나머지: 1
제곱: 1000
```

```python
# 논리 연산자 예제
print("=== 논리 연산자 ===")
x = True
y = False

print(f"True and True = {x and x}")
print(f"True and False = {x and y}")
print(f"True or False = {x or y}")
print(f"not True = {not x}")
```

**출력:**
```
=== 논리 연산자 ===
True and True = True
True and False = False
True or False = True
not True = False
```

```python
# 할당 연산자 예제
print("=== 할당 연산자 ===")
num = 10
print(f"초기값: {num}")

num += 5  # num = num + 5
print(f"+= 후: {num}")

num -= 5  # num = num - 5
print(f"-= 후: {num}")

num *= 2  # num = num * 2
print(f"*= 후: {num}")

num /= 2  # num = num / 2
print(f"/= 후: {num}")
```

**출력:**
```
=== 할당 연산자 ===
초기값: 10
+= 후: 15
-= 후: 10
*= 후: 20
/= 후: 10.0
```

```python
# 멤버십 연산자 예제
print("=== 멤버십 연산자 ===")
fruits = ["사과", "바나나", "딸기"]
text = "Python"

print(f"'사과'가 리스트에 있나요? {'사과' in fruits}")
print(f"'망고'가 리스트에 없나요? {'망고' not in fruits}")
print(f"'Python'에 'th'가 있나요? {'th' in text}")
```

**출력:**
```
=== 멤버십 연산자 ===
'사과'가 리스트에 있나요? True
'망고'가 리스트에 없나요? True
'Python'에 'th'가 있나요? True
```

### 📌 1.5.3 조건문 [order: 1.5.3]  
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

```python
# 중첩 조건문
age = 20
has_id = True

if age >= 19:
    if has_id:
        print("입장 가능합니다.")
    else:
        print("신분증을 지참해주세요.")
else:
    print("미성년자는 입장할 수 없습니다.")
```

### 📌 1.5.4 반복문 [order: 1.5.4]  
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

## 1.6 데이터 구조 [order: 1.6]

파이썬의 주요 데이터 구조들을 살펴보겠습니다:

1. **리스트 (List)**
   - 순서가 있는 수정 가능한 시퀀스
   - 대괄호 `[]`로 생성
   - 다양한 타입의 요소를 담을 수 있음

2. **튜플 (Tuple)**
   - 순서가 있는 수정 불가능한 시퀀스
   - 소괄호 `()`로 생성
   - 읽기 전용 데이터에 사용

3. **딕셔너리 (Dictionary)**
   - 키-값 쌍을 저장
   - 중괄호 `{}`로 생성
   - 키를 통해 값에 접근

4. **집합 (Set)**
   - 중복되지 않는 요소들의 모음
   - 중괄호 `{}`로 생성
   - 수학의 집합 연산 지원

### 📌 1.6.1 리스트 (List) [order: 1.6.1]  
리스트는 여러 개의 값을 저장하는 자료구조입니다.  
✔ 대괄호 `[ ]`를 사용하여 선언  
✔ `append()`를 사용하여 요소 추가 가능  
✔ `len()`을 사용하여 리스트 길이 확인  

```python
# 리스트 예제1
print("=== 리스트 예제 ===")
numbers = [1, 2, 3, 4, 5]
print(f"원본 리스트: {numbers}")
print(f"첫 번째 요소: {numbers[0]}")
print(f"마지막 요소: {numbers[-1]}")
print(f"슬라이싱 [1:3]: {numbers[1:3]}")

print("\n리스트 조작:")
numbers.append(6)        # 끝에 추가
print(f"append 후: {numbers}")

numbers.insert(2, 10)    # 인덱스 2에 10 삽입
print(f"insert 후: {numbers}")

numbers.remove(10)       # 값 10 제거
print(f"remove 후: {numbers}")

numbers.sort()           # 정렬
print(f"정렬 후: {numbers}")
```

**출력:**
```
=== 리스트 예제 ===
원본 리스트: [1, 2, 3, 4, 5]
첫 번째 요소: 1
마지막 요소: 5
슬라이싱 [1:3]: [2, 3]

리스트 조작:
append 후: [1, 2, 3, 4, 5, 6]
insert 후: [1, 2, 10, 3, 4, 5, 6]
remove 후: [1, 2, 3, 4, 5, 6]
정렬 후: [1, 2, 3, 4, 5, 6]
```

```python
# 리스트 예제2
fruits = ["사과", "바나나", "체리"]
fruits.append("포도")  # 요소 추가
print(fruits)

# 리스트 길이 확인
print("리스트 길이:", len(fruits))
```

### 📌 1.6.2 튜플 (Tuple) [order: 1.6.2]
튜플은 리스트와 비슷하지만 수정이 불가능한(immutable) 자료구조입니다.  
✔ 소괄호 `( )`를 사용하여 선언  
✔ 한 번 생성하면 값을 변경할 수 없음  
✔ 읽기 전용 데이터에 적합

```python
# 튜플 예제1
print("=== 튜플 예제 ===")
point = (1, 2, 3)
print(f"원본 튜플: {point}")
print(f"첫 번째 요소: {point[0]}")
print(f"튜플 길이: {len(point)}")
print(f"2의 개수: {point.count(2)}")
```

**출력:**
```
=== 튜플 예제 ===
원본 튜플: (1, 2, 3)
첫 번째 요소: 1
튜플 길이: 3
2의 개수: 1
```

```python
# 튜플 예제2
coordinates = (10, 20)
rgb_color = (255, 128, 0)
# 튜플 언패킹
x, y = coordinates
print(f"x좌표: {x}, y좌표: {y}")
# 튜플은 수정 불가능
# coordinates[0] = 30 # 이 코드는 오류 발생
```

### 📌 1.6.3 딕셔너리 (Dictionary) [order: 1.6.3]
딕셔너리는 키-값 쌍으로 이루어진 자료구조입니다.  
✔ 중괄호 `{ }`를 사용하여 선언  
✔ 키를 통해 값에 빠르게 접근 가능  
✔ 키는 고유해야 하며, 값은 중복 가능

```python
# 딕셔너리 예제1
print("=== 딕셔너리 예제 ===")
person = {
    'name': '홍길동',
    'age': 25,
    'city': '서울'
}
print(f"원본 딕셔너리: {person}")
print(f"이름: {person['name']}")
print(f"나이: {person['age']}")

print("\n딕셔너리 조작:")
person['job'] = '개발자'    # 새 키-값 추가
print(f"추가 후: {person}")

person['age'] = 26         # 값 수정
print(f"수정 후: {person}")

del person['city']         # 키-값 쌍 삭제
print(f"삭제 후: {person}")

print(f"\n키 목록: {list(person.keys())}")
print(f"값 목록: {list(person.values())}")
```

**출력:**
```
=== 딕셔너리 예제 ===
원본 딕셔너리: {'name': '홍길동', 'age': 25, 'city': '서울'}
이름: 홍길동
나이: 25

딕셔너리 조작:
추가 후: {'name': '홍길동', 'age': 25, 'city': '서울', 'job': '개발자'}
수정 후: {'name': '홍길동', 'age': 26, 'city': '서울', 'job': '개발자'}
삭제 후: {'name': '홍길동', 'age': 26, 'job': '개발자'}

키 목록: ['name', 'age', 'job']
값 목록: ['홍길동', 26, '개발자']
```

```python
# 딕셔너리 예제2
student = {
    "name": "홍길동",
    "age": 20,
    "grades": [90, 85, 88]
}
# 값 접근 및 수정
print(student["name"])
student["age"] = 21
# 새로운 키-값 쌍 추가
student["major"] = "컴퓨터공학"
# 딕셔너리 메서드 활용
print("키 목록:", student.keys())
print("값 목록:", student.values())
print("키-값 쌍:", student.items())
```

### 📌 1.6.4 집합 (Set) [order: 1.6.4]
집합은 수학의 집합 개념을 구현한 자료구조입니다.

**주요 특징:**
1. **중복 제거**
   - 동일한 값을 여러 번 추가해도 한 번만 저장됨
   - 리스트나 튜플의 중복 요소를 제거할 때 유용

2. **순서 없음**
   - 요소들의 순서가 유지되지 않음
   - 인덱싱으로 접근 불가

3. **집합 연산**
   - 합집합 (`|`): 두 집합의 모든 요소
   - 교집합 (`&`): 두 집합의 공통 요소
   - 차집합 (`-`): A-B는 A에는 있고 B에는 없는 요소
   - 대칭차집합 (`^`): 한쪽에만 있는 요소들의 집합

4. **주요 메서드**
   - `add()`: 요소 추가
   - `remove()`: 요소 제거 (없으면 에러)
   - `discard()`: 요소 제거 (없어도 에러 없음)
   - `update()`: 여러 요소 추가
   - `clear()`: 모든 요소 제거

5. **활용 사례**
   - 중복 제거가 필요한 데이터 처리
   - 멤버십 테스트 (포함 여부 확인)
   - 수학적 집합 연산이 필요한 경우

```python
# 집합 기본 연산 예제
print("=== 집합 기본 연산 ===")
my_set = {1, 2, 3, 4, 5}
print(f"원본 집합: {my_set}")

# 요소 추가
my_set.add(6)
print(f"요소 추가 후: {my_set}")

# 요소 제거
my_set.remove(4)
print(f"요소 제거 후: {my_set}")

# 여러 요소 추가
my_set.update([7, 8, 9])
print(f"여러 요소 추가 후: {my_set}")
```

**출력:**
```
=== 집합 기본 연산 ===
원본 집합: {1, 2, 3, 4, 5}
요소 추가 후: {1, 2, 3, 4, 5, 6}
요소 제거 후: {1, 2, 3, 5, 6}
여러 요소 추가 후: {1, 2, 3, 5, 6, 7, 8, 9}
```

```python
# 집합 연산 예제
print("=== 집합 연산 ===")
A = {1, 2, 3, 4, 5}
B = {4, 5, 6, 7, 8}
print(f"A: {A}")
print(f"B: {B}")

print("\n집합 연산:")
print(f"합집합 (A | B): {A | B}")
print(f"교집합 (A & B): {A & B}")
print(f"차집합 (A - B): {A - B}")
print(f"대칭차집합 (A ^ B): {A ^ B}")

# 부분집합/상위집합 검사
print(f"\n부분집합 여부: {A.issubset(B)}")
print(f"상위집합 여부: {A.issuperset(B)}")
```

**출력:**
```
=== 집합 연산 ===
A: {1, 2, 3, 4, 5}
B: {4, 5, 6, 7, 8}

집합 연산:
합집합 (A | B): {1, 2, 3, 4, 5, 6, 7, 8}
교집합 (A & B): {4, 5}
차집합 (A - B): {1, 2, 3}
대칭차집합 (A ^ B): {1, 2, 3, 6, 7, 8}

부분집합 여부: False
상위집합 여부: False
```

```python
# 집합 활용 예제
print("=== 집합 활용 예제 ===")
# 중복 제거
numbers = [1, 2, 2, 3, 3, 3, 4, 4, 5]
print(f"원본 리스트: {numbers}")
unique_numbers = list(set(numbers))
print(f"중복 제거 후: {unique_numbers}")

# 두 리스트의 비교
list1 = [1, 2, 3, 4, 5]
list2 = [4, 5, 6, 7, 8]
set1 = set(list1)
set2 = set(list2)

print(f"\n두 리스트의 공통 요소: {set1 & set2}")
print(f"첫 번째 리스트에만 있는 요소: {set1 - set2}")
```

**출력:**
```
=== 집합 활용 예제 ===
원본 리스트: [1, 2, 2, 3, 3, 3, 4, 4, 5]
중복 제거 후: [1, 2, 3, 4, 5]

두 리스트의 공통 요소: {4, 5}
첫 번째 리스트에만 있는 요소: {1, 2, 3}
```

### 💡 집합 사용 팁
1. **성능 고려사항**
   - 멤버십 테스트(`in` 연산)가 리스트보다 훨씬 빠름
   - 중복 제거 시 리스트를 집합으로 변환하는 것이 효율적

2. **주의사항**
   - 집합의 요소는 반드시 해시 가능(hashable)해야 함
   - 리스트나 딕셔너리는 집합의 요소가 될 수 없음
   - 순서가 중요한 경우에는 사용하지 않는 것이 좋음

3. **일반적인 사용 사례**
   - 데이터 중복 제거
   - 두 데이터 집합의 비교
   - 고유한 값들의 모음 관리

```python
# 집합 예제
print("=== 집합 예제 ===")
A = {1, 2, 3, 4, 5}
B = {4, 5, 6, 7, 8}
print(f"A: {A}")
print(f"B: {B}")

print("\n집합 연산:")
print(f"합집합: {A | B}")
print(f"교집합: {A & B}")
print(f"차집합 (A-B): {A - B}")
print(f"대칭차집합: {A ^ B}")
```

**출력:**
```
=== 집합 예제 ===
A: {1, 2, 3, 4, 5}
B: {4, 5, 6, 7, 8}

집합 연산:
합집합: {1, 2, 3, 4, 5, 6, 7, 8}
교집합: {4, 5}
차집합 (A-B): {1, 2, 3}
대칭차집합: {1, 2, 3, 6, 7, 8}
```

### 📌 데이터 구조 선택 가이드
각 데이터 구조의 특징과 사용 시기:

1. **리스트 사용**
   - 순서가 중요할 때
   - 데이터 수정이 필요할 때
   - 중복 데이터를 허용할 때

2. **튜플 사용**
   - 데이터 수정을 방지하고 싶을 때
   - 딕셔너리의 키로 사용할 때
   - 함수의 리턴값으로 여러 값을 반환할 때

3. **딕셔너리 사용**
   - 키-값 쌍으로 데이터를 저장할 때
   - 빠른 검색이 필요할 때
   - JSON과 같은 데이터 구조가 필요할 때

4. **집합 사용**
   - 중복을 제거할 때
   - 집합 연산이 필요할 때
   - 멤버십 테스트가 필요할 때

## 1.7 입출력 및 파일 처리 [order: 1.7]

### 📌 1.7.1 표준 입출력 [order: 1.7.1]
다양한 형식으로 입출력을 처리할 수 있습니다.
- `input()` 함수의 형 변환
- `print()` 함수의 다양한 옵션
- f-string을 활용한 포맷팅

```python
# 표준 입력 및 출력
name = input("이름을 입력하세요: ")
print(f"안녕하세요, {name}님!")

# 다양한 입력 처리
age = int(input("나이를 입력하세요: "))
height = float(input("키를 입력하세요(cm): "))

# 다양한 출력 형식
print("이름: {}, 나이: {}".format(name, age))
print(f"키: {height:.1f}cm")

# sep, end 옵션 활용
print("Python", "Java", "C++", sep=" | ")
print("안녕", end="!") 
```

### f-string 포맷팅 예제
- 기본 사용법

```python
# 1. 기본 f-string 예제
print("=== 기본 f-string 예제 ===\n")

# 변수 선언
name = "홍길동"
age = 25
job = "프로그래머"

# 기본 f-string 사용
print(f"이름: {name}")
print(f"나이: {age}살")
print(f"직업: {job}")

# 여러 변수 조합
print(f"\n자기소개: 안녕하세요, 저는 {age}살 {name}입니다.")
```

- 포맷팅 옵션

```python
# 2. 포맷팅 옵션 예제
print("=== 포맷팅 옵션 예제 ===\n")

# 숫자 포맷팅
number = 123
pi = 3.14159
percentage = 0.75

print("숫자 포맷팅:")
print(f"- 정수: {number:05d}")  # 5자리, 빈자리는 0으로 채움
print(f"- 실수: {pi:.3f}")      # 소수점 3자리까지
print(f"- 백분율: {percentage:.2%}")  # 백분율 표시
```

- 고급 기능

```python
# 3. 고급 기능 예제
print("=== 고급 기능 예제 ===\n")

from datetime import datetime

# 날짜/시간 포맷팅
now = datetime.now()
print("날짜/시간 포맷팅:")
print(f"- 현재 날짜: {now:%Y-%m-%d}")
print(f"- 현재 시간: {now:%H:%M:%S}")

# 표현식 사용
x, y = 2, 3
print(f"\n계산 결과: {x} + {y} = {x + y}")

# 조건문 사용
age = 25
print(f"상태: {'성인' if age >= 20 else '미성년자'}")
```

### 📌 1.7.2 파일 읽기 및 쓰기 [order: 1.7.2]
파일 처리의 다양한 모드와 방법을 활용할 수 있습니다.
- 다양한 파일 모드 (`r`, `w`, `a`, `b`)
- 여러 줄 읽기/쓰기
- with 문을 활용한 안전한 파일 처리

```python
# 파일 쓰기
with open("sample.txt", "w") as file:
    file.write("Hello, Python!")

# 파일 읽기
with open("sample.txt", "r") as file:
    content = file.read()
    print(content)
```

```python
# 여러 줄 쓰기
with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("1번째 줄\n")
    file.write("2번째 줄\n")
    file.writelines(["3번째 줄\n", "4번째 줄\n"])

# 여러 줄 읽기
with open("notes.txt", "r", encoding="utf-8") as file:
    # 한 줄씩 읽기
    for line in file:
        print(line.strip())
```

**출력:**
```
1번째 줄
2번째 줄
3번째 줄
4번째 줄
```

### 📌 1.7.3 파일 모드 [order: 1.7.3]  
1. **읽기 모드 (`r`)**
   - 파일을 읽기 전용으로 열기
   - 파일이 없으면 에러 발생

2. **쓰기 모드 (`w`)**
   - 파일을 쓰기 전용으로 열기
   - 파일이 있으면 내용을 덮어쓰기
   - 파일이 없으면 새로 생성

3. **추가 모드 (`a`)**
   - 파일 끝에 내용을 추가
   - 파일이 없으면 새로 생성

4. **바이너리 모드 (`b`)**
   - 바이너리 형식으로 파일 처리
   - 이미지, 실행 파일 등 처리 시 사용

5. **텍스트 모드 (`t`)**
   - 기본값, 생략 가능
   - 텍스트 파일 처리

```python
print("=== 읽기 모드(r) 예제 ===")

# 먼저 파일 생성
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("안녕하세요\n")
    f.write("파이썬 파일 입출력 예제입니다.\n")
    f.write("읽기 모드 테스트 중입니다.")

# 읽기 모드로 파일 열기
with open("test.txt", "r", encoding="utf-8") as f:
    print("파일 내용:")
    print(f.read(), end="")
```

**출력:**
```
=== 읽기 모드(r) 예제 ===
파일 내용:
안녕하세요
파이썬 파일 입출력 예제입니다.
읽기 모드 테스트 중입니다.
```

```python
print("=== 쓰기 모드(w) 예제 ===")

# 쓰기 모드로 파일 열기 (기존 내용 덮어쓰기)
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("첫 번째 줄\n")
    f.write("두 번째 줄\n")
    f.write("세 번째 줄")

# 파일 내용 확인
with open("test.txt", "r", encoding="utf-8") as f:
    print("새로운 파일 내용:")
    print(f.read(), end="")
```

**출력:**
```
=== 쓰기 모드(w) 예제 ===
새로운 파일 내용:
첫 번째 줄
두 번째 줄
세 번째 줄
```

```python
print("=== 추가 모드(a) 예제 ===")

# 추가 모드로 파일 열기
with open("test.txt", "a", encoding="utf-8") as f:
    f.write("\n네 번째 줄 (추가)\n")
    f.write("다섯 번째 줄 (추가)")

# 전체 내용 확인
with open("test.txt", "r", encoding="utf-8") as f:
    print("추가 후 전체 내용:")
    print(f.read(), end="")
```

**출력:**
```
=== 추가 모드(a) 예제 ===
추가 후 전체 내용:
첫 번째 줄
두 번째 줄
세 번째 줄
네 번째 줄 (추가)
다섯 번째 줄 (추가)
```

```python
print("=== 바이너리 모드(b) 예제 ===")

# 바이너리 데이터 준비
data = "Hello, Binary Mode!"
print(f"원본 데이터: {data}")

# 바이너리 쓰기 모드로 파일 열기
with open("test.bin", "wb") as f:
    f.write(data.encode())

# 바이너리 읽기 모드로 파일 열기
with open("test.bin", "rb") as f:
    binary_data = f.read()
    decoded_data = binary_data.decode()
    print(f"읽은 데이터: {decoded_data}", end="")
```

**출력:**
```
=== 바이너리 모드(b) 예제 ===
원본 데이터: Hello, Binary Mode!
읽은 데이터: Hello, Binary Mode!
```

```python
print("=== 한 줄씩 읽기 예제 ===")

# 파일을 한 줄씩 읽기
with open("test.txt", "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        print(f"{i}번째 줄: {line.strip()}", end="\n" if i < 5 else "")
```

**출력:**
```
=== 한 줄씩 읽기 예제 ===
1번째 줄: 첫 번째 줄
2번째 줄: 두 번째 줄
3번째 줄: 세 번째 줄
4번째 줄: 네 번째 줄 (추가)
5번째 줄: 다섯 번째 줄 (추가)
```

## 🎯 실습 문제 [order: 1.8]

### 1. 파이썬 인터프리터에서 계산기처럼 사용하기
2 + 5 * 10 연산을 실행하고 결과를 출력해보세요.  
100 / 3 연산을 실행하고 소수점 아래까지 결과를 확인해보세요.

```python
# 기본 계산기 실습

# 1. 기본 연산
print("=== 기본 연산 실습 ===")
result1 = 2 + 5 * 10
print("2 + 5 * 10 =", result1)  # 연산자 우선순위에 따라 52가 출력됨

result2 = 100 / 3
print("100 / 3 =", result2)  # 소수점까지 정확한 나눗셈 결과

# 2. 다양한 연산 실습
print("\n=== 추가 연산 실습 ===")
# 제곱 연산
print("2 ** 3 =", 2 ** 3)  # 2의 3제곱

# 나눗셈 몫
print("10 // 3 =", 10 // 3)  # 몫만 구하기

# 나눗셈 나머지
print("10 % 3 =", 10 % 3)  # 나머지만 구하기

# 3. 복합 연산 실습
print("\n=== 복합 연산 실습 ===")
result3 = (2 + 5) * 10  # 괄호 사용
print("(2 + 5) * 10 =", result3)

result4 = round(100 / 3, 2)  # 소수점 둘째자리까지 반올림
print("100 / 3 (반올림) =", result4)

# 4. 대화형 계산기
print("\n=== 대화형 계산기 ===")
try:
    num1 = float(input("첫 번째 숫자를 입력하세요: "))
    num2 = float(input("두 번째 숫자를 입력하세요: "))
    
    print(f"\n{num1} + {num2} = {num1 + num2}")
    print(f"{num1} - {num2} = {num1 - num2}")
    print(f"{num1} * {num2} = {num1 * num2}")
    print(f"{num1} / {num2} = {num1 / num2}")
except ValueError:
    print("올바른 숫자를 입력해주세요.")
except ZeroDivisionError:
    print("0으로 나눌 수 없습니다.")
```

**출력 예시:**
```
=== 기본 연산 실습 ===
2 + 5 * 10 = 52
100 / 3 = 33.333333333333336

=== 추가 연산 실습 ===
2 ** 3 = 8
10 // 3 = 3
10 % 3 = 1

=== 복합 연산 실습 ===
(2 + 5) * 10 = 70
100 / 3 (반올림) = 33.33

=== 대화형 계산기 ===
첫 번째 숫자를 입력하세요: 4
두 번째 숫자를 입력하세요: 5

4.0 + 5.0 = 9.0
4.0 - 5.0 = -1.0
4.0 * 5.0 = 20.0
4.0 / 5.0 = 0.8
```

### 2. 간단한 프로그램 작성하기
아래의 코드를 파일(`my_info.py`)로 저장하고 실행해 보세요.

```python
# my_info.py
name = input("당신의 이름은 무엇인가요? ")
age = input("당신의 나이는 몇 살인가요? ")

print(f"안녕하세요, {name}님! 당신의 나이는 {age}살입니다.")
```

**출력 예시:**
```
당신의 이름은 무엇인가요? s
당신의 나이는 몇 살인가요? s
안녕하세요, s님! 당신의 나이는 s살입니다.
```

### 3. 변수와 데이터 타입 실습
사용자로부터 이름, 나이, 키를 입력받아 각각의 데이터 타입을 확인하고, 내년 나이를 계산하여 출력하는 프로그램을 작성하세요.

**요구사항:**
- 이름은 문자열로 처리
- 나이는 정수로 변환
- 키는 실수로 변환
- 각 데이터의 타입을 출력
- 내년 나이 계산 및 출력

```python
# 실습 3 풀이
print("=== 변수와 데이터 타입 실습 ===")

# 사용자 입력 받기
name = input("이름을 입력하세요: ")
age = int(input("나이를 입력하세요: "))
height = float(input("키를 입력하세요(cm): "))

# 입력 받은 정보 출력
print(f"이름: {name}")
print(f"나이: {age}")
print(f"키: {height}cm")

# 데이터 타입 확인
print("\n데이터 타입 확인:")
print(f"이름의 타입: {type(name)}")
print(f"나이의 타입: {type(age)}")
print(f"키의 타입: {type(height)}")

# 정보 활용
print("\n정보 출력:")
print(f"안녕하세요, {name}님!")
print(f"현재 나이: {age}살")
print(f"내년 나이: {age + 1}살")
print(f"키: {height}cm", end="")
```

**출력 예시:**
```
=== 변수와 데이터 타입 실습 ===
이름을 입력하세요: 홍길동
나이를 입력하세요: 25
키를 입력하세요(cm): 175.5
이름: 홍길동
나이: 25
키: 175.5cm

데이터 타입 확인:
이름의 타입: <class 'str'>
나이의 타입: <class 'int'>
키의 타입: <class 'float'>

정보 출력:
안녕하세요, 홍길동님!
현재 나이: 25살
내년 나이: 26살
키: 175.5cm
```

### 4. 조건문 실습
학생의 점수를 입력받아 학점을 계산하는 프로그램을 작성하세요.

**요구사항:**
- 90점 이상: A
- 80점 이상: B
- 70점 이상: C
- 60점 이상: D
- 60점 미만: F
- 각 학점별로 다른 평가 메시지 출력

```python
# 실습 4 풀이
print("=== 학점 계산 프로그램 ===\n")

# 점수 입력
score = int(input("점수를 입력하세요 (0-100): "))
print(f"입력한 점수: {score}점\n")

# 학점 계산
if score >= 90:
    grade = "A"
    message = "탁월한 성적입니다!"
    extra = "축하합니다! 최고 학점을 받으셨습니다."
elif score >= 80:
    grade = "B"
    message = "우수한 성적입니다!"
    extra = f"{90-score}점만 더 높았다면 A학점이었습니다."
elif score >= 70:
    grade = "C"
    message = "좋은 성적입니다."
    extra = f"{80-score}점만 더 높았다면 B학점이었습니다."
elif score >= 60:
    grade = "D"
    message = "조금 더 노력이 필요합니다."
    extra = f"{70-score}점만 더 높았다면 C학점이었습니다."
else:
    grade = "F"
    message = "재수강이 필요합니다."
    extra = f"{60-score}점만 더 높았다면 D학점이었습니다."

# 결과 출력
print("결과:")
print(f"- 학점: {grade}")
print(f"- 평가: {message}")
print(f"- 추가 정보: {extra}", end="")
```

**출력 예시:**
```
=== 학점 계산 프로그램 ===

점수를 입력하세요 (0-100): 85
입력한 점수: 85점

결과:
- 학점: B
- 평가: 우수한 성적입니다!
- 추가 정보: 5점만 더 높았다면 A학점이었습니다.
```

### 5. 반복문 실습
사용자가 입력한 범위의 숫자들에 대해 다음을 계산하는 프로그램을 작성하세요.

**요구사항:**
- 시작 숫자와 끝 숫자를 입력받음
- 해당 범위의 모든 숫자의 합계
- 짝수의 합계
- 홀수의 합계
- 평균값
- 계산 과정을 시각적으로 표시

```python
# 실습 5 풀이
print("=== 숫자 범위 계산 프로그램 ===\n")

# 범위 입력
start = int(input("시작 숫자를 입력하세요: "))
end = int(input("끝 숫자를 입력하세요: "))

# 변수 초기화
total = 0
even_sum = 0
odd_sum = 0
even_count = 0
odd_count = 0

# 계산 과정 출력
print("\n계산 과정:")
for i in range(start, end + 1):
    total += i
    if i % 2 == 0:
        even_sum += i
        even_count += 1
    else:
        odd_sum += i
        odd_count += 1
    
    if i < end:
        print(i, end=" + ")
    else:
        print(i)

# 결과 출력
count = end - start + 1
print("\n계산 결과:")
print(f"- 전체 합계: {total}")
print(f"- 짝수 합계: {even_sum}")
print(f"- 홀수 합계: {odd_sum}")
print(f"- 평균값: {total/count}")

print("\n추가 정보:")
print(f"- 짝수 개수: {even_count}개")
print(f"- 홀수 개수: {odd_count}개", end="")
```

**출력 예시:**
```
=== 숫자 범위 계산 프로그램 ===

시작 숫자를 입력하세요: 1
끝 숫자를 입력하세요: 10

계산 과정:
1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10

계산 결과:
- 전체 합계: 55
- 짝수 합계: 30
- 홀수 합계: 25
- 평균값: 5.5

추가 정보:
- 짝수 개수: 5개
- 홀수 개수: 5개
```

### 6. 데이터 구조 실습
학생들의 성적 정보를 관리하는 프로그램을 작성하세요.

**요구사항:**
- 학생 이름과 점수를 입력받아 딕셔너리에 저장
- 전체 학생 목록과 점수 출력
- 최고점과 최저점 출력
- 평균 점수 계산
- 특정 점수 이상인 학생들의 명단 출력

```python
# 실습 6 풀이
print("=== 학생 성적 관리 프로그램 ===\n")

# 학생 정보 저장할 딕셔너리
students = {}

# 학생 정보 입력
while True:
    name = input("학생 이름을 입력하세요 (종료하려면 q): ")
    if name.lower() == 'q':
        break
    score = int(input(f"{name}의 점수를 입력하세요: "))
    students[name] = score

# 전체 학생 성적 출력
print("\n전체 학생 성적:")
for name, score in students.items():
    print(f"- {name}: {score}점")

# 성적 분석
max_score = max(students.values())
min_score = min(students.values())
avg_score = sum(students.values()) / len(students)

# 최고점과 최저점 학생 찾기
max_student = [name for name, score in students.items() if score == max_score][0]
min_student = [name for name, score in students.items() if score == min_score][0]

print("\n성적 분석:")
print(f"- 최고점: {max_score}점 ({max_student})")
print(f"- 최저점: {min_score}점 ({min_student})")
print(f"- 평균점수: {avg_score}점")

# 80점 이상 학생 출력
print("\n80점 이상 학생 명단:")
high_scores = {name: score for name, score in students.items() if score >= 80}
for name, score in high_scores.items():
    print(f"- {name}: {score}점", end="")
```

**출력 예시:**
```
=== 학생 성적 관리 프로그램 ===

학생 이름을 입력하세요 (종료하려면 q): 홍길동
홍길동의 점수를 입력하세요: 85
학생 이름을 입력하세요 (종료하려면 q): 김철수
김철수의 점수를 입력하세요: 92
학생 이름을 입력하세요 (종료하려면 q): 이영희
이영희의 점수를 입력하세요: 78
학생 이름을 입력하세요 (종료하려면 q): q

전체 학생 성적:
- 홍길동: 85점
- 김철수: 92점
- 이영희: 78점

성적 분석:
- 최고점: 92점 (김철수)
- 최저점: 78점 (이영희)
- 평균점수: 85.0점

80점 이상 학생 명단:
- 홍길동: 85점
- 김철수: 92점
```

