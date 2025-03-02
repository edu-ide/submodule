 # 모듈과 패키지
## 파이썬 코드 구조화와 재사용 시스템

## 1. 기본 모듈 사용
```python
# 수학 모듈 임포트
import math
print(math.sqrt(9))  # 3.0

# 선택적 임포트
from datetime import date
print(date.today())
```

## 2. 패키지 구조 생성
```text
my_package/
├── __init__.py          # 패키지 초기화 파일
├── calculator/
│   ├── __init__.py
│   ├── basic_math.py    # 사칙연산 함수
│   └── scientific.py    # 과학 계산 함수
└── utils/
    ├── __init__.py
    └── converter.py     # 단위 변환 유틸리티
```

## 3. __init__.py 예시
```python
# calculator/__init__.py
from .basic_math import add, subtract
from .scientific import sqrt

__all__ = ['add', 'subtract', 'sqrt']
```

## 4. 패키지 사용 예시
```python
from my_package.calculator import add
from my_package.utils.converter import celsius_to_fahrenheit

print(add(2, 3))  # 5
print(celsius_to_fahrenheit(25))  # 77.0
```

## 5. setup.py 예시 (배포용)
```python
from setuptools import setup, find_packages

setup(
    name="my_package",
    version="0.1",
    packages=find_packages(),
    install_requires=['numpy>=1.20']
)
```

---
**📚 학습 리소스**
- [Python Packaging User Guide](https://packaging.python.org/)
- [PEP 420 - Implicit Namespace Packages](https://www.python.org/dev/peps/pep-0420/)

**🏆 도전 과제**
- 계산기 패키지 만들기:
  1. basic_math.py에 사칙연산 함수 구현
  2. scientific.py에 제곱근/로그 함수 추가
  3. setup.py로 패키징 후 설치 테스트