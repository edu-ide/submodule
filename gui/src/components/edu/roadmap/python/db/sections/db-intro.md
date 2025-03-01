---

# 📘 파일 및 데이터베이스 관리 - CSV 및 JSON 파일 처리

## 7.1 CSV 및 JSON 파일 처리

### ✅ 7.1.1 CSV 파일 다루기
CSV(Comma-Separated Values)는 데이터를 쉼표로 구분하여 저장하는 텍스트 파일 형식입니다.

**장점:**
- 간단한 데이터 구조
- Excel과 호환성이 좋음
- 텍스트 에디터로 읽기 가능

**주의사항:**
- `newline=''` 옵션 사용 (줄바꿈 문제 방지)
- 인코딩 설정 (한글 처리)
- 데이터 타입 변환 필요 (모든 값이 문자열로 읽힘)

```python
import csv

# CSV 파일 쓰기 예제
data = [
    ['이름', '나이', '도시'],
    ['Alice', 25, 'Seoul'],
    ['Bob', 30, 'Busan']
]

with open('data.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerows(data)

# CSV 파일 읽기 예제
with open('data.csv', 'r', encoding='utf-8') as file:
    reader = csv.reader(file)
    next(reader)  # 헤더 건너뛰기
    for row in reader:
        name, age, city = row
        print(f"{name}님은 {age}세이고 {city}에 살고 있습니다.")
```

### ✅ 7.1.2 JSON 파일 다루기
JSON은 데이터를 키-값 쌍으로 저장하는 텍스트 기반 형식입니다.

**특징:**
- 계층적 데이터 구조 표현 가능
- 웹 API에서 널리 사용
- 다양한 데이터 타입 지원 (문자열, 숫자, 불리언, 배열, 객체)

**주요 메서드:**
- `json.dump()`: Python 객체를 JSON 파일로 저장
- `json.load()`: JSON 파일을 Python 객체로 로드
- `json.dumps()`: Python 객체를 JSON 문자열로 변환
- `json.loads()`: JSON 문자열을 Python 객체로 변환

```python
import json

# JSON 데이터 생성
data = {
    'name': 'Alice',
    'age': 25,
    'city': 'Seoul',
    'hobbies': ['reading', 'swimming'],
    'has_license': True
}

# JSON 파일로 저장
with open('data.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, indent=4, ensure_ascii=False)

# JSON 파일 읽기
with open('data.json', 'r', encoding='utf-8') as file:
    loaded_data = json.load(file)
    print(f"이름: {loaded_data['name']}")
    print(f"취미: {', '.join(loaded_data['hobbies'])}")
``` 