# 데코레이터
## 함수 기능 확장

## 기본 데코레이터
```python
def my_decorator(func):
    def wrapper():
        print("전처리")
        func()
        print("후처리")
    return wrapper

@my_decorator
def say_hello():
    print("안녕하세요!")
```

---
**📚 학습 리소스**
- [파이썬 데코레이터 - Real Python](https://realpython.com/primer-on-python-decorators/)

**🏆 도전 과제**
- 실행 시간 측정 데코레이터 만들기 