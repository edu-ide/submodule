---

# 📘 객체 지향 프로그래밍 - 캡슐화와 접근 제어

## 5.4 캡슐화(Encapsulation) 및 접근 제어자

### ✅ 5.4.1 캡슐화란?

캡슐화는 객체의 속성과 행동을 하나의 단위로 묶고, 실제 구현 내용 일부를 외부에 감추는 것을 말합니다.

**캡슐화의 이점:**
- 데이터 보호
- 유지보수성 향상
- 사용법 단순화
- 코드 변경의 영향 최소화

### ✅ 5.4.2 Python의 접근 제어

Python에서는 엄격한 접근 제어자가 없지만, 명명 규칙을 통해 접근 수준을 표현합니다:

| 접근 수준 | 명명 규칙 | 의미 |
|----------|----------|------|
| Public | 일반 이름 (name) | 어디서든 접근 가능 |
| Protected | 밑줄 하나 (_name) | 상속 관계에서만 접근 권장 |
| Private | 밑줄 두개 (__name) | 클래스 내부에서만 접근 권장 |

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner           # public 속성
        self._account_type = "일반"    # protected 속성
        self.__balance = balance      # private 속성
    
    # 캡슐화된 속성에 접근하는 메서드 제공
    def get_balance(self):
        return self.__balance
    
    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
            print(f"{amount}원이 입금되었습니다.")
            return True
        return False
    
    def withdraw(self, amount):
        if 0 < amount <= self.__balance:
            self.__balance -= amount
            print(f"{amount}원이 출금되었습니다.")
            return True
        print("잔액이 부족합니다.")
        return False
    
    def __update_balance(self, amount):
        # private 메서드 (클래스 내부에서만 사용)
        self.__balance = amount

# 객체 생성 및 사용
account = BankAccount("홍길동", 10000)

# public 속성 접근
print(account.owner)  # 홍길동

# protected 속성 접근 (경고는 없지만 외부에서 접근하지 않는 것이 권장됨)
print(account._account_type)  # 일반

# private 속성 직접 접근 시도
# print(account.__balance)  # AttributeError: 'BankAccount' object has no attribute '__balance'

# 정의된 메서드를 통한 접근
print(account.get_balance())  # 10000
account.deposit(5000)         # 5000원이 입금되었습니다.
print(account.get_balance())  # 15000
account.withdraw(2000)        # 2000원이 출금되었습니다.
print(account.get_balance())  # 13000
```

### ✅ 5.4.3 이름 맹글링(Name Mangling)

Python에서 `__`로 시작하는 속성은 내부적으로 이름이 변환되어 직접 접근이 어렵게 됩니다.

```python
# 이름 맹글링
print(dir(account))  # 여기서 '_BankAccount__balance'와 같은 형태로 변환된 것을 볼 수 있음
print(account._BankAccount__balance)  # 13000 (이름 맹글링 규칙을 알면 접근 가능)
```

### ✅ 5.4.4 프로퍼티(Property) 사용

Python의 `@property` 데코레이터를 사용하면 메서드를 속성처럼 접근할 수 있습니다.

```python
class Person:
    def __init__(self, name, age=0):
        self.name = name
        self.__age = age
    
    @property
    def age(self):
        """getter 메서드"""
        return self.__age
    
    @age.setter
    def age(self, value):
        """setter 메서드"""
        if value < 0:
            raise ValueError("나이는 음수가 될 수 없습니다.")
        self.__age = value
    
    @property
    def is_adult(self):
        """읽기 전용 프로퍼티"""
        return self.__age >= 20

# 객체 생성 및 프로퍼티 사용
person = Person("김철수", 25)

# 프로퍼티 접근 (getter)
print(person.age)  # 25

# 프로퍼티 설정 (setter)
person.age = 30
print(person.age)  # 30

# 읽기 전용 프로퍼티
print(person.is_adult)  # True

# 유효성 검사 테스트
try:
    person.age = -5
except ValueError as e:
    print(e)  # 나이는 음수가 될 수 없습니다.
```

### ✅ 5.4.5 데이터 검증과 캡슐화

캡슐화를 활용하면 유효한 데이터만 객체의 상태를 변경할 수 있도록 제어할 수 있습니다.

```python
class Product:
    def __init__(self, name, price):
        self.name = name
        self.__set_price(price)
    
    def __set_price(self, value):
        if value < 0:
            raise ValueError("가격은 음수가 될 수 없습니다.")
        self.__price = value
    
    @property
    def price(self):
        return self.__price
    
    @price.setter
    def price(self, value):
        self.__set_price(value)
    
    def discount(self, percentage):
        """할인율을 적용하여 가격 변경"""
        if not (0 <= percentage <= 100):
            raise ValueError("할인율은 0과 100 사이여야 합니다.")
        
        discount_amount = self.__price * (percentage / 100)
        self.__price -= discount_amount
        return self.__price

# 객체 생성 및 사용
product = Product("노트북", 1200000)
print(f"{product.name}의 가격: {product.price}원")

# 할인 적용
product.discount(10)
print(f"10% 할인 후 가격: {product.price}원")

# 유효성 검사 테스트
try:
    product.price = -50000
except ValueError as e:
    print(e)  # 가격은 음수가 될 수 없습니다.
``` 