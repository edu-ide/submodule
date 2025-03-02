# 객체지향 프로그래밍
## 클래스와 객체 활용

## 클래스 정의
```python
class Dog:
    def __init__(self, name):
        self.name = name
    
    def bark(self):
        print("Woof!")
```

## 객체 사용
```python
my_dog = Dog("Buddy")
my_dog.bark()  # Woof!
```

---
**📚 학습 리소스**
- [파이썬 클래스 - 공식 문서](https://docs.python.org/ko/3/tutorial/classes.html)

**🏆 도전 과제**
- 은행 계좌 클래스: 입금/출금/잔액 조회 기능 구현 