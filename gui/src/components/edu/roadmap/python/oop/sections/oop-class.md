---

# 📘 객체 지향 프로그래밍 - 클래스와 객체

## 5.2 클래스(Class)와 객체(Object)

### ✅ 5.2.1 클래스(Class) 정의

클래스는 객체를 생성하기 위한 설계도 또는 템플릿으로, 데이터(속성)와 기능(메서드)을 정의합니다.

```python
class Person:
    # 클래스 변수 - 모든 인스턴스가 공유
    species = "인간"
    
    # 생성자 메서드 - 객체 초기화
    def __init__(self, name, age):
        # 인스턴스 변수 - 각 객체마다 고유한 값
        self.name = name
        self.age = age
    
    # 인스턴스 메서드 - 객체의 행동 정의
    def greet(self):
        print(f"안녕하세요! 제 이름은 {self.name}이고, 나이는 {self.age}살입니다.")
    
    def have_birthday(self):
        self.age += 1
        print(f"{self.name}의 생일입니다! 이제 {self.age}살이 되었습니다.")
```

### ✅ 5.2.2 객체(Object) 생성과 사용

객체(또는 인스턴스)는 클래스로부터 생성된 실체입니다.

```python
# 객체 생성
person1 = Person("김철수", 25)
person2 = Person("이영희", 30)

# 인스턴스 변수 접근
print(person1.name)  # 김철수
print(person2.age)   # 30

# 클래스 변수 접근
print(Person.species)  # 인간
print(person1.species)  # 인간 (인스턴스를 통해서도 접근 가능)

# 메서드 호출
person1.greet()  # 안녕하세요! 제 이름은 김철수이고, 나이는 25살입니다.
person2.greet()  # 안녕하세요! 제 이름은 이영희이고, 나이는 30살입니다.

# 상태 변경
person1.have_birthday()  # 김철수의 생일입니다! 이제 26살이 되었습니다.
```

### ✅ 5.2.3 self 키워드 이해하기

`self`는 인스턴스 자신을 가리키는 참조로, 인스턴스 메서드의 첫 번째 매개변수로 사용됩니다.

```python
class Counter:
    def __init__(self, start=0):
        self.count = start
    
    def increment(self):
        self.count += 1
        return self.count
    
    def reset(self):
        self.count = 0
        return self.count
    
    def display(self):
        print(f"현재 카운트: {self.count}")

# self의 역할
counter = Counter(10)
counter.display()  # 현재 카운트: 10

print(counter.increment())  # 11
counter.display()  # 현재 카운트: 11

counter.reset()
counter.display()  # 현재 카운트: 0
```

### ✅ 5.2.4 클래스 변수 vs 인스턴스 변수

| 클래스 변수 | 인스턴스 변수 |
|-------------|---------------|
| 클래스 내에서 정의 | `__init__` 메서드 내에서 정의 |
| 모든 인스턴스가 공유 | 각 인스턴스마다 고유한 값 |
| 클래스 이름으로 접근 | 인스턴스 이름으로 접근 |
| 인스턴스도 접근 가능 | 해당 인스턴스만 접근 가능 |

```python
class Dog:
    # 클래스 변수
    species = "개"
    count = 0
    
    def __init__(self, name, age):
        # 인스턴스 변수
        self.name = name
        self.age = age
        # 클래스 변수 수정
        Dog.count += 1
    
    def bark(self):
        print(f"{self.name}: 멍멍!")

# 클래스 변수 사용
print(f"현재 개 수: {Dog.count}")  # 현재 개 수: 0

dog1 = Dog("바둑이", 3)
dog2 = Dog("흰둥이", 2)

print(f"현재 개 수: {Dog.count}")  # 현재 개 수: 2
print(f"종: {Dog.species}")        # 종: 개
print(f"이름: {dog1.name}")        # 이름: 바둑이 (인스턴스 변수)
``` 