---

# 📘 2권 5장: 고급 성능 최적화 및 병렬 프로그래밍

## 📌 목차
15.1 멀티스레딩과 GIL의 이해  
15.2 multiprocessing을 활용한 병렬 프로그래밍  
15.3 비동기 프로그래밍 (asyncio)  
15.4 JIT 컴파일러 및 PyPy  
15.5 Cython 및 Numba를 활용한 성능 향상  

## 15.1 성능 최적화의 기본 원리

### ✅ 15.1.1 병렬 처리의 종류
1. **멀티스레딩**: 하나의 프로세스 내에서 여러 스레드 실행
2. **멀티프로세싱**: 여러 개의 프로세스를 병렬로 실행
3. **비동기 프로그래밍**: I/O 작업을 비동기적으로 처리

### ✅ 15.1.2 성능 최적화 도구
1. **프로파일링**: cProfile, line_profiler
2. **컴파일러**: Cython, Numba
3. **메모리 관리**: gc, memory_profiler

```python
import threading
import multiprocessing
import time
import asyncio
import aiohttp

class PerformanceOptimizer:
    """성능 최적화 유틸리티 클래스"""
    
    @staticmethod
    def cpu_intensive_task(n):
        """CPU 집중적인 작업"""
        return sum(i * i for i in range(n))
    
    @staticmethod
    def io_intensive_task(url):
        """I/O 집중적인 작업"""
        import requests
        return requests.get(url).text
    
    @classmethod
    def run_with_threading(cls, numbers):
        """멀티스레딩으로 실행"""
        threads = []
        results = []
        
        for n in numbers:
            thread = threading.Thread(
                target=lambda: results.append(cls.cpu_intensive_task(n))
            )
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
            
        return results
    
    @classmethod
    def run_with_multiprocessing(cls, numbers):
        """멀티프로세싱으로 실행"""
        with multiprocessing.Pool() as pool:
            return pool.map(cls.cpu_intensive_task, numbers)
    
    @staticmethod
    async def async_fetch(url):
        """비동기 HTTP 요청"""
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return await response.text()
    
    @classmethod
    async def run_with_asyncio(cls, urls):
        """비동기로 여러 URL 처리"""
        tasks = [cls.async_fetch(url) for url in urls]
        return await asyncio.gather(*tasks)
```

## 15.2 고급 병렬 처리 기법

### ✅ 15.2.1 프로세스 풀과 스레드 풀

```python
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

class ParallelProcessor:
    """고급 병렬 처리 클래스"""
    
    def __init__(self, max_workers=None):
        self.max_workers = max_workers or multiprocessing.cpu_count()
    
    def process_pool_execution(self, func, items):
        """프로세스 풀을 사용한 병렬 처리"""
        with ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            results = list(executor.map(func, items))
        return results
    
    def thread_pool_execution(self, func, items):
        """스레드 풀을 사용한 병렬 처리"""
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            results = list(executor.map(func, items))
        return results
    
    @staticmethod
    def benchmark(func, *args):
        """실행 시간 측정"""
        start_time = time.time()
        result = func(*args)
        end_time = time.time()
        return result, end_time - start_time
```

## 15.3 고급 비동기 프로그래밍

### ✅ 15.3.1 비동기 컨텍스트 매니저와 이벤트 루프

```python
class AsyncContextManager:
    """비동기 컨텍스트 매니저"""
    
    def __init__(self):
        self.lock = asyncio.Lock()
    
    async def __aenter__(self):
        await self.lock.acquire()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.lock.release()

class AsyncProcessor:
    """고급 비동기 처리 클래스"""
    
    def __init__(self):
        self.context = AsyncContextManager()
    
    async def process_with_retry(self, coro, max_retries=3):
        """재시도 기능이 있는 비동기 처리"""
        for attempt in range(max_retries):
            try:
                async with self.context:
                    return await coro
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)  # 지수 백오프
    
    @staticmethod
    async def gather_with_concurrency(n, *coros):
        """동시성 제한이 있는 비동기 수집"""
        semaphore = asyncio.Semaphore(n)
        
        async def wrapped_coro(coro):
            async with semaphore:
                return await coro
        
        return await asyncio.gather(
            *(wrapped_coro(c) for c in coros)
        )
```

## 15.4 성능 프로파일링 및 최적화

### ✅ 15.4.1 코드 프로파일링

```python
import cProfile
import pstats
from line_profiler import LineProfiler

class CodeProfiler:
    """코드 프로파일링 클래스"""
    
    @staticmethod
    def profile_function(func, *args, **kwargs):
        """함수 프로파일링"""
        profiler = cProfile.Profile()
        result = profiler.runcall(func, *args, **kwargs)
        stats = pstats.Stats(profiler)
        stats.sort_stats('cumulative').print_stats(20)
        return result
    
    @staticmethod
    def line_profile(func):
        """라인별 프로파일링"""
        lp = LineProfiler()
        wrapped = lp(func)
        
        def profiled_func(*args, **kwargs):
            result = wrapped(*args, **kwargs)
            lp.print_stats()
            return result
        
        return profiled_func
```

## 🎯 실습 프로젝트

### [실습 1] 대용량 데이터 병렬 처리

```python
def process_large_dataset():
    """대용량 데이터 병렬 처리 예제"""
    # 데이터 생성
    data = [(i, i * 2) for i in range(10**6)]
    
    # 병렬 처리기 초기화
    processor = ParallelProcessor()
    
    # 데이터 처리 함수
    def process_item(item):
        x, y = item
        return x * y + sum(i * i for i in range(1000))
    
    # 멀티프로세싱으로 처리
    results, time_taken = processor.benchmark(
        processor.process_pool_execution,
        process_item,
        data
    )
    
    print(f"처리 완료: {len(results):,}개 항목")
    print(f"소요 시간: {time_taken:.2f}초")
    
    return results
```

---