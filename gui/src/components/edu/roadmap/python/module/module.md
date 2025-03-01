---

# 📘 1권 2부 6장: 모듈과 패키지

## 📌 목차
6.1 모듈(Module)이란?  
6.2 패키지(Package)란?  
6.3 패키지 설치 및 관리 (pip)  
6.4 가상환경 설정 (venv)  
6.5 자주 사용하는 서드파티 라이브러리  

## 6.1 모듈(Module)이란?
모듈은 관련된 코드를 하나의 파일에 모아놓은 것입니다.

### 모듈의 장점:
1. **재사용성**: 코드를 여러 프로젝트에서 재사용 가능
2. **가독성**: 코드를 논리적 단위로 구분하여 관리
3. **유지보수성**: 코드 수정이 용이
4. **네임스페이스**: 이름 충돌 방지

### 모듈 import 방법:
1. `import 모듈명`
2. `from 모듈명 import 함수명`
3. `from 모듈명 import *`
4. `import 모듈명 as 별칭`

```python
# 내장 모듈 사용 예제
import math
import random
import datetime

# math 모듈
print(f"제곱근: {math.sqrt(16)}")
print(f"팩토리얼: {math.factorial(5)}")
print(f"원주율: {math.pi}")

# random 모듈
print(f"랜덤 숫자: {random.randint(1, 10)}")
print(f"랜덤 선택: {random.choice(['apple', 'banana', 'orange'])}")

# datetime 모듈
print(f"현재 시간: {datetime.datetime.now()}")
```

### ✅ 6.1.2 사용자 정의 모듈 만들기
사용자가 직접 모듈을 생성하고 관리할 수 있습니다.

1. 모듈 파일 생성 (.py)
2. 함수, 클래스, 변수 정의
3. 다른 파일에서 import하여 사용

```python
# my_module.py 파일 내용
def add(a, b):
    """두 수를 더하는 함수"""
    return a + b

def subtract(a, b):
    """두 수를 빼는 함수"""
    return a - b

# 상수 정의
PI = 3.14159
GRAVITY = 9.81
```

## 6.2 패키지(Package)란?
패키지는 여러 모듈을 체계적으로 관리하기 위한 디렉터리 구조입니다.

### 패키지의 특징:
1. **계층 구조**: 모듈을 논리적으로 구조화
2. **네임스페이스**: 모듈 이름 충돌 방지
3. **확장성**: 쉽게 새로운 모듈 추가 가능
4. **재사용성**: 전체 패키지 단위로 재사용 가능

### 패키지 구조 예시:
```
mypackage/
├── __init__.py
├── math/
│   ├── __init__.py
│   ├── basic.py
│   └── advanced.py
└── utils/
    ├── __init__.py
    ├── string_ops.py
    └── file_ops.py
```

```python
# 패키지 사용 예제
from mypackage.math import basic
from mypackage.utils import string_ops

result = basic.add(10, 5)
text = string_ops.uppercase("hello world")

print(f"계산 결과: {result}")
print(f"변환된 텍스트: {text}")
```

## 6.3 패키지 설치 및 관리 (pip)
pip는 Python Package Index(PyPI)에서 패키지를 설치하고 관리하는 도구입니다.

### pip 기본 명령어와 사용법
```bash
# 패키지 설치
pip install 패키지명
pip install requests

# 특정 버전 설치
pip install requests==2.30.0

# 패키지 업그레이드
pip install --upgrade requests

# 패키지 제거
pip uninstall requests

# 설치된 패키지 목록
pip list

# 설치된 패키지 버전 정보
pip freeze

# requirements.txt 파일의 패키지 설치
pip install -r requirements.txt
```

```python
# pip로 설치한 패키지 사용 예제
import requests

def test_api_request():
    """API 요청 테스트 함수"""
    try:
        # GitHub API 호출
        response = requests.get('https://api.github.com')
        
        # 상태 코드 확인
        print(f"상태 코드: {response.status_code}")
        
        # 응답 헤더 확인
        print(f"\n응답 헤더:")
        for key, value in response.headers.items():
            print(f"{key}: {value}")
            
        # JSON 데이터 확인
        data = response.json()
        print(f"\nAPI 응답:\n{data}")
        
    except requests.RequestException as e:
        print(f"요청 중 오류 발생: {e}")

if __name__ == "__main__":
    test_api_request()
```

## 6.4 가상환경 설정 (venv)

### 가상환경 기본 명령어
```bash
# 가상환경 생성
python -m venv myenv

# 가상환경 활성화
# Windows:
myenv\Scripts\activate
# macOS/Linux:
source myenv/bin/activate

# 가상환경 비활성화
deactivate
```

```python
# 가상환경 관리 스크립트
import os
import sys
import subprocess
import platform

class VenvManager:
    def __init__(self, venv_name="myenv"):
        self.venv_name = venv_name
        self.system = platform.system()
    
    def create_venv(self):
        """가상환경 생성"""
        if not os.path.exists(self.venv_name):
            print(f"가상환경 '{self.venv_name}' 생성 중...")
            subprocess.run([sys.executable, '-m', 'venv', self.venv_name])
            print("가상환경이 생성되었습니다.")
        else:
            print("가상환경이 이미 존재합니다.")
    
    def get_requirements(self):
        """설치된 패키지 목록 저장"""
        print("설치된 패키지 목록 저장 중...")
        subprocess.run(['pip', 'freeze', '>', 'requirements.txt'], shell=True)
        print("requirements.txt 파일이 생성되었습니다.")
    
    def install_requirements(self):
        """requirements.txt 패키지 설치"""
        if os.path.exists('requirements.txt'):
            print("패키지 설치 중...")
            subprocess.run(['pip', 'install', '-r', 'requirements.txt'])
            print("패키지 설치가 완료되었습니다.")
        else:
            print("requirements.txt 파일이 없습니다.")
    
    def show_venv_info(self):
        """가상환경 정보 출력"""
        print("\n=== 가상환경 정보 ===")
        print(f"Python 버전: {sys.version}")
        print(f"가상환경 위치: {sys.prefix}")
        print("\n설치된 패키지 목록:")
        subprocess.run(['pip', 'list'])

def main():
    manager = VenvManager()
    
    # 가상환경 생성
    manager.create_venv()
    
    # 패키지 설치 (예시)
    print("\n필수 패키지 설치 중...")
    subprocess.run(['pip', 'install', 'requests', 'pandas'])
    
    # requirements.txt 생성
    manager.get_requirements()
    
    # 가상환경 정보 출력
    manager.show_venv_info()

if __name__ == "__main__":
    main()
```

### 실행 결과 예시:
```
가상환경 'myenv' 생성 중...
가상환경이 생성되었습니다.

필수 패키지 설치 중...
Successfully installed requests-2.31.0 pandas-2.1.1

=== 가상환경 정보 ===
Python 버전: 3.8.10
가상환경 위치: /path/to/myenv

설치된 패키지 목록:
Package    Version
---------- -------
requests   2.31.0
pandas     2.1.1
```

## 6.5 자주 사용하는 서드파티 라이브러리

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

## 🎯 6장 실습 문제

### [실습 1] 사용자 정의 모듈 만들기
수학 연산을 수행하는 사용자 정의 모듈을 만들고 사용해보세요.

1. `math_tools.py` 파일 생성
2. `square()`와 `cube()` 함수 구현
3. 다른 파일에서 모듈 import
4. 함수 실행 및 결과 확인

```python
# math_tools.py 파일 내용
def square(n):
    """숫자의 제곱을 반환하는 함수"""
    return n ** 2

def cube(n):
    """숫자의 세제곱을 반환하는 함수"""
    return n ** 3
```

```python
# 모듈 사용 예제
import math_tools

# 제곱 계산
result1 = math_tools.square(4)
print(f"4의 제곱: {result1}")  # 16

# 세제곱 계산
result2 = math_tools.cube(3)
print(f"3의 세제곱: {result2}")  # 27
```

### [실습 2] 모듈 확장하기
`math_tools.py` 모듈에 다음 기능을 추가해보세요:

1. `is_even()`: 짝수 여부 확인
2. `factorial()`: 팩토리얼 계산
3. `sum_range()`: 범위 내 숫자 합계

```python
# math_tools.py 확장
def is_even(n):
    """짝수 여부를 확인하는 함수"""
    return n % 2 == 0

def factorial(n):
    """팩토리얼을 계산하는 함수"""
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

def sum_range(start, end):
    """주어진 범위의 숫자 합계를 계산하는 함수"""
    return sum(range(start, end + 1))
```

```python
# 확장된 모듈 테스트
print(f"10은 짝수인가요? {math_tools.is_even(10)}")
print(f"5 팩토리얼: {math_tools.factorial(5)}")
print(f"1부터 10까지의 합: {math_tools.sum_range(1, 10)}")
```

### 실습 문제 해설
1. **모듈 생성**
   - `.py` 확장자로 파일 생성
   - 관련 함수들을 하나의 파일에 모음
   - 각 함수에 문서화 문자열(docstring) 추가

2. **모듈 사용**
   - `import` 문으로 모듈 불러오기
   - 점(.) 연산자로 함수 접근
   - 함수 실행 및 결과 확인

3. **모듈 확장**
   - 새로운 함수 추가
   - 기존 코드 수정 없이 기능 확장
   - 체계적인 코드 관리

### 추가 도전 과제:
1. 삼각함수 계산 기능 추가 (sin, cos, tan)
2. 통계 함수 추가 (평균, 중앙값, 표준편차)
3. 단위 변환 함수 추가 (미터↔피트, 섭씨↔화씨)

## 📌 6장 요약
✅ 모듈과 패키지로 코드를 체계적으로 관리  
✅ pip로 외부 패키지 설치 및 관리  
✅ 가상환경으로 프로젝트별 독립적인 환경 구성  
✅ 다양한 서드파티 라이브러리 활용 가능  

### 추가 학습 자료:
1. [Python 공식 문서 - 모듈](https://docs.python.org/ko/3/tutorial/modules.html)
2. [pip 사용 가이드](https://pip.pypa.io/en/stable/)
3. [가상환경 설정 가이드](https://docs.python.org/ko/3/tutorial/venv.html)

---