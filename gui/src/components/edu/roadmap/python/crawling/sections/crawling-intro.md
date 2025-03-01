---

# 📘 웹 스크래핑 (크롤링) - 개념 및 활용

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