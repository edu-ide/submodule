# 예외 처리
## 오류 처리 메커니즘

## 기본 구조
```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("0으로 나눌 수 없습니다")
finally:
    print("처리 완료")
```

## 사용자 정의 예외
```python
class MyError(Exception):
    pass

raise MyError("사용자 정의 오류 발생")
```

---
**📚 학습 리소스**
- [파이썬 예외 처리 - 공식 문서](https://docs.python.org/ko/3/tutorial/errors.html)

**🏆 도전 과제**
- 파일 읽기 안전화: 존재하지 않는 파일 처리 구현 