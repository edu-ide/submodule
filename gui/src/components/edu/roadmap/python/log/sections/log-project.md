---

# 📘 로깅과 테스트 자동화 - 실습 프로젝트

## 9.6 실습 프로젝트: 파일 관리 시스템 개발

### ✅ 9.6.1 프로젝트 개요
로깅과 테스트를 활용하여 파일 관리 시스템을 개발하는 프로젝트입니다. 파일 생성, 읽기, 쓰기, 복사 등의 기능을 구현하고 로깅 및 단위 테스트를 통해 코드의 안정성을 확보합니다.

### ✅ 9.6.2 요구사항
1. **기본 기능**
   - 파일 생성, 읽기, 쓰기, 삭제
   - 디렉토리 생성, 목록 조회
   - 파일 복사 및 이동
2. **로깅 요구사항**
   - 모든 파일 작업 로깅
   - 에러 발생 시 상세 로깅
   - 로그 파일 로테이션 구현
3. **테스트 요구사항**
   - 모든 기능에 대한 단위 테스트
   - 최소 80% 코드 커버리지
   - pytest 사용

### ✅ 9.6.3 구현 예시

```python
import os
import shutil
import logging
from logging.handlers import RotatingFileHandler
import datetime

# 로깅 설정
def setup_logger():
    logger = logging.getLogger('file_manager')
    logger.setLevel(logging.DEBUG)
    
    # 파일 핸들러 (RotatingFileHandler 사용)
    log_file = 'file_manager.log'
    file_handler = RotatingFileHandler(log_file, maxBytes=1024*1024, backupCount=3)
    file_handler.setLevel(logging.DEBUG)
    
    # 콘솔 핸들러
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # 포맷 설정
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # 핸들러 추가
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# 파일 관리 클래스
class FileManager:
    def __init__(self):
        self.logger = setup_logger()
        self.logger.info("파일 관리자 초기화됨")
    
    def create_file(self, path, content=""):
        """파일 생성 함수"""
        try:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.logger.info(f"파일 생성됨: {path}")
            return True
        except Exception as e:
            self.logger.error(f"파일 생성 실패: {path}, 에러: {str(e)}")
            return False
    
    def read_file(self, path):
        """파일 읽기 함수"""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            self.logger.info(f"파일 읽기 성공: {path}")
            return content
        except Exception as e:
            self.logger.error(f"파일 읽기 실패: {path}, 에러: {str(e)}")
            return None
    
    def copy_file(self, source, destination):
        """파일 복사 함수"""
        try:
            shutil.copy2(source, destination)
            self.logger.info(f"파일 복사됨: {source} -> {destination}")
            return True
        except Exception as e:
            self.logger.error(f"파일 복사 실패: {source} -> {destination}, 에러: {str(e)}")
            return False

# 테스트 코드 (test_file_manager.py로 저장)
"""
import pytest
import os
from file_manager import FileManager

@pytest.fixture
def file_manager():
    return FileManager()

@pytest.fixture
def test_file():
    path = "test_file.txt"
    yield path
    # 테스트 후 정리
    if os.path.exists(path):
        os.remove(path)

def test_create_file(file_manager, test_file):
    result = file_manager.create_file(test_file, "테스트 내용")
    assert result is True
    assert os.path.exists(test_file)

def test_read_file(file_manager, test_file):
    content = "읽기 테스트"
    file_manager.create_file(test_file, content)
    read_content = file_manager.read_file(test_file)
    assert read_content == content

def test_copy_file(file_manager, test_file):
    dest_file = "test_file_copy.txt"
    file_manager.create_file(test_file, "복사 테스트")
    result = file_manager.copy_file(test_file, dest_file)
    assert result is True
    assert os.path.exists(dest_file)
    os.remove(dest_file)  # 테스트 후 정리
"""
```

### ✅ 9.6.4 학습 성과
1. 로깅 시스템 구현 및 활용
2. 단위 테스트 작성 및 실행
3. 코드 커버리지 측정
4. 실제 응용 프로그램에서의 예외 처리 