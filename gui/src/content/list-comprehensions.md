# 리스트 컴프리헨션
## 간결한 리스트 생성

## 기본 사용법
```python
squares = [x**2 for x in range(10)]
```

## 조건문 포함
```python
even_numbers = [x for x in range(100) if x % 2 == 0]
```

---
**📚 학습 리소스**
- [리스트 컴프리헨션 - Real Python](https://realpython.com/list-comprehension-python/)

**🏆 도전 과제**
- 피타고라스 삼조 생성: a² + b² = c² (a < b < c < 100) 