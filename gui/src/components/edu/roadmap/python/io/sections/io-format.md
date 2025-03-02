---

# 📘 입출력 및 파일 처리 - CSV 및 JSON 파일 다루기

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