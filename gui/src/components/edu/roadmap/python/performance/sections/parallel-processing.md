---

# 📘 10.4 병렬 처리 최적화

## ✅ 10.4.1 멀티프로세싱
1. **Pool 클래스 활용**
2. **프로세스 간 통신**
3. **공유 메모리 관리**

```python
from multiprocessing import Pool, Process, Queue
import os

def cpu_bound_task(n):
    """CPU 집중 작업"""
    return sum(i * i for i in range(n))

def parallel_processing_example():
    """병렬 처리 예제"""
    # CPU 코어 수 확인
    num_cores = os.cpu_count()
    
    # 작업 데이터
    numbers = [10**6] * num_cores
    
    # Pool을 사용한 병렬 처리
    with Pool(processes=num_cores) as pool:
        results = pool.map(cpu_bound_task, numbers)
    
    return results
```

## ✅ 10.4.2 멀티스레딩

파이썬에서 GIL(Global Interpreter Lock) 때문에 CPU 바운드 작업에는 멀티스레딩이 효과적이지 않지만, I/O 바운드 작업에는 유용합니다.

```python
import threading
import time
import requests

# I/O 바운드 작업 (네트워크 요청)
def fetch_url(url):
    """URL에서 데이터 가져오기"""
    start_time = time.time()
    response = requests.get(url)
    return {
        'url': url,
        'status': response.status_code,
        'time': time.time() - start_time
    }

def threaded_fetching(urls):
    """스레드를 사용한 병렬 URL 요청"""
    threads = []
    results = [None] * len(urls)
    
    def worker(idx, url):
        results[idx] = fetch_url(url)
    
    # 스레드 생성 및 시작
    for i, url in enumerate(urls):
        thread = threading.Thread(target=worker, args=(i, url))
        threads.append(thread)
        thread.start()
    
    # 모든 스레드가 완료될 때까지 대기
    for thread in threads:
        thread.join()
    
    return results
```

## ✅ 10.4.3 비동기 프로그래밍
1. **`asyncio` 기본 사용법**
2. **비동기 함수 작성**
3. **이벤트 루프 관리**

```python
import asyncio
import aiohttp
import time

async def fetch_url(session, url):
    """비동기 HTTP 요청"""
    start_time = time.time()
    async with session.get(url) as response:
        text = await response.text()
        return {
            'url': url,
            'status': response.status,
            'time': time.time() - start_time,
            'size': len(text)
        }

async def main():
    """메인 비동기 함수"""
    urls = [
        'http://example.com',
        'http://example.org',
        'http://example.net'
    ]
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
    
    return results

# 실행
if __name__ == '__main__':
    asyncio.run(main())
```

## ✅ 10.4.4 병렬 처리 방법 비교

다양한 병렬 처리 방법의 장단점과 적합한 사용 사례:

| 방법 | 장점 | 단점 | 적합한 작업 |
|------|------|------|------------|
| 멀티프로세싱 | GIL 우회, 다중 코어 활용 | 메모리 오버헤드, 프로세스 생성 비용 | CPU 바운드 작업 |
| 멀티스레딩 | 적은 메모리 사용, 빠른 컨텍스트 전환 | GIL로 인한 단일 코어 제한 | I/O 바운드 작업 |
| 비동기 프로그래밍 | 매우 가벼운 동시성, 대용량 연결 처리 | 코드 복잡성 증가 | 네트워크 I/O, 이벤트 기반 앱 |

```python
import time
import requests
import threading
import multiprocessing
import asyncio
import aiohttp

# 실험을 위한 URL 목록
urls = ['http://example.com'] * 10

# 1. 순차 실행
def sequential_fetch():
    start = time.time()
    results = [requests.get(url) for url in urls]
    end = time.time()
    print(f"순차 실행: {end - start:.2f}초")
    return results

# 2. 멀티스레딩
def threaded_fetch():
    start = time.time()
    
    def fetch(url):
        return requests.get(url)
    
    threads = []
    results = [None] * len(urls)
    
    for i, url in enumerate(urls):
        thread = threading.Thread(target=lambda: results[i] = fetch(url))
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()
    
    end = time.time()
    print(f"스레드 실행: {end - start:.2f}초")
    return results

# 3. 비동기 처리
async def async_fetch():
    start = time.time()
    
    async def fetch(url):
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return await response.text()
    
    tasks = [fetch(url) for url in urls]
    results = await asyncio.gather(*tasks)
    
    end = time.time()
    print(f"비동기 실행: {end - start:.2f}초")
    return results
```

--- 