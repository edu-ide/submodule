---

# 📘 1권 1부 4장: 입출력 및 파일 처리

## 📌 목차
4.1 표준 입출력  
4.2 파일 읽기 및 쓰기  
4.3 예외 처리  
4.4 CSV 및 JSON 파일 다루기  
4.5 파일 및 디렉터리 관리  

## 4.1 표준 입출력
### ✅ 4.1.1 표준 출력 (print())
파이썬에서 데이터를 출력할 때는 `print()` 함수를 사용합니다.  
`print()` 함수는 다양한 옵션을 제공하여 출력 형식을 조절할 수 있습니다.

주요 옵션:
- `sep`: 여러 값을 출력할 때 구분자 지정
- `end`: 출력 후 마지막에 추가할 문자 지정

```python
print("Hello, Python!")  # 문자열 출력
print(10)               # 정수 출력
print(3.14)            # 실수 출력

# sep와 end 옵션 활용
print("Python", "is", "awesome", sep="-")  # 단어 사이를 "-"로 연결
print("Hello", end=" ")  # 줄바꿈 없이 출력
print("World!")         # Hello World! 출력
```

### ✅ 4.1.2 표준 입력 (input())
사용자로부터 입력을 받을 때는 `input()` 함수를 사용합니다.  
`input()` 함수는 항상 문자열을 반환하므로, 숫자를 입력받을 때는 형변환이 필요합니다.

```python
# 문자열 입력 받기
name = input("이름을 입력하세요: ") # 프롬프트 메시지 출력
print(f"안녕하세요, {name}님!")

# 숫자 입력 받기
age = int(input("나이를 입력하세요: "))  # 문자열을 정수로 변환
print(f"내년 나이는 {age + 1}살입니다.")
```

## 4.2 파일 읽기 및 쓰기 (open() 함수 사용)
파이썬에서는 `open()` 함수를 사용하여 파일을 읽고 쓸 수 있습니다.  
파일을 열 때는 적절한 모드를 선택해야 합니다.

| 모드 | 설명                     |
|------|--------------------------|
| 'r'  | 읽기 모드 (파일이 존재해야 함) |
| 'w'  | 쓰기 모드 (기존 파일을 덮어씀) |
| 'a'  | 추가 모드 (파일 끝에 내용 추가) |
| 'x'  | 배타적 생성 (새 파일을 만들 때) |
| 'b'  | 바이너리 모드 (이미지나 동영상 파일) |

```python
# 파일 쓰기 예제
with open("hello.txt", "w") as file:
    file.write("Hello, Python!\n")
    file.write("파일을 다루는 방법을 배워봅시다.\n")

# 파일 읽기 예제
with open("hello.txt", "r") as file:
    content = file.read()
    print(content)
```

## 4.3 예외 처리 (try-except)
파일 작업 중 발생할 수 있는 다양한 오류를 안전하게 처리하는 방법을 알아봅시다.

### 주요 예외 유형:
- `FileNotFoundError`: 파일을 찾을 수 없을 때
- `PermissionError`: 파일 접근 권한이 없을 때
- `IOError`: 입출력 작업 중 오류가 발생할 때

### try-except 구문의 기본 구조:
```python
try:
    # 실행할 코드
except 예외유형:
    # 예외 발생 시 실행할 코드
else:
    # 예외가 발생하지 않았을 때 실행할 코드
finally:
    # 항상 실행할 코드
```

```python
# 파일이 없는 경우 예외 처리
try:
    with open("nonexistent.txt", "r") as file:
        content = file.read()
        print(content)
except FileNotFoundError:
    print("파일을 찾을 수 없습니다.")
except PermissionError:
    print("파일 접근 권한이 없습니다.")
finally:
    print("파일 처리를 완료했습니다.")
```

## 4.4 CSV 및 JSON 파일 다루기

### CSV (Comma-Separated Values)
- 쉼표로 구분된 데이터를 저장하는 텍스트 파일 형식
- 표 형식의 데이터를 저장하기에 적합
- Excel과 호환성이 좋음

### JSON (JavaScript Object Notation)
- 데이터를 구조화하여 저장하는 텍스트 기반 형식
- 키-값 쌍으로 데이터를 표현
- 웹 API에서 많이 사용됨

### 주요 기능:
- `csv.reader()`: CSV 파일 읽기
- `csv.writer()`: CSV 파일 쓰기
- `json.dump()`: Python 객체를 JSON 파일로 저장
- `json.load()`: JSON 파일을 Python 객체로 로드

```python
import csv
import json

# CSV 파일 쓰기 예제
with open("data.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["이름", "나이", "도시"])  # 헤더 작성
    writer.writerow(["Alice", 25, "Seoul"])   # 데이터 작성
    writer.writerow(["Bob", 30, "Busan"])

# CSV 파일 읽기 예제
with open("data.csv", "r") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)

# JSON 파일 쓰기 예제
data = {
    "name": "Alice",
    "age": 25,
    "city": "Seoul"
}

with open("data.json", "w") as file:
    json.dump(data, file, indent=4)  # indent로 가독성 향상

# JSON 파일 읽기 예제
with open("data.json", "r") as file:
    loaded_data = json.load(file)
    print(loaded_data)
```

## 4.5 파일 및 디렉터리 관리 (os 모듈 활용)

### os 모듈의 주요 기능:
1. **파일 관리**
   - `os.remove()`: 파일 삭제
   - `os.rename()`: 파일 이름 변경
   - `os.path.exists()`: 파일 존재 여부 확인

2. **디렉터리 관리**
   - `os.getcwd()`: 현재 작업 디렉터리 확인
   - `os.chdir()`: 디렉터리 변경
   - `os.mkdir()`: 디렉터리 생성
   - `os.rmdir()`: 디렉터리 삭제

3. **경로 관리**
   - `os.path.join()`: 경로 결합
   - `os.path.split()`: 경로와 파일명 분리
   - `os.path.dirname()`: 디렉터리 경로 추출
   - `os.path.basename()`: 파일명 추출

```python
import os

# 현재 작업 디렉터리 확인
current_dir = os.getcwd()
print(f"현재 디렉터리: {current_dir}")

# 새 디렉터리 생성
if not os.path.exists("new_folder"):
    os.mkdir("new_folder")
    print("새 폴더가 생성되었습니다.")

# 파일 존재 여부 확인 및 삭제
file_path = "data.json"
if os.path.exists(file_path):
    os.remove(file_path)
    print(f"{file_path} 파일이 삭제되었습니다.")

# 경로 다루기
path = os.path.join("new_folder", "test.txt")
print(f"전체 경로: {path}")
print(f"디렉터리: {os.path.dirname(path)}")
print(f"파일명: {os.path.basename(path)}")
```

## 🎯 실습 문제

### [실습 1] 학생 성적 관리 시스템

요구사항:
1. 학생 정보 입력 받기 (이름, 국어, 영어, 수학)
2. 입력된 정보를 CSV 파일로 저장
3. 각 과목의 평균, 최고점, 최저점 계산
4. 결과를 JSON 파일로 저장

사용 예시:
```
학생 성적 입력 (종료: q)
이름: 김철수
국어: 85
영어: 92
수학: 88
```

출력 예시 (`results.json`):
```json
{
    "국어": {
        "평균": 87.5,
        "최고점": 90,
        "최저점": 85
    }
}
```

```python
import csv
import json

def input_grades():
    students = []
    while True:
        name = input("\n이름 (종료: q): ")
        if name.lower() == 'q':
            break
            
        grades = {}
        try:
            grades['국어'] = int(input("국어: "))
            grades['영어'] = int(input("영어: "))
            grades['수학'] = int(input("수학: "))
            
            students.append({'이름': name, **grades})
        except ValueError:
            print("올바른 점수를 입력하세요.")
    
    return students

def save_to_csv(students, filename='grades.csv'):
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['이름', '국어', '영어', '수학'])
        writer.writeheader()
        writer.writerows(students)

def calculate_stats(students):
    stats = {}
    subjects = ['국어', '영어', '수학']
    
    for subject in subjects:
        scores = [s[subject] for s in students]
        stats[subject] = {
            '평균': sum(scores) / len(scores),
            '최고점': max(scores),
            '최저점': min(scores)
        }
    
    return stats

def save_to_json(stats, filename='results.json'):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=4)

def main():
    students = input_grades()
    if students:
        save_to_csv(students)
        stats = calculate_stats(students)
        save_to_json(stats)
        print("\n처리가 완료되었습니다.")

if __name__ == "__main__":
    main()
```

### [실습 2] 파일 암호화/복호화 프로그램

요구사항:
1. 텍스트 파일 암호화 (Caesar 암호)
2. 암호화된 파일 복호화
3. 암호화 키 관리
4. 예외 처리

사용 예시:
```
1. 파일 암호화
2. 파일 복호화
3. 종료

선택: 1
파일명: message.txt
암호화 키(1-10): 3
```

출력 예시:
```
원본: Hello, World!
암호화: Khoor, Zruog!
```

```python
def encrypt_decrypt(text, key, mode='encrypt'):
    result = ''
    key = key if mode == 'encrypt' else -key
    
    for char in text:
        if char.isalpha():
            ascii_offset = ord('A') if char.isupper() else ord('a')
            result += chr((ord(char) - ascii_offset + key) % 26 + ascii_offset)
        else:
            result += char
    
    return result

def process_file(filename, key, mode='encrypt'):
    try:
        with open(filename, 'r') as f:
            text = f.read()
        
        result = encrypt_decrypt(text, key, mode)
        
        output_filename = f"{filename}.{mode}ed"
        with open(output_filename, 'w') as f:
            f.write(result)
            
        return True
    except FileNotFoundError:
        print("파일을 찾을 수 없습니다.")
        return False

def main():
    while True:
        print("\n1. 파일 암호화")
        print("2. 파일 복호화")
        print("3. 종료")
        
        choice = input("\n선택: ")
        if choice == '3':
            break
            
        filename = input("파일명: ")
        key = int(input("암호화 키(1-10): "))
        
        if choice == '1':
            if process_file(filename, key, 'encrypt'):
                print("암호화가 완료되었습니다.")
        elif choice == '2':
            if process_file(filename, key, 'decrypt'):
                print("복호화가 완료되었습니다.")

if __name__ == "__main__":
    main()
```

## 📌 4장 요약

✅ **표준 입출력**
- `print()` 함수로 데이터 출력
- `input()` 함수로 사용자 입력 받기
- `sep`, `end` 옵션으로 출력 형식 조절

✅ **파일 처리**
- `open()` 함수로 파일 열기
- `with` 문으로 안전한 파일 처리
- 다양한 파일 모드 활용

✅ **예외 처리**
- `try-except`로 오류 상황 대비
- 파일 처리 시 발생할 수 있는 예외 처리

✅ **특수 파일 형식**
- CSV 파일 읽기/쓰기
- JSON 데이터 처리
- 구조화된 데이터 활용

✅ **파일 시스템 관리**
- `os` 모듈 활용
- 파일 및 디렉터리 조작
- 시스템 경로 다루기

---