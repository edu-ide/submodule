---

# 📘 10.2 코드 프로파일링

## ✅ 10.2.1 cProfile 사용법
1. **함수별 실행 시간 분석**
2. **호출 횟수 추적**
3. **재귀 함수 분석**

```python
import cProfile
import pstats

def analyze_performance():
    """상세한 성능 분석 예제"""
    profiler = cProfile.Profile()
    profiler.enable()
    
    # 분석할 코드
    result = [i**2 for i in range(10**5)]
    
    profiler.disable()
    stats = pstats.Stats(profiler).sort_stats('cumtime')
    stats.print_stats()
    
    return result
```

## ✅ 10.2.2 line_profiler 활용하기

line_profiler는 라인별 실행 시간을 측정해 주는 강력한 도구입니다. 이 도구는 코드의 어떤 줄이 병목을 일으키는지 정확하게 파악하는 데 도움을 줍니다.

```python
# line_profiler 설치 필요: pip install line_profiler
# 사용 예시

# 1. 함수에 @profile 데코레이터 추가
@profile
def calculate_factorial(n):
    """팩토리얼 계산 함수"""
    if n == 0 or n == 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

# 2. kernprof 명령으로 실행: 
# 터미널에서: kernprof -l script.py
# 결과 보기: python -m line_profiler script.py.lprof
```

## ✅ 10.2.3 timeit으로 코드 스니펫 시간 측정

특정 코드 조각의 실행 시간을 정확하게 측정하려면 `timeit` 모듈이 유용합니다.

```python
import timeit

# 측정할 코드 조각
code_snippet = """
result = []
for i in range(1000):
    result.append(i ** 2)
"""

# 리스트 컴프리헨션 방식
list_comprehension = """
result = [i ** 2 for i in range(1000)]
"""

# 각 방식의 실행 시간 측정
time1 = timeit.timeit(stmt=code_snippet, number=10000)
time2 = timeit.timeit(stmt=list_comprehension, number=10000)

print(f"일반 루프 방식: {time1:.6f}초")
print(f"리스트 컴프리헨션: {time2:.6f}초")
print(f"성능 향상: {(time1-time2)/time1*100:.2f}%")
```

## ✅ 10.2.4 프로파일링 결과 해석하기

cProfile이나 line_profiler 결과를 효과적으로 해석하는 방법:

1. **총 실행 시간(tottime)**: 함수 자체 실행에 소요된 시간
2. **누적 시간(cumtime)**: 함수 및 하위 호출을 포함한 총 시간
3. **호출 횟수(ncalls)**: 함수가 호출된 횟수
4. **호출당 시간(percall)**: 함수 호출당 평균 시간

```python
# 프로파일링 결과 시각화 예제
import cProfile
import pstats
import io

def profile_and_visualize(func, *args, **kwargs):
    """함수 프로파일링 후 결과 시각화"""
    pr = cProfile.Profile()
    pr.enable()
    
    result = func(*args, **kwargs)
    
    pr.disable()
    s = io.StringIO()
    ps = pstats.Stats(pr, stream=s).sort_stats('cumtime')
    ps.print_stats(20)  # 상위 20개 결과만 출력
    
    print(s.getvalue())
    return result
```

--- 