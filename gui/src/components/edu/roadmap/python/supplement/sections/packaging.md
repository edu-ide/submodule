---

# 📘 A.5 파이썬 프로젝트 배포 및 패키징

## ✅ A.5.1 파이썬 패키지 구조

표준적인 파이썬 패키지 구조와 필수 파일들에 대한 설명입니다.

```
my_package/
├── .gitignore
├── LICENSE
├── README.md
├── requirements.txt
├── setup.py
├── my_package/
│   ├── __init__.py
│   ├── core.py
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
└── tests/
    ├── __init__.py
    ├── test_core.py
    └── test_utils.py
```

**주요 파일 설명:**
- `setup.py`: 패키지 설치 및 배포 설정
- `__init__.py`: 디렉토리를 파이썬 패키지로 인식시키는 파일
- `requirements.txt`: 의존성 패키지 목록
- `LICENSE`: 라이선스 정보
- `README.md`: 패키지 설명 및 사용법

## ✅ A.5.2 가상 환경과 의존성 관리

파이썬 가상 환경과 의존성 관리 도구들을 소개합니다.

1. **venv와 virtualenv**
   ```bash
   # venv 생성
   python -m venv myenv
   
   # 활성화
   source myenv/bin/activate  # Linux/Mac
   myenv\Scripts\activate     # Windows
   
   # 비활성화
   deactivate
   ```

2. **pip 활용**
   ```bash
   # 패키지 설치
   pip install package_name
   
   # 특정 버전 설치
   pip install package_name==1.2.3
   
   # 의존성 목록 내보내기
   pip freeze > requirements.txt
   
   # 의존성 설치
   pip install -r requirements.txt
   ```

3. **Poetry 활용**
   ```bash
   # Poetry 설치
   pip install poetry
   
   # 프로젝트 초기화
   poetry init
   
   # 패키지 추가
   poetry add package_name
   
   # 개발용 패키지 추가
   poetry add package_name --dev
   
   # 의존성 설치
   poetry install
   ```

## ✅ A.5.3 PyPI 배포 가이드

Python Package Index(PyPI)에 패키지를 배포하는 방법을 설명합니다.

```python
import setuptools

# README 파일 읽기
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setuptools.setup(
    name="my-package",
    version="0.1.0",
    author="홍길동",
    author_email="hong@example.com",
    description="패키지 간단 설명",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/username/my-package",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
    install_requires=[
        "requests>=2.25.0",
        "numpy>=1.19.0",
    ],
    entry_points={
        "console_scripts": [
            "my-command=my_package.cli:main",
        ],
    },
)
```

**배포 단계:**
1. 필요한 빌드 도구 설치
   ```bash
   pip install build twine
   ```

2. 배포 파일 생성
   ```bash
   python -m build
   ```

3. PyPI에 업로드
   ```bash
   # 테스트 PyPI에 업로드
   twine upload --repository-url https://test.pypi.org/legacy/ dist/*
   
   # 실제 PyPI에 업로드
   twine upload dist/*
   ```

## ✅ A.5.4 지속적 통합 및 배포 (CI/CD)

GitHub Actions를 활용한 파이썬 프로젝트의 CI/CD 설정 방법입니다.

```yaml
# .github/workflows/python-package.yml
name: Python Package

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.7, 3.8, 3.9]

    steps:
    - uses: actions/checkout@v2
    - name: Python ${{ matrix.python-version }} 설정
      uses: actions/setup-python@v2
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: 의존성 설치
      run: |
        python -m pip install --upgrade pip
        pip install flake8 pytest
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    
    - name: 린트 검사
      run: |
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
    
    - name: 테스트 실행
      run: |
        pytest
```

## 📌 학습 정리

✅ 파이썬은 다양한 개발 환경과 도구를 지원하며, 프로젝트의 필요에 맞게 활용할 수 있습니다.  
✅ 코딩 스타일 가이드(PEP 8)를 따르면 일관된 코드 작성과 팀 협업이 용이해집니다.  
✅ 파이썬 패키지를 올바르게 구성하고 배포하면 코드 재사용성과 공유가 촉진됩니다.  
✅ 가상 환경과 의존성 관리는 안정적인 개발 환경을 유지하는 데 필수적입니다.  
✅ 지속적인 통합과 배포를 통해 코드 품질을 향상하고 릴리스 프로세스를 자동화할 수 있습니다.

--- 