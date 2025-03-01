# Jupyter Notebook 설치

## 1. 명령 프롬프트(cmd) 또는 PowerShell 실행
## 2. 다음 명령어 입력 후 엔터:
```bash
pip install notebook
```

✅ 설치 완료 후 확인:
```bash
jupyter --version
```

✅ 정상적인 결과 예시:
```yaml
jupyter core     : 4.x.x
jupyter-notebook : 6.x.x
jupyter client   : 7.x.x
```

## 3. Jupyter Notebook 실행하기
✅ 실행 방법
```bash
jupyter notebook
```

📌 실행하면 기본 웹 브라우저에서 **Jupyter Notebook**이 자동으로 열립니다.  
만약 브라우저가 열리지 않으면, 아래 주소를 직접 입력하여 접근할 수 있습니다.  
- `localhost:8888`
- `http://127.0.0.1:8888`
- `http://localhost:8888/tree`

## 4. 가상환경에서 Jupyter Notebook 사용 (선택 사항)
💡 **여러 프로젝트를 관리하려면 가상환경을 사용하는 것이 좋습니다.**

✅ 가상환경 만들기
```bash
python -m venv myenv
```

✅ 가상환경 활성화
```bash
myenv\Scripts\activate
```

✅ 가상환경에 Jupyter 설치
```bash
pip install notebook
```

✅ 가상환경에서 Jupyter 실행
```bash
jupyter notebook
```

## 5. Jupyter Notebook 기본 사용법
✅ 새로운 노트북 생성
1. **Jupyter Notebook 실행**
2. **브라우저에서 `New → Python 3` 클릭**
3. **새로운 노트북(`.ipynb`) 파일이 생성됨**

✅ 첫 번째 코드 실행
코드 셀에 다음 입력 후 `Shift + Enter` 실행:
```python
print("Hello, Jupyter!")
```

**출력:**
```
Hello, Jupyter!
```

## 6. Jupyter Notebook 제거 방법 (필요할 경우)
Jupyter를 제거하고 싶다면 다음 명령어 실행:
```bash
pip uninstall notebook
```

✅ **삭제 후 `jupyter --version`을 입력했을 때 오류가 나오면 완전히 삭제된 것임**

## 7. 문제 해결 (에러 발생 시)
✅ `jupyter: command not found` 또는 `jupyter is not recognized` 오류 해결
```bash
python -m notebook
```
또는
```bash
python -m pip install --upgrade notebook
```

✅ Jupyter Notebook이 실행되지 않는 경우
1. `Ctrl + C`로 서버 종료 후 다시 실행
2. 브라우저가 자동으로 열리지 않으면 **`http://127.0.0.1:8888`** 직접 입력 