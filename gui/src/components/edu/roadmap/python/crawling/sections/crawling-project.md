---

# 📘 웹 스크래핑 (크롤링) - 실습 프로젝트

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