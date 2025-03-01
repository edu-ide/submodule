---

# 📘 A.1 개발 도구 및 환경 설정

## ✅ A.1.1 개발 환경 설정 가이드

1. **IDE 선택 및 설정**
   - PyCharm Professional/Community
   - VS Code + Python Extension
   - Jupyter Lab/Notebook
2. **가상 환경 관리**
   ```bash
   python -m venv myenv
   source myenv/bin/activate  # Linux/Mac
   myenv\Scripts\activate     # Windows
   ```
3. **코드 품질 도구**
   ```bash
   pip install flake8 black pylint
   ```

```python
# 개발 환경 설정 도우미 클래스
import os
import subprocess
import sys

class DevEnvironment:
    """개발 환경 설정 도우미"""
    
    @staticmethod
    def create_venv(venv_name):
        """가상 환경 생성"""
        try:
            subprocess.run([sys.executable, '-m', 'venv', venv_name], check=True)
            print(f"가상 환경 '{venv_name}' 생성 완료")
        except subprocess.CalledProcessError as e:
            print(f"가상 환경 생성 실패: {e}")
    
    @staticmethod
    def install_requirements(requirements_file):
        """필수 패키지 설치"""
        try:
            subprocess.run(['pip', 'install', '-r', requirements_file], check=True)
            print("패키지 설치 완료")
        except subprocess.CalledProcessError as e:
            print(f"패키지 설치 실패: {e}")
    
    @staticmethod
    def setup_git():
        """Git 초기 설정"""
        try:
            subprocess.run(['git', 'init'], check=True)
            with open('.gitignore', 'w') as f:
                f.write("""
                __pycache__/
                *.pyc
                venv/
                .env
                """)
            print("Git 설정 완료")
        except subprocess.CalledProcessError as e:
            print(f"Git 설정 실패: {e}")
```

--- 