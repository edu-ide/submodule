# 파일 입출력
## 데이터 영구 저장 및 관리

## 파일 읽기/쓰기
```python
with open('data.txt', 'w') as f:
    f.write("Hello World")

with open('data.txt') as f:
    content = f.read()
```

---
**📚 학습 리소스**
- [파이썬 파일 입출력 - W3Schools](https://www.w3schools.com/python/python_file_handling.asp)

**🏆 도전 과제**
- 로그 파일 분석기: 에러 발생 횟수 카운트 