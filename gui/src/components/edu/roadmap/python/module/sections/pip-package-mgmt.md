---

# 📘 6.3 패키지 설치 및 관리 (pip)
pip는 Python Package Index(PyPI)에서 패키지를 설치하고 관리하는 도구입니다.

### pip 기본 명령어와 사용법
```bash
# 패키지 설치
pip install 패키지명
pip install requests

# 특정 버전 설치
pip install requests==2.30.0

# 패키지 업그레이드
pip install --upgrade requests

# 패키지 제거
pip uninstall requests

# 설치된 패키지 목록
pip list

# 설치된 패키지 버전 정보
pip freeze

# requirements.txt 파일의 패키지 설치
pip install -r requirements.txt
```

```python
# pip로 설치한 패키지 사용 예제
import requests

def test_api_request():
    """API 요청 테스트 함수"""
    try:
        # GitHub API 호출
        response = requests.get('https://api.github.com')
        
        # 상태 코드 확인
        print(f"상태 코드: {response.status_code}")
        
        # 응답 헤더 확인
        print(f"\n응답 헤더:")
        for key, value in response.headers.items():
            print(f"{key}: {value}")
            
        # JSON 데이터 확인
        data = response.json()
        print(f"\nAPI 응답:\n{data}")
        
    except requests.RequestException as e:
        print(f"요청 중 오류 발생: {e}")

if __name__ == "__main__":
    test_api_request()
```

--- 