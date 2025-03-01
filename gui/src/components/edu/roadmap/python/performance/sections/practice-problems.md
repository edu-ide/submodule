---

# 📘 10장 실습 문제

이 장에서 배운 성능 최적화 기술을 활용하여 다음 문제들을 해결해 보세요.

## ✅ 문제 1: 코드 프로파일링

다음 코드의 성능을 분석하고 개선하세요.

```python
# 최적화가 필요한 코드
def find_primes(n):
    """n까지의 소수를 찾는 함수"""
    primes = []
    for num in range(2, n + 1):
        is_prime = True
        for i in range(2, num):
            if num % i == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(num)
    return primes

# 실행 예제
if __name__ == "__main__":
    import time
    
    start = time.time()
    primes = find_primes(10000)
    end = time.time()
    
    print(f"실행 시간: {end - start:.6f}초")
    print(f"찾은 소수 개수: {len(primes)}")
```

**요구사항:**
1. cProfile을 사용하여 코드를 프로파일링하세요.
2. 에라토스테네스의 체 알고리즘을 사용하여 최적화된 버전을 작성하세요.
3. 최적화 전후의 성능을 비교하여 보고서를 작성하세요.

## ✅ 문제 2: 메모리 최적화

다음 코드는 대용량 파일을 처리하는 함수입니다. 메모리 사용량을 최적화하세요.

```python
def process_large_file(filename):
    """대용량 파일의 각 줄에 대해 처리를 수행합니다."""
    # 파일의 모든 내용을 메모리에 로드
    with open(filename, 'r') as file:
        lines = file.readlines()
    
    # 각 줄 처리
    processed_lines = []
    for line in lines:
        # 공백 제거 및 대문자로 변환
        processed_line = line.strip().upper()
        processed_lines.append(processed_line)
    
    # 결과 파일 저장
    with open('processed_' + filename, 'w') as output_file:
        output_file.write('\n'.join(processed_lines))
```

**요구사항:**
1. memory_profiler를 사용하여 메모리 사용량을 프로파일링하세요.
2. 파일을 한 번에 모두 메모리에 로드하지 않고 줄 단위로 처리하는 방식으로 수정하세요.
3. 제너레이터를 활용하여 더 효율적인 방법으로 리팩토링하세요.
4. 최적화 전후의 메모리 사용량을 비교하세요.

## ✅ 문제 3: 병렬 처리 최적화

다음 코드는 URL 목록에서 데이터를 다운로드하고 처리하는 함수입니다. 병렬 처리를 적용하여 최적화하세요.

```python
import requests
import time

def download_and_process(urls):
    """URL 목록에서 데이터를 다운로드하고 처리합니다."""
    results = []
    
    for url in urls:
        # 데이터 다운로드
        response = requests.get(url)
        data = response.text
        
        # 데이터 처리 (간단한 예)
        word_count = len(data.split())
        results.append((url, word_count))
    
    return results

# 테스트 URL 목록
test_urls = [
    'http://example.com',
    'http://example.org',
    'http://example.net',
    'https://python.org',
    'https://pypi.org'
]

# 실행 및 시간 측정
start = time.time()
results = download_and_process(test_urls)
end = time.time()

print(f"총 실행 시간: {end - start:.6f}초")
for url, count in results:
    print(f"{url}: {count}개 단어")
```

**요구사항:**
1. 멀티스레딩을 사용하여 URL 다운로드를 병렬화하세요.
2. 동일한 코드를 asyncio와 aiohttp를 사용하여 비동기 방식으로 구현하세요.
3. 순차 처리, 멀티스레드, 비동기 방식의 성능을 비교하세요.

## ✅ 문제 4: 성능 모니터링 대시보드

파이썬 애플리케이션의 성능을 모니터링하는 간단한 대시보드를 만드세요.

**요구사항:**
1. 다음 지표를 실시간으로 모니터링:
   - CPU 사용량
   - 메모리 사용량
   - 디스크 I/O
   - 네트워크 트래픽
2. 데이터를 10초 간격으로 수집하여 CSV 파일에 저장
3. matplotlib 또는 다른 시각화 라이브러리를 사용하여 그래프로 표시
4. (선택) 웹 인터페이스를 통해 실시간 대시보드 제공 (Flask 또는 Dash 활용)

## ✅ 문제 5: 코드 성능 벤치마킹

다양한 방법으로 같은 작업을 수행하는 코드의 성능을 비교하세요.

```python
# 리스트 생성 방법 비교
def create_list_method1(n):
    """for 루프 사용"""
    result = []
    for i in range(n):
        result.append(i * i)
    return result

def create_list_method2(n):
    """리스트 컴프리헨션 사용"""
    return [i * i for i in range(n)]

def create_list_method3(n):
    """map 함수 사용"""
    return list(map(lambda x: x * x, range(n)))

# 딕셔너리 생성 방법 비교
def create_dict_method1(n):
    """for 루프 사용"""
    result = {}
    for i in range(n):
        result[i] = i * i
    return result

def create_dict_method2(n):
    """딕셔너리 컴프리헨션 사용"""
    return {i: i * i for i in range(n)}

def create_dict_method3(n):
    """zip 활용"""
    keys = range(n)
    values = map(lambda x: x * x, range(n))
    return dict(zip(keys, values))
```

**요구사항:**
1. timeit 모듈을 사용하여 각 함수의 실행 시간을 측정하세요.
2. 다양한 입력 크기(n)에 대해 벤치마크를 실행하세요.
3. 결과를 표와 그래프로 시각화하세요.
4. 실행 환경이 성능에 미치는 영향을 고려하세요 (예: 파이썬 버전, OS 등).

## ✅ 문제 6: 종합 최적화 프로젝트

웹 스크래핑과 데이터 처리를 수행하는 애플리케이션을 최적화하세요.

```python
# 웹 스크래핑 및 데이터 처리 애플리케이션
import requests
from bs4 import BeautifulSoup
import csv
import time

def scrape_websites(urls):
    """여러 웹사이트에서 제목과 링크를 스크래핑합니다."""
    all_data = []
    
    for url in urls:
        # 웹사이트 접속
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 제목 추출 (각 웹사이트 구조에 맞게 조정 필요)
        titles = soup.find_all('h2')
        links = soup.find_all('a')
        
        # 데이터 저장
        website_data = {
            'url': url,
            'titles': [title.text.strip() for title in titles],
            'links': [link.get('href') for link in links if link.get('href')]
        }
        all_data.append(website_data)
        
        # 웹사이트 부하 방지를 위한 지연
        time.sleep(1)
    
    return all_data

def process_data(all_data):
    """스크래핑한 데이터를 처리하고 CSV 파일로 저장합니다."""
    with open('scraped_data.csv', 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Website', 'Title', 'Link'])
        
        for website_data in all_data:
            url = website_data['url']
            titles = website_data['titles']
            links = website_data['links']
            
            # 제목과 링크 데이터 처리
            for title in titles:
                writer.writerow([url, title, ''])
            
            for link in links:
                writer.writerow([url, '', link])

# 테스트 URL 목록
test_urls = [
    'https://example.com',
    'https://example.org',
    'https://python.org',
    'https://pypi.org',
    'https://docs.python.org'
]

# 실행 및 시간 측정
start = time.time()
data = scrape_websites(test_urls)
process_data(data)
end = time.time()

print(f"총 실행 시간: {end - start:.6f}초")
```

**요구사항:**
1. 코드 프로파일링을 통해 성능 병목 지점을 찾으세요.
2. 다음 방법들을 적용하여 코드를 최적화하세요:
   - 멀티스레딩 또는 비동기 처리로 웹 스크래핑 병렬화
   - 메모리 최적화 (불필요한 중간 데이터 저장 방지)
   - 제너레이터를 활용한 스트리밍 처리
   - CSV 쓰기 최적화
3. 모니터링 코드를 추가하여 CPU와 메모리 사용량을 추적하세요.
4. 최적화 전후의 성능을 비교하는 보고서를 작성하세요.

--- 