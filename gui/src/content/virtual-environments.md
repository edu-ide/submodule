# 가상 환경
## 프로젝트별 의존성 관리

## venv 사용법
```bash
python -m venv myenv
source myenv/bin/activate  # Linux/Mac
myenv\Scripts\activate.bat  # Windows
```

## requirements.txt 관리
```bash
pip freeze > requirements.txt
pip install -r requirements.txt
```

---
**📚 학습 리소스**
- [파이썬 가상 환경 - 공식 문서](https://docs.python.org/ko/3/tutorial/venv.html)

**🏆 도전 과제**
- 프로젝트별 독립적인 의존성 환경 구성 