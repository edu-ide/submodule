# 제너레이터
## 메모리 효율적인 반복 처리

## 제너레이터 함수
```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for i in countdown(5):
    print(i)  # 5,4,3,2,1
```

## 제너레이터 표현식
```python
squares = (x*x for x in range(10))
```

---
**📚 학습 리소스**
- [파이썬 제너레이터 - Real Python](https://realpython.com/introduction-to-python-generators/)

**🏆 도전 과제**
- 피보나치 수열 생성기 구현 