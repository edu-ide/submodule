---

# 📘 웹 스크래핑 (크롤링) - 기본 도구 활용

## 11.2 웹 스크래핑 고급 기법

### ✅ 11.2.1 고급 BeautifulSoup 사용법
1. **CSS 선택자 활용**
2. **정규표현식 결합**
3. **계층 구조 탐색**

```python
import requests
from bs4 import BeautifulSoup
import re

class AdvancedScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def get_elements_by_css(self, html, selector):
        """CSS 선택자로 요소 찾기"""
        soup = BeautifulSoup(html, 'html.parser')
        return soup.select(selector)
    
    def find_by_regex(self, html, pattern):
        """정규표현식으로 내용 찾기"""
        soup = BeautifulSoup(html, 'html.parser')
        return soup.find(text=re.compile(pattern))
    
    def navigate_structure(self, element):
        """요소의 계층 구조 탐색"""
        parent = element.parent
        siblings = element.find_next_siblings()
        children = element.find_all(recursive=False)
        return parent, siblings, children
```

### ✅ 11.2.3 BeautifulSoup 고급 사용법
1. **CSS 선택자 활용**
2. **속성 기반 검색**
3. **정규표현식 활용**

```python
# BeautifulSoup 고급 선택자 예제
import re
from bs4 import BeautifulSoup

def advanced_soup_usage(html):
    soup = BeautifulSoup(html, 'html.parser')
    
    # CSS 선택자 사용
    articles = soup.select('div.article-content p')
    main_content = soup.select('#main-content')
    
    # 속성으로 찾기
    external_links = soup.find_all('a', attrs={'target': '_blank'})
    
    # 정규표현식으로 찾기
    post_divs = soup.find_all('div', class_=re.compile('^post-'))
    
    return articles, main_content, external_links, post_divs
```

### ✅ 11.2.4 에러 처리와 예외 상황
1. **네트워크 오류 처리**
2. **타임아웃 설정**
3. **재시도 로직**

```python
from requests.exceptions import RequestException

def safe_get_page(url, retries=3):
    """안전한 웹 페이지 요청"""
    for i in range(retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except RequestException as e:
            print(f"시도 {i+1}/{retries} 실패: {e}")
            if i == retries - 1:
                raise
            time.sleep(2 ** i)  # 지수 백오프
``` 