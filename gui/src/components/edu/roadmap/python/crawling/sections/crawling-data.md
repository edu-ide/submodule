---

# 📘 웹 스크래핑 (크롤링) - 데이터 저장 및 분석

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