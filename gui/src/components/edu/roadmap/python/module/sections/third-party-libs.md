---

# 📘 6.5 자주 사용하는 서드파티 라이브러리

### 1. requests - HTTP 요청 처리
- 웹 API 호출
- 파일 다운로드
- 웹 스크래핑

```python
import requests

# API 호출 예제
response = requests.get("https://api.github.com")
print(f"상태 코드: {response.status_code}")
print(f"헤더 정보: {response.headers['content-type']}")
print(f"응답 데이터: {response.json()}")
```

### 2. numpy - 수치 계산
- 다차원 배열 처리
- 선형 대수 연산
- 고성능 수치 계산

```python
import numpy as np

# 배열 생성 및 연산
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(f"배열 형태: {arr.shape}")
print(f"평균값: {arr.mean()}")
print(f"최댓값: {arr.max()}")
```

--- 