---

# 📘 6.2 패키지(Package)란?
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

--- 