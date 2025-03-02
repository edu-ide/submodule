---

# 📘 웹 스크래핑 (크롤링) - 동적 웹사이트 크롤링

## 11.2.2 동적 페이지 처리
1. **JavaScript 렌더링 대응**
2. **AJAX 요청 처리**
3. **무한 스크롤 처리**

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

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