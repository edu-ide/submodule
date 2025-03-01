---

# 📘 6.1 모듈(Module)이란?
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

--- 