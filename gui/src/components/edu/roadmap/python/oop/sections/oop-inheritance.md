---

# 📘 객체 지향 프로그래밍 - 상속과 다형성

## 5.3 상속(Inheritance)과 다형성(Polymorphism)

### ✅ 5.3.1 상속(Inheritance)

상속은 기존 클래스의 속성과 메서드를 새로운 클래스가 재사용할 수 있게 하는 메커니즘입니다.

```python
# 부모 클래스 (기본 클래스)
class Animal:
    def __init__(self, name):
        self.name = name
    
    def eat(self):
        print(f"{self.name}이(가) 먹이를 먹습니다.")
    
    def speak(self):
        # 자식 클래스에서 오버라이드할 메서드
        pass

# 자식 클래스 (파생 클래스)
class Dog(Animal):
    def __init__(self, name, breed):
        # 부모 클래스의 생성자 호출
        super().__init__(name)
        self.breed = breed
    
    def speak(self):
        # 부모 클래스의 메서드 오버라이드
        return f"{self.name}: 멍멍!"
    
    def fetch(self):
        # 자식 클래스만의 새로운 메서드
        return f"{self.name}이(가) 공을 가져옵니다."

# 또 다른 자식 클래스
class Cat(Animal):
    def speak(self):
        return f"{self.name}: 야옹!"
    
    def scratch(self):
        return f"{self.name}이(가) 긁습니다."

# 객체 생성 및 사용
dog = Dog("바둑이", "진돗개")
cat = Cat("나비")

print(dog.name)          # 바둑이
print(dog.breed)         # 진돗개
print(dog.speak())       # 바둑이: 멍멍!
print(dog.fetch())       # 바둑이이(가) 공을 가져옵니다.
dog.eat()                # 바둑이이(가) 먹이를 먹습니다.

print(cat.name)          # 나비
print(cat.speak())       # 나비: 야옹!
print(cat.scratch())     # 나비이(가) 긁습니다.
cat.eat()                # 나비이(가) 먹이를 먹습니다.
```

### ✅ 5.3.2 다형성(Polymorphism)

다형성은 동일한 인터페이스를 통해 다양한 유형의 객체가 각자의 방식으로 응답할 수 있게 하는 능력입니다.

```python
# 다형성 예시
def animal_sound(animal):
    # animal 객체의 실제 타입에 따라 다른 결과 반환
    print(animal.speak())

# 서로 다른 클래스의 객체로 함수 호출
animal_sound(dog)  # 바둑이: 멍멍!
animal_sound(cat)  # 나비: 야옹!

# 다형성을 활용한 코드
animals = [Dog("초코", "푸들"), Cat("루시"), Dog("맥스", "리트리버")]

for animal in animals:
    print(animal.speak())  # 각 객체 타입에 맞는 speak() 메서드 실행
```

### ✅ 5.3.3 다중 상속

Python은 한 클래스가 여러 부모 클래스로부터 상속받을 수 있는 다중 상속을 지원합니다.

```python
# 다중 상속 예시
class Swimmer:
    def swim(self):
        return "수영하기"

class Flyer:
    def fly(self):
        return "날기"

# 다중 상속
class Duck(Animal, Swimmer, Flyer):
    def __init__(self, name):
        super().__init__(name)
    
    def speak(self):
        return f"{self.name}: 꽥꽥!"

# 객체 생성 및 사용
duck = Duck("도널드")
print(duck.speak())  # 도널드: 꽥꽥!
print(duck.swim())   # 수영하기
print(duck.fly())    # 날기
duck.eat()           # 도널드이(가) 먹이를 먹습니다.
```

### ✅ 5.3.4 메서드 오버라이딩 vs 오버로딩

- **오버라이딩(Overriding)**: 자식 클래스에서 부모 클래스의 메서드를 재정의
- **오버로딩(Overloading)**: 같은 이름의 메서드가 다른 매개변수를 가짐

```python
class Shape:
    def area(self):
        return 0

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    # 메서드 오버라이딩
    def area(self):
        return self.width * self.height

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    
    # 메서드 오버라이딩
    def area(self):
        return 3.14 * self.radius ** 2

# 다형성 활용
shapes = [Rectangle(5, 10), Circle(7), Shape()]

for shape in shapes:
    print(f"도형의 면적: {shape.area()}")
```

### ✅ 5.3.5 상속과 `isinstance()`, `issubclass()`

```python
# isinstance()와 issubclass() 사용 예시
print(isinstance(dog, Dog))        # True
print(isinstance(dog, Animal))     # True (상속 관계)
print(isinstance(cat, Dog))        # False

print(issubclass(Dog, Animal))     # True
print(issubclass(Cat, Animal))     # True
print(issubclass(Duck, Swimmer))   # True (다중 상속)
``` 