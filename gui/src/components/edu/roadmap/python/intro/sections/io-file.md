# 입출력 및 파일 처리

## 📌 표준 입출력
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

## 📌 파일 읽기 및 쓰기
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

## 📌 파일 모드
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