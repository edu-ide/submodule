---

# 📘 6.4 가상환경 설정 (venv)

### 가상환경 기본 명령어
```bash
# 가상환경 생성
python -m venv myenv

# 가상환경 활성화
# Windows:
myenv\Scripts\activate
# macOS/Linux:
source myenv/bin/activate

# 가상환경 비활성화
deactivate
```

```python
# 가상환경 관리 스크립트
import os
import sys
import subprocess
import platform

class VenvManager:
    def __init__(self, venv_name="myenv"):
        self.venv_name = venv_name
        self.system = platform.system()
    
    def create_venv(self):
        """가상환경 생성"""
        if not os.path.exists(self.venv_name):
            print(f"가상환경 '{self.venv_name}' 생성 중...")
            subprocess.run([sys.executable, '-m', 'venv', self.venv_name])
            print("가상환경이 생성되었습니다.")
        else:
            print("가상환경이 이미 존재합니다.")
    
    def get_requirements(self):
        """설치된 패키지 목록 저장"""
        print("설치된 패키지 목록 저장 중...")
        subprocess.run(['pip', 'freeze', '>', 'requirements.txt'], shell=True)
        print("requirements.txt 파일이 생성되었습니다.")
    
    def install_requirements(self):
        """requirements.txt 패키지 설치"""
        if os.path.exists('requirements.txt'):
            print("패키지 설치 중...")
            subprocess.run(['pip', 'install', '-r', 'requirements.txt'])
            print("패키지 설치가 완료되었습니다.")
        else:
            print("requirements.txt 파일이 없습니다.")
    
    def show_venv_info(self):
        """가상환경 정보 출력"""
        print("\n=== 가상환경 정보 ===")
        print(f"Python 버전: {sys.version}")
        print(f"가상환경 위치: {sys.prefix}")
        print("\n설치된 패키지 목록:")
        subprocess.run(['pip', 'list'])

def main():
    manager = VenvManager()
    
    # 가상환경 생성
    manager.create_venv()
    
    # 패키지 설치 (예시)
    print("\n필수 패키지 설치 중...")
    subprocess.run(['pip', 'install', 'requests', 'pandas'])
    
    # requirements.txt 생성
    manager.get_requirements()
    
    # 가상환경 정보 출력
    manager.show_venv_info()

if __name__ == "__main__":
    main()
```

### 실행 결과 예시:
```
가상환경 'myenv' 생성 중...
가상환경이 생성되었습니다.

필수 패키지 설치 중...
Successfully installed requests-2.31.0 pandas-2.1.1

=== 가상환경 정보 ===
Python 버전: 3.8.10
가상환경 위치: /path/to/myenv

설치된 패키지 목록:
Package    Version
---------- -------
requests   2.31.0
pandas     2.1.1
```

--- 