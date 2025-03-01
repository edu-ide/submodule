---

# 📘 2권 1장: 웹 스크래핑 (크롤링)

## 📌 목차
11.1 웹 스크래핑 개념 및 활용  
11.2 requests와 BeautifulSoup 사용법  
11.3 Selenium을 활용한 동적 웹사이트 크롤링  
11.4 크롤링한 데이터 저장 및 분석  

## 11.1 웹 스크래핑 개념 및 활용

### ✅ 11.1.1 웹 스크래핑의 주요 활용 분야
1. **데이터 수집**
   - 시장 조사
   - 가격 비교
   - 트렌드 분석
2. **자동화**
   - 뉴스 모니터링
   - 재고 관리
   - 경쟁사 분석
3. **연구 및 분석**
   - 소셜 미디어 분석
   - 여론 조사
   - 학술 연구

### ✅ 11.1.2 웹 스크래핑 시 주의사항
1. **법적 고려사항**
   - robots.txt 확인
   - 이용약관 준수
   - 개인정보 보호
2. **기술적 고려사항**
   - 요청 간격 조절
   - 서버 부하 고려
   - 에러 처리

```python
import requests
from bs4 import BeautifulSoup
import time
import random

class WebScraper:
    """웹 스크래핑을 위한 기본 클래스"""
    
    def __init__(self, base_url):
        self.base_url = base_url
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def get_page(self, url):
        """웹 페이지 요청 및 에러 처리"""
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"에러 발생: {e}")
            return None
    
    def parse_html(self, html):
        """HTML 파싱 및 데이터 추출"""
        if html:
            return BeautifulSoup(html, 'html.parser')
        return None
    
    def delay_request(self):
        """요청 간 딜레이 추가"""
        time.sleep(random.uniform(1, 3))
```

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

### ✅ 11.2.2 동적 페이지 처리
1. **JavaScript 렌더링 대응**
2. **AJAX 요청 처리**
3. **무한 스크롤 처리**

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class DynamicScraper:
    def __init__(self):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)
    
    def scroll_to_bottom(self):
        """무한 스크롤 처리"""
        last_height = self.driver.execute_script("return document.body.scrollHeight")
        
        while True:
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
    
    def wait_for_element(self, selector):
        """요소가 로드될 때까지 대기"""
        return self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
        )
    
    def handle_ajax(self, url):
        """AJAX 요청 처리"""
        self.driver.get(url)
        self.wait_for_element('#content')
        return self.driver.page_source
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

## 11.3 데이터 저장 및 분석

### ✅ 11.3.1 데이터베이스 저장
1. **SQLite 활용**
2. **MongoDB 활용**
3. **데이터 정규화**

```python
import sqlite3
from pymongo import MongoClient

class DataStorage:
    def __init__(self):
        self.sqlite_conn = sqlite3.connect('scraping.db')
        self.mongo_client = MongoClient('mongodb://localhost:27017/')
    
    def save_to_sqlite(self, data):
        """SQLite에 데이터 저장"""
        cursor = self.sqlite_conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS articles
            (title TEXT, url TEXT, content TEXT)
        """)
        
        cursor.executemany(
            "INSERT INTO articles VALUES (?, ?, ?)",
            [(d['title'], d['url'], d['content']) for d in data]
        )
        self.sqlite_conn.commit()
    
    def save_to_mongodb(self, data):
        """MongoDB에 데이터 저장"""
        db = self.mongo_client.scraping_db
        db.articles.insert_many(data)
    
    def close(self):
        self.sqlite_conn.close()
        self.mongo_client.close()
```

### ✅ 11.3.2 데이터 분석 및 시각화
1. **pandas 활용**
2. **matplotlib 시각화**
3. **워드클라우드 생성**

```python
import pandas as pd
import matplotlib.pyplot as plt
from wordcloud import WordCloud

class DataAnalyzer:
    def __init__(self, data):
        self.df = pd.DataFrame(data)
    
    def basic_analysis(self):
        """기본 통계 분석"""
        return {
            'total_articles': len(self.df),
            'unique_sources': self.df['source'].nunique(),
            'date_range': (self.df['date'].min(), self.df['date'].max())
        }
    
    def create_visualizations(self):
        """데이터 시각화"""
        # 시간별 게시물 수 그래프
        plt.figure(figsize=(12, 6))
        self.df['date'].value_counts().sort_index().plot()
        plt.title('Posts Over Time')
        plt.savefig('posts_timeline.png')
        
        # 워드클라우드 생성
        text = ' '.join(self.df['content'])
        wordcloud = WordCloud(width=800, height=400).generate(text)
        
        plt.figure(figsize=(10, 5))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.savefig('wordcloud.png')
```

### ✅ 11.4.3 텍스트 데이터 전처리
1. **텍스트 정제**
2. **불용어 제거**
3. **형태소 분석**

```python
import re
from konlpy.tag import Okt

class TextPreprocessor:
    def __init__(self):
        self.okt = Okt()
        self.stopwords = ['은', '는', '이', '가', '을', '를', '의', '에', '에서']
    
    def clean_text(self, text):
        """텍스트 정제"""
        # HTML 태그 제거
        text = re.sub(r'<[^>]+>', '', text)
        # 특수문자 제거
        text = re.sub(r'[^\w\s]', '', text)
        # 불필요한 공백 제거
        text = ' '.join(text.split())
        return text
    
    def tokenize(self, text):
        """형태소 분석"""
        # 텍스트 정제
        text = self.clean_text(text)
        # 형태소 분석
        tokens = self.okt.morphs(text)
        # 불용어 제거
        tokens = [token for token in tokens if token not in self.stopwords]
        return tokens
```

### ✅ 11.4.4 데이터 내보내기
1. **CSV 파일 저장**
2. **JSON 파일 저장**
3. **Excel 파일 저장**

```python
class DataExporter:
    def __init__(self, data):
        self.df = pd.DataFrame(data)
    
    def to_csv(self, filename='output.csv'):
        """CSV 파일로 저장"""
        self.df.to_csv(filename, index=False, encoding='utf-8-sig')
    
    def to_json(self, filename='output.json'):
        """JSON 파일로 저장"""
        self.df.to_json(filename, orient='records', force_ascii=False, indent=4)
    
    def to_excel(self, filename='output.xlsx'):
        """Excel 파일로 저장"""
        self.df.to_excel(filename, index=False)
        
    def to_html(self, filename='output.html'):
        """HTML 파일로 저장"""
        self.df.to_html(filename)
```

## 🎯 실습 프로젝트

### [실습 1] 뉴스 헤드라인 수집기
주요 뉴스 사이트의 헤드라인을 자동으로 수집하고 분석하는 프로그램을 작성하세요.
- 여러 뉴스 사이트 크롤링
- 키워드 분석
- 데이터 시각화
- 자동 리포트 생성

### [실습 1] 뉴스 크롤링 구현

```python
def crawl_news():
    url = "https://news.example.com"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    
    news_items = []
    articles = soup.select('article.news-item')
    
    for article in articles:
        title = article.select_one('h2.title').text.strip()
        link = article.select_one('a')['href']
        news_items.append({
            'title': title,
            'link': link
        })
    
    return news_items
```

---