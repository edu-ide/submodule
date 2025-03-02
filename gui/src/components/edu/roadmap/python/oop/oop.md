---

# 📘 1권 2부 5장: 객체 지향 프로그래밍 (OOP)

## 📌 목차
5.1 객체 지향 프로그래밍이란?  
5.2 클래스(Class)와 객체(Object)  
5.3 상속(Inheritance)과 다형성(Polymorphism)  
5.4 캡슐화(Encapsulation) 및 접근 제어자  
5.5 클래스 메서드와 정적 메서드  
5.6 Magic Methods  

## 5.1 객체 지향 프로그래밍이란?
객체 지향 프로그래밍(OOP, Object-Oriented Programming)은 데이터(속성)와 기능(메서드)을 하나의 객체로 묶어 사용하는 프로그래밍 방식입니다.

### 주요 특징:
- 코드를 구조화하여 재사용성과 유지보수성을 높일 수 있습니다.
- C++, Java, Python 등 많은 프로그래밍 언어에서 OOP를 지원합니다.
- 실제 세계의 개념을 프로그래밍으로 표현하기 쉽습니다.

## 5.2 클래스(Class)와 객체(Object)
### ✅ 클래스(Class) 정의
클래스는 객체를 생성하기 위한 설계도입니다.

```python
class Person:
    def __init__(self, name, age):
        self.name = name  # 속성 (Attributes)
        self.age = age

    def greet(self):
        print(f"안녕하세요! 제 이름은 {self.name}이고, 나이는 {self.age}살입니다.")

# 객체 생성
person1 = Person("Alice", 25)
person2 = Person("Bob", 30)

# 메서드 호출
person1.greet()
person2.greet()
```

## 5.3 상속(Inheritance)과 다형성(Polymorphism)
### ✅ 상속(Inheritance)
상속을 사용하면 기존 클래스를 확장하여 새로운 클래스를 생성할 수 있습니다.

```python
# 부모 클래스
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        pass  # 하위 클래스에서 구현할 예정

# 자식 클래스 (상속)
class Dog(Animal):
    def speak(self):
        return "멍멍!"

class Cat(Animal):
    def speak(self):
        return "야옹!"

# 객체 생성
dog = Dog("바둑이")
cat = Cat("나비")

print(f"{dog.name}: {dog.speak()}")
print(f"{cat.name}: {cat.speak()}")
```

## 5.4 캡슐화(Encapsulation) 및 접근 제어자
### ✅ 캡슐화란?
캡슐화는 클래스 내부의 속성(변수)과 메서드를 외부에서 직접 접근하지 못하도록 보호하는 개념입니다.

```python
class BankAccount:
    def __init__(self, balance):
        self.__balance = balance  # private 속성

    def deposit(self, amount):
        self.__balance += amount

    def get_balance(self):
        return self.__balance

# 객체 생성
account = BankAccount(1000)

# 입금
account.deposit(500)
print(account.get_balance())  # 1500

# print(account.__balance)  # 오류 발생 (접근 불가)
```

## 5.5 클래스 메서드와 정적 메서드
- 클래스 메서드(`@classmethod`): 클래스 변수를 조작할 때 사용
- 정적 메서드(`@staticmethod`): 인스턴스와 클래스 변수를 사용하지 않는 독립적인 기능

```python
class MathOperations:
    @staticmethod
    def add(x, y):
        return x + y

    @classmethod
    def describe(cls):
        return "이 클래스는 수학 연산을 제공합니다."

print(MathOperations.add(10, 5))  # 15
print(MathOperations.describe())  # 이 클래스는 수학 연산을 제공합니다.
```

## 5.6 Magic Methods (__init__, __str__, __repr__ 등)
### ✅ `__str__()` 메서드와 `__repr__()` 메서드
객체를 문자열로 표현하는 방법을 정의합니다.

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        return f"{self.name}({self.age}살)"

    def __repr__(self):
        return f"Person(name='{self.name}', age={self.age})"

person = Person("Alice", 25)
print(person)  # __str__ 호출
print(repr(person))  # __repr__ 호출
```

## 🎯 5장 실습 문제  

### [실습 1] 간단한 계산기 클래스

요구사항:
1. `Calculator` 클래스 구현
   - 메서드: 덧셈, 뺄셈, 곱셈, 나눗셈
   - 계산 기록 저장 기능
2. 0으로 나누기 예외 처리

```python
class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, x, y):
        result = x + y
        self.history.append(f"{x} + {y} = {result}")
        return result
    
    def subtract(self, x, y):
        result = x - y
        self.history.append(f"{x} - {y} = {result}")
        return result
    
    def multiply(self, x, y):
        result = x * y
        self.history.append(f"{x} × {y} = {result}")
        return result
    
    def divide(self, x, y):
        try:
            result = x / y
            self.history.append(f"{x} ÷ {y} = {result}")
            return result
        except ZeroDivisionError:
            print("0으로 나눌 수 없습니다.")
            return None
    
    def show_history(self):
        print("계산 기록:")
        for i, calc in enumerate(self.history, 1):
            print(f"{i}. {calc}")

# 테스트
def main():
    calc = Calculator()
    
    # 계산 테스트
    print(calc.add(5, 3))
    print(calc.multiply(4, 2))
    print(calc.subtract(10, 5))
    print(calc.divide(8, 2))
    
    # 계산 기록 출력
    calc.show_history()

if __name__ == "__main__":
    main()
```

### [실습 2] 간단한 학생 정보 관리

요구사항:
1. `Student` 클래스 구현
   - 속성: 이름, 나이, 학년
   - 메서드: 정보 출력, 학년 변경
2. 간단한 정보 관리 기능

```python
class Student:
    def __init__(self, name, age, grade):
        self.name = name
        self.age = age
        self.grade = grade
    
    def show_info(self):
        print("[학생 정보]")
        print(f"이름: {self.name}")
        print(f"나이: {self.age}세")
        print(f"학년: {self.grade}학년")
    
    def advance_grade(self):
        if self.grade < 6:  # 초등학교 기준
            self.grade += 1
            print(f"진급되었습니다. 현재 {self.grade}학년입니다.")
        else:
            print("더 이상 진급할 수 없습니다.")
    
    def have_birthday(self):
        self.age += 1
        print(f"생일 축하합니다! 이제 {self.age}세가 되었습니다.")

# 테스트
def main():
    # 학생 생성
    student1 = Student("김철수", 15, 1)
    student2 = Student("이영희", 14, 2)
    
    # 정보 출력
    student1.show_info()
    print()
    
    # 진급 및 생일
    student1.advance_grade()
    student1.have_birthday()
    print()
    
    # 변경된 정보 확인
    student1.show_info()

if __name__ == "__main__":
    main()
```

### [실습 3] 간단한 도형 클래스

요구사항:
1. `Circle` 클래스 구현
   - 반지름을 받아 원 생성
   - 원의 면적 계산
2. `Rectangle` 클래스 구현
   - 가로, 세로를 받아 사각형 생성
   - 사각형의 면적 계산

```python
import math

class Circle:
    def __init__(self, radius):
        self.radius = radius
    
    def get_area(self):
        return round(math.pi * self.radius ** 2, 2)

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def get_area(self):
        return self.width * self.height

# 테스트
def main():
    # 원 테스트
    circle = Circle(5)
    print(f"원의 면적: {circle.get_area()}")
    
    # 사각형 테스트
    rectangle = Rectangle(4, 6)
    print(f"사각형의 면적: {rectangle.get_area()}")

if __name__ == "__main__":
    main()
```

### [실습 4] 도서 관리 시스템

요구사항:
1. `Book` 클래스 구현
   - 속성: 제목, 저자, ISBN, 대출상태
   - 메서드: 대출하기, 반납하기
2. `Library` 클래스 구현
   - 속성: 도서목록
   - 메서드: 도서추가, 도서검색, 대출관리
3. 예외 처리 구현

```python
class Book:
    def __init__(self, title, author, isbn):
        self.title = title
        self.author = author
        self.isbn = isbn
        self.is_borrowed = False
    
    def borrow(self):
        if not self.is_borrowed:
            self.is_borrowed = True
            print(f"도서 '{self.title}' 가 대출되었습니다.")
            return True
        return False
    
    def return_book(self):
        if self.is_borrowed:
            self.is_borrowed = False
            print(f"도서 '{self.title}' 가 반납되었습니다.")
            return True
        return False

class Library:
    def __init__(self):
        self.books = {}
    
    def add_book(self, book):
        if book.isbn not in self.books:
            self.books[book.isbn] = book
            print(f"도서 '{book.title}' 가 추가되었습니다.")
            return True
        return False
    
    def find_book(self, isbn):
        return self.books.get(isbn)
    
    def borrow_book(self, isbn):
        book = self.find_book(isbn)
        if book:
            return book.borrow()
        print("도서를 찾을 수 없습니다.")
        return False
    
    def return_book(self, isbn):
        book = self.find_book(isbn)
        if book:
            return book.return_book()
        print("도서를 찾을 수 없습니다.")
        return False

# 테스트
def main():
    library = Library()
    
    # 도서 추가
    book1 = Book("파이썬 프로그래밍", "홍길동", "123-456")
    book2 = Book("객체지향의 기초", "김철수", "456-789")
    
    library.add_book(book1)
    library.add_book(book2)
    
    # 도서 대출/반납
    library.borrow_book("123-456")
    library.return_book("123-456")

if __name__ == "__main__":
    main()
```

### [실습 5] 은행 계좌 관리 시스템

요구사항:
1. `Account` 클래스 구현
   - 속성: 계좌번호, 소유자, 잔액
   - 메서드: 입금, 출금, 잔액조회
2. `Bank` 클래스 구현
   - 속성: 계좌목록
   - 메서드: 계좌생성, 계좌검색, 계좌이체
3. 잔액 부족 등의 예외 처리

```python
class InsufficientFundsError(Exception):
    pass

class Account:
    def __init__(self, account_number, owner, balance=0):
        self.account_number = account_number
        self.owner = owner
        self.balance = balance
    
    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            print(f"{amount}원이 입금되었습니다. 잔액: {self.balance}원")
            return True
        return False
    
    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError("잔액이 부족합니다.")
        self.balance -= amount
        print(f"{amount}원이 출금되었습니다. 잔액: {self.balance}원")
        return True
    
    def get_balance(self):
        return self.balance

class Bank:
    def __init__(self):
        self.accounts = {}
        self.account_counter = 1001
    
    def create_account(self, owner, initial_deposit=0):
        account_number = str(self.account_counter)
        account = Account(account_number, owner, initial_deposit)
        self.accounts[account_number] = account
        self.account_counter += 1
        print(f"계좌가 생성되었습니다. 계좌번호: {account_number}")
        return account
    
    def find_account(self, account_number):
        return self.accounts.get(account_number)
    
    def transfer(self, from_acc_num, to_acc_num, amount):
        try:
            from_account = self.find_account(from_acc_num)
            to_account = self.find_account(to_acc_num)
            
            if not from_account or not to_account:
                raise ValueError("계좌를 찾을 수 없습니다.")
                
            from_account.withdraw(amount)
            to_account.deposit(amount)
            print(f"계좌이체가 완료되었습니다.")
            return True
            
        except InsufficientFundsError as e:
            print(f"이체 실패: {e}")
            return False

# 테스트
def main():
    bank = Bank()
    
    # 계좌 생성
    account1 = bank.create_account("홍길동", 10000)
    account2 = bank.create_account("김철수", 5000)
    
    # 입금 및 출금 테스트
    account1.deposit(5000)
    try:
        account1.withdraw(3000)
    except InsufficientFundsError as e:
        print(e)
    
    # 계좌이체 테스트
    bank.transfer(account1.account_number, account2.account_number, 2000)

if __name__ == "__main__":
    main()
```

## 📌 5장 요약
✅ 클래스(Class)와 객체(Object)  
✅ 생성자(`__init__`)를 사용하여 객체 초기화  
✅ 상속(Inheritance)으로 기존 클래스를 확장 가능  
✅ 캡슐화(Encapsulation)로 속성을 보호할 수 있음  
✅ 클래스 메서드, 정적 메서드 활용 가능  
✅ Magic Methods(`__str__`, `__repr__`)를 사용하여 객체 표현 가능

---