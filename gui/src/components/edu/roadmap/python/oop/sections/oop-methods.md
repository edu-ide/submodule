---

# 📘 객체 지향 프로그래밍 - 클래스 메서드와 정적 메서드

## 5.5 클래스 메서드와 정적 메서드

Python에서는 인스턴스 메서드 외에도 클래스 메서드와 정적 메서드를 정의할 수 있습니다. 각 메서드는 사용 목적과 특성이 다릅니다.

### ✅ 5.5.1 인스턴스 메서드, 클래스 메서드, 정적 메서드 비교

| 메서드 유형 | 데코레이터 | 첫 번째 매개변수 | 주요 용도 |
|-----------|-----------|---------------|---------|
| 인스턴스 메서드 | 없음 | self (인스턴스 참조) | 인스턴스 속성 조작, 인스턴스별 동작 구현 |
| 클래스 메서드 | @classmethod | cls (클래스 참조) | 클래스 속성 조작, 대체 생성자 구현 |
| 정적 메서드 | @staticmethod | 없음 | 클래스와 관련된 유틸리티 함수 구현 |

```python
class MyClass:
    class_var = "클래스 변수"
    
    def __init__(self, value):
        self.instance_var = value
    
    # 인스턴스 메서드
    def instance_method(self):
        print(f"인스턴스 메서드 호출: {self.instance_var}")
        print(f"클래스 변수 접근: {self.class_var}")
    
    # 클래스 메서드
    @classmethod
    def class_method(cls, param):
        print(f"클래스 메서드 호출: {param}")
        print(f"클래스 변수 접근: {cls.class_var}")
        # 인스턴스 변수 접근 불가: self.instance_var
        return cls("클래스 메서드로 생성")
    
    # 정적 메서드
    @staticmethod
    def static_method(param):
        print(f"정적 메서드 호출: {param}")
        # 클래스 변수와 인스턴스 변수 직접 접근 불가
        # print(class_var)  # Error
        # print(instance_var)  # Error

# 인스턴스 메서드 호출 (인스턴스를 통해 호출)
obj = MyClass("인스턴스 값")
obj.instance_method()

# 클래스 메서드 호출 (클래스 이름으로 직접 호출 가능)
MyClass.class_method("클래스 매개변수")

# 클래스 메서드를 대체 생성자로 사용
obj2 = MyClass.class_method("값")
obj2.instance_method()

# 정적 메서드 호출 (클래스 이름으로 직접 호출 가능)
MyClass.static_method("정적 매개변수")

# 인스턴스를 통해서도 클래스 메서드와 정적 메서드 호출 가능
obj.class_method("인스턴스를 통한 클래스 메서드")
obj.static_method("인스턴스를 통한 정적 메서드")
```

### ✅ 5.5.2 대체 생성자로서의 클래스 메서드

클래스 메서드는 다양한 방식으로 객체를 생성하는 대체 생성자로 자주 사용됩니다.

```python
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day
    
    def __str__(self):
        return f"{self.year}년 {self.month}월 {self.day}일"
    
    # 문자열로부터 Date 객체 생성
    @classmethod
    def from_string(cls, date_string):
        year, month, day = map(int, date_string.split('-'))
        return cls(year, month, day)
    
    # 현재 날짜로 Date 객체 생성
    @classmethod
    def today(cls):
        import datetime
        now = datetime.datetime.now()
        return cls(now.year, now.month, now.day)

# 기본 생성자 사용
date1 = Date(2023, 11, 20)
print(date1)  # 2023년 11월 20일

# 문자열에서 생성
date2 = Date.from_string("2023-12-25")
print(date2)  # 2023년 12월 25일

# 현재 날짜로 생성
date3 = Date.today()
print(date3)  # 현재 날짜 출력
```

### ✅ 5.5.3 정적 메서드 활용

정적 메서드는 클래스와 관련된 유틸리티 함수를 구현할 때 유용합니다.

```python
class MathUtils:
    @staticmethod
    def add(x, y):
        return x + y
    
    @staticmethod
    def subtract(x, y):
        return x - y
    
    @staticmethod
    def multiply(x, y):
        return x * y
    
    @staticmethod
    def divide(x, y):
        if y == 0:
            raise ValueError("0으로 나눌 수 없습니다.")
        return x / y
    
    @staticmethod
    def is_prime(n):
        """소수 판별 정적 메서드"""
        if n <= 1:
            return False
        if n <= 3:
            return True
        if n % 2 == 0 or n % 3 == 0:
            return False
        i = 5
        while i * i <= n:
            if n % i == 0 or n % (i + 2) == 0:
                return False
            i += 6
        return True

# 정적 메서드 사용
print(MathUtils.add(10, 5))        # 15
print(MathUtils.is_prime(17))      # True
print(MathUtils.is_prime(20))      # False
```

### ✅ 5.5.4 팩토리 메서드 패턴

클래스 메서드를 사용하여 팩토리 메서드 패턴을 구현할 수 있습니다.

```python
class Vehicle:
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year
    
    def get_info(self):
        return f"{self.year} {self.make} {self.model}"

class Car(Vehicle):
    def __init__(self, make, model, year, doors=4):
        super().__init__(make, model, year)
        self.doors = doors
        self.wheels = 4
        self.vehicle_type = "자동차"
    
    def get_info(self):
        return f"{super().get_info()}, {self.doors}도어 {self.vehicle_type}"

class Motorcycle(Vehicle):
    def __init__(self, make, model, year, has_sidecar=False):
        super().__init__(make, model, year)
        self.has_sidecar = has_sidecar
        self.wheels = 2 if not has_sidecar else 3
        self.vehicle_type = "오토바이"
    
    def get_info(self):
        sidecar_info = "사이드카 있음" if self.has_sidecar else "사이드카 없음"
        return f"{super().get_info()}, {sidecar_info} {self.vehicle_type}"

class VehicleFactory:
    @staticmethod
    def create_vehicle(vehicle_type, **kwargs):
        if vehicle_type.lower() == "car":
            return Car(**kwargs)
        elif vehicle_type.lower() == "motorcycle":
            return Motorcycle(**kwargs)
        else:
            raise ValueError(f"알 수 없는 차량 유형: {vehicle_type}")

# 팩토리 메서드 사용
car = VehicleFactory.create_vehicle("car", make="현대", model="아반떼", year=2022)
motorcycle = VehicleFactory.create_vehicle("motorcycle", make="할리데이비슨", model="스포스터", year=2021, has_sidecar=True)

print(car.get_info())        # 2022 현대 아반떼, 4도어 자동차
print(motorcycle.get_info()) # 2021 할리데이비슨 스포스터, 사이드카 있음 오토바이
``` 