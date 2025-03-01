---

# 📘 10.3 메모리 최적화

## ✅ 10.3.1 메모리 프로파일링
1. **`memory_profiler` 사용법**
   - 라인별 메모리 사용량 분석
   - 메모리 누수 탐지
   - 최적화 포인트 발견

```python
from memory_profiler import profile

@profile
def memory_intensive_function():
    """메모리 사용량이 많은 함수"""
    # 리스트 컴프리헨션 (비효율적)
    data = [i ** 2 for i in range(10**6)]
    
    # 제너레이터 표현식 (효율적)
    data_gen = (i ** 2 for i in range(10**6))
    
    return sum(data_gen)

# 실행
result = memory_intensive_function()
```

## ✅ 10.3.2 메모리 최적화 기법
1. **제너레이터 활용**
2. **청크 단위 처리**
3. **캐시 활용**

```python
from functools import lru_cache

# 캐시를 사용한 최적화
@lru_cache(maxsize=128)
def fibonacci(n):
    """피보나치 수열 계산 (캐시 활용)"""
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 청크 단위 파일 처리
def process_large_file(filename, chunk_size=1024):
    """대용량 파일 청크 단위 처리"""
    with open(filename, 'rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            process_chunk(chunk)

def process_chunk(chunk):
    """청크 데이터 처리"""
    pass  # 실제 처리 로직 구현
```

## ✅ 10.3.3 메모리 누수 방지

파이썬은 가비지 컬렉터가 있지만, 순환 참조 등으로 인한 메모리 누수가 발생할 수 있습니다. 이를 방지하는 방법을 알아봅시다.

```python
import gc
import weakref

# 약한 참조 사용 예제
class Node:
    def __init__(self, value):
        self.value = value
        self.parent = None
        self.children = []
        
    def add_child(self, child):
        # 강한 참조 대신 약한 참조 사용
        child.parent = weakref.ref(self)
        self.children.append(child)

# 가비지 컬렉션 강제 실행
def force_gc():
    # 가비지 컬렉션 실행 전 후 메모리 상태 확인
    before = len(gc.get_objects())
    gc.collect()
    after = len(gc.get_objects())
    print(f"GC 실행 결과: {before - after}개 객체 수거")
```

## ✅ 10.3.4 대용량 데이터 처리 최적화

NumPy 배열이나 Pandas DataFrame을 사용할 때 메모리 사용량을 줄이는 방법:

```python
import numpy as np
import pandas as pd

def optimize_numeric_arrays():
    # 일반 정수 배열 (64비트)
    standard_array = np.array([1, 2, 3, 4, 5], dtype=np.int64)
    
    # 최적화된 정수 배열 (8비트)
    optimized_array = np.array([1, 2, 3, 4, 5], dtype=np.int8)
    
    print(f"표준 배열 메모리: {standard_array.nbytes} bytes")
    print(f"최적화 배열 메모리: {optimized_array.nbytes} bytes")
    print(f"최적화 비율: {standard_array.nbytes / optimized_array.nbytes}배")
    
    return optimized_array

def optimize_dataframe():
    # 원본 데이터프레임
    df = pd.DataFrame({
        'id': np.arange(10000),
        'value': np.random.randn(10000)
    })
    
    # 메모리 사용량 확인
    original_memory = df.memory_usage(deep=True).sum()
    
    # 데이터 타입 최적화
    df_optimized = df.copy()
    df_optimized['id'] = df_optimized['id'].astype('int32')
    
    # 최적화 후 메모리 사용량
    optimized_memory = df_optimized.memory_usage(deep=True).sum()
    
    print(f"원본 메모리: {original_memory / 1024:.2f} KB")
    print(f"최적화 후: {optimized_memory / 1024:.2f} KB")
    print(f"절약: {(original_memory - optimized_memory) / original_memory * 100:.2f}%")
    
    return df_optimized
```

--- 