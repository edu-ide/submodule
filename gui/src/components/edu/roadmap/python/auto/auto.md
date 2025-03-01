---

# 📘 2권 4장: 자동화 및 시스템 스크립트

## 📌 목차
14.1 자동화 개념 및 필요성  
14.2 파일 및 폴더 자동 관리  
14.3 이메일 및 메시지 자동 발송  
14.4 웹 API 자동화  
14.5 크론 작업 및 배치 스크립트  

## 14.1 자동화의 핵심 요소

### ✅ 14.1.1 자동화의 장점
1. **시간 절약**: 반복 작업 감소
2. **오류 감소**: 일관된 작업 수행
3. **효율성 증가**: 24/7 작업 가능
4. **확장성**: 대량 작업 처리 용이

```python
# 자동화 유틸리티 클래스
import os
import shutil
import datetime
import logging

class AutomationUtils:
    def __init__(self, base_dir="."):
        self.base_dir = base_dir
        self.setup_logging()
    
    def setup_logging(self):
        """로깅 설정"""
        logging.basicConfig(
            filename='automation.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
    
    def create_directory(self, dir_name):
        """디렉토리 생성"""
        try:
            path = os.path.join(self.base_dir, dir_name)
            if not os.path.exists(path):
                os.makedirs(path)
                logging.info(f'디렉토리 생성: {path}')
            return path
        except Exception as e:
            logging.error(f'디렉토리 생성 실패: {e}')
            raise
    
    def backup_files(self, source_dir, backup_dir):
        """파일 백업"""
        try:
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_path = os.path.join(backup_dir, f'backup_{timestamp}')
            shutil.copytree(source_dir, backup_path)
            logging.info(f'백업 완료: {backup_path}')
            return backup_path
        except Exception as e:
            logging.error(f'백업 실패: {e}')
            raise
```

## 14.2 고급 파일 관리 자동화

### ✅ 14.2.1 파일 모니터링 및 자동 처리

```python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time

class FileHandler(FileSystemEventHandler):
    """파일 시스템 이벤트 처리 클래스"""
    
    def __init__(self, target_dir):
        self.target_dir = target_dir
    
    def on_created(self, event):
        """파일 생성 시 처리"""
        if not event.is_directory:
            file_name = os.path.basename(event.src_path)
            file_ext = os.path.splitext(file_name)[1]
            
            # 파일 종류별 분류
            if file_ext.lower() in ['.jpg', '.png', '.gif']:
                dest_dir = os.path.join(self.target_dir, 'images')
            elif file_ext.lower() in ['.doc', '.docx', '.pdf']:
                dest_dir = os.path.join(self.target_dir, 'documents')
            else:
                dest_dir = os.path.join(self.target_dir, 'others')
            
            os.makedirs(dest_dir, exist_ok=True)
            shutil.move(event.src_path, os.path.join(dest_dir, file_name))
            logging.info(f'파일 이동: {file_name} -> {dest_dir}')

def start_file_monitoring(path):
    """파일 모니터링 시작"""
    event_handler = FileHandler(path)
    observer = Observer()
    observer.schedule(event_handler, path, recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
```

## 14.3 고급 이메일 자동화

### ✅ 14.3.1 HTML 템플릿 이메일 발송

```python
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import smtplib

class EmailAutomation:
    """이메일 자동화 클래스"""
    
    def __init__(self, smtp_server, smtp_port, username, password):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
    
    def send_html_email(self, to_email, subject, html_content, attachments=None):
        """HTML 형식 이메일 발송"""
        msg = MIMEMultipart()
        msg['From'] = self.username
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # HTML 본문 추가
        msg.attach(MIMEText(html_content, 'html'))
        
        # 첨부파일 추가
        if attachments:
            for file_path in attachments:
                with open(file_path, 'rb') as f:
                    part = MIMEApplication(f.read())
                    part.add_header('Content-Disposition', 'attachment',
                                   filename=os.path.basename(file_path))
                    msg.attach(part)
        
        # 이메일 발송
        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.username, self.password)
            server.send_message(msg)
            logging.info(f'이메일 발송 완료: {to_email}')
```

## 14.4 웹 자동화 고급 기능

### ✅ 14.4.1 Selenium 고급 자동화

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class WebAutomation:
    """웹 자동화 클래스"""
    
    def __init__(self, headless=False):
        options = webdriver.ChromeOptions()
        if headless:
            options.add_argument('--headless')
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def login(self, url, username_field, password_field, username, password):
        """웹사이트 로그인"""
        try:
            self.driver.get(url)
            
            # 로그인 필드 대기 및 입력
            username_input = self.wait.until(
                EC.presence_of_element_located((By.NAME, username_field))
            )
            password_input = self.driver.find_element(By.NAME, password_field)
            
            username_input.send_keys(username)
            password_input.send_keys(password)
            password_input.submit()
            
            logging.info('로그인 성공')
            return True
        except Exception as e:
            logging.error(f'로그인 실패: {e}')
            return False
    
    def close(self):
        """브라우저 종료"""
        self.driver.quit()
```

## 🎯 실습 프로젝트

### [실습 1] 통합 자동화 시스템 구현

```python
class AutomationSystem:
    """통합 자동화 시스템"""
    
    def __init__(self):
        self.file_utils = AutomationUtils()
        self.email_sender = EmailAutomation(
            smtp_server='smtp.gmail.com',
            smtp_port=587,
            username='your_email@gmail.com',
            password='your_password'
        )
        self.web_auto = WebAutomation(headless=True)
    
    def daily_automation(self):
        """일일 자동화 작업 실행"""
        try:
            # 1. 파일 백업
            backup_path = self.file_utils.backup_files('data', 'backups')
            
            # 2. 웹 데이터 수집
            self.web_auto.login('https://example.com', 'username', 'password',
                               'user', 'pass')
            
            # 3. 결과 이메일 발송
            html_content = f'''
            <h2>일일 자동화 보고서</h2>
            <p>백업 경로: {backup_path}</p>
            '''
            
            self.email_sender.send_html_email(
                'recipient@example.com',
                '일일 자동화 보고서',
                html_content
            )
            
            logging.info('일일 자동화 작업 완료')
            
        except Exception as e:
            logging.error(f'자동화 작업 실패: {e}')
        finally:
            self.web_auto.close()

if __name__ == '__main__':
    system = AutomationSystem()
    system.daily_automation()
```

---