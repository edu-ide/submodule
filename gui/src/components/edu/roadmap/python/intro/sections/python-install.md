# 파이썬 설치 및 개발 환경 설정

## ✅ 파이썬 다운로드 및 설치  
1️⃣ **[Python 공식 홈페이지](https://www.python.org/downloads/)** 에 접속  
2️⃣ 다운로드 페이지에서 **최신 버전의 파이썬(Python 3.x)**을 다운로드  
3️⃣ 설치 진행 중 **"Add Python to PATH"** 옵션을 반드시 체크  
4️⃣ 설치가 완료되면 **명령 프롬프트(Windows) 또는 터미널(macOS/Linux)**에서 아래 명령어로 확인  

파이썬은 쉬운 문법과 강력한 기능을 가진 프로그래밍 언어입니다.

1. `Windows + R` 키를 눌러 `cmd` 입력 후 엔터 (명령 프롬프트 실행)
2. 다음 명령어 입력 후 엔터:

```bash
python --version
```
또는
```bash
python3 --version
```

✅ Python 버전이 출력되면 이미 설치됨  
❌ `python is not recognized` 오류 발생 시 Python을 설치해야 함  

✅ pip가 설치되어 있는지 확인
```bash
pip --version
```

✅ `pip 23.x.x from ...` 과 같은 결과가 나오면 설치됨  
❌ 오류 발생 시 pip 설치 필요 → 다음 명령어 실행:

```bash
python -m ensurepip --default-pip
```

## ✅ 파이썬 설치
다음 명령어를 실행하여 파이썬을 설치할 수 있습니다.

```bash
pip install python
```

## ✅ 파이썬 버전 확인
다음 명령어를 실행하여 파이썬 버전을 확인할 수 있습니다.

```bash
python --version
```

✅ **출력 예시 (설치가 정상적으로 완료된 경우)**  
```bash
Python 3.10.4
```

✔ 정상적으로 버전이 출력되면 파이썬이 성공적으로 설치된 것입니다!  

## ✅ 파이썬 버전 확인 스크립트
`hi.py` 파일 생성:

```python
# 파일명 hi.py
# 설치된 파이썬 버전 확인
print("Hello, Python!")
import sys
print(sys.version)
```

명령 프롬프트에서 실행:
```bash
python hi.py
```

**출력:**
```
Hello, Python!
3.12.6 (tags/v3.12.6:a4a2d2b, Sep  6 2024, 20:11:23) [MSC v.1940 64 bit (AMD64)]
``` 