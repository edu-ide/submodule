---

# 📘 입출력 및 파일 처리 - 실습 문제

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