---

# 📘 객체 지향 프로그래밍 - 실습 프로젝트

## 5.7 실습 프로젝트

다음 실습 프로젝트를 통해 객체 지향 프로그래밍의 개념을 적용해보세요.

### ✅ 5.7.1 간단한 계산기 클래스

**요구사항:**
1. `Calculator` 클래스 구현
   - 사칙연산 메서드 포함
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
    print(calc.add(5, 3))        # 8
    print(calc.multiply(4, 2))   # 8
    print(calc.subtract(10, 5))  # 5
    print(calc.divide(8, 2))     # 4.0
    print(calc.divide(8, 0))     # 0으로 나눌 수 없습니다.
    
    # 계산 기록 출력
    calc.show_history()

if __name__ == "__main__":
    main()
```

### ✅ 5.7.2 간단한 학생 정보 관리

**요구사항:**
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

### ✅ 5.7.3 간단한 도형 클래스

**요구사항:**
1. 다양한 도형 클래스 구현
   - `Shape` 기본 클래스
   - `Circle`, `Rectangle`, `Triangle` 자식 클래스
2. 도형의 면적과 둘레 계산

```python
import math

class Shape:
    def __init__(self, name):
        self.name = name
    
    def area(self):
        # 하위 클래스에서 구현
        pass
    
    def perimeter(self):
        # 하위 클래스에서 구현
        pass
    
    def display(self):
        print(f"{self.name}:")
        print(f"  - 면적: {self.area()}")
        print(f"  - 둘레: {self.perimeter()}")

class Circle(Shape):
    def __init__(self, radius):
        super().__init__("원")
        self.radius = radius
    
    def area(self):
        return round(math.pi * self.radius ** 2, 2)
    
    def perimeter(self):
        return round(2 * math.pi * self.radius, 2)

class Rectangle(Shape):
    def __init__(self, width, height):
        super().__init__("직사각형")
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

class Triangle(Shape):
    def __init__(self, a, b, c):
        super().__init__("삼각형")
        self.a = a
        self.b = b
        self.c = c
    
    def area(self):
        # 헤론의 공식
        s = (self.a + self.b + self.c) / 2
        return round(math.sqrt(s * (s - self.a) * (s - self.b) * (s - self.c)), 2)
    
    def perimeter(self):
        return self.a + self.b + self.c

# 테스트
def main():
    circle = Circle(5)
    rectangle = Rectangle(4, 6)
    triangle = Triangle(3, 4, 5)
    
    for shape in [circle, rectangle, triangle]:
        shape.display()
        print()

if __name__ == "__main__":
    main()
```

### ✅ 5.7.4 도서 관리 시스템

**요구사항:**
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
    
    def __str__(self):
        status = "대출 중" if self.is_borrowed else "대출 가능"
        return f"'{self.title}' (저자: {self.author}, ISBN: {self.isbn}) - {status}"
    
    def borrow(self):
        if not self.is_borrowed:
            self.is_borrowed = True
            print(f"도서 '{self.title}' 가 대출되었습니다.")
            return True
        print(f"도서 '{self.title}' 는 이미 대출 중입니다.")
        return False
    
    def return_book(self):
        if self.is_borrowed:
            self.is_borrowed = False
            print(f"도서 '{self.title}' 가 반납되었습니다.")
            return True
        print(f"도서 '{self.title}' 는 대출 중이 아닙니다.")
        return False

class Library:
    def __init__(self, name):
        self.name = name
        self.books = {}
    
    def add_book(self, book):
        if book.isbn not in self.books:
            self.books[book.isbn] = book
            print(f"도서 '{book.title}' 가 {self.name}에 추가되었습니다.")
            return True
        print(f"ISBN {book.isbn}은(는) 이미 등록된 도서입니다.")
        return False
    
    def find_book(self, isbn):
        return self.books.get(isbn)
    
    def search_books(self, keyword):
        results = []
        for book in self.books.values():
            if (keyword.lower() in book.title.lower() or
                keyword.lower() in book.author.lower()):
                results.append(book)
        return results
    
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
    
    def display_books(self):
        print(f"\n===== {self.name} 도서 목록 =====")
        if not self.books:
            print("등록된 도서가 없습니다.")
            return
        
        for idx, book in enumerate(self.books.values(), 1):
            print(f"{idx}. {book}")

# 테스트
def main():
    library = Library("파이썬 도서관")
    
    # 도서 추가
    book1 = Book("파이썬 프로그래밍", "홍길동", "123-456")
    book2 = Book("객체지향의 기초", "김철수", "456-789")
    book3 = Book("파이썬으로 배우는 알고리즘", "이영희", "789-123")
    
    library.add_book(book1)
    library.add_book(book2)
    library.add_book(book3)
    
    # 도서 목록 출력
    library.display_books()
    
    # 도서 검색
    print("\n=== '파이썬' 키워드 검색 결과 ===")
    search_results = library.search_books("파이썬")
    for idx, book in enumerate(search_results, 1):
        print(f"{idx}. {book}")
    
    # 도서 대출/반납
    print("\n=== 도서 대출 및 반납 테스트 ===")
    library.borrow_book("123-456")
    library.borrow_book("123-456")  # 이미 대출 중
    library.return_book("123-456")
    library.return_book("123-456")  # 이미 반납됨
    
    # 도서 목록 다시 출력
    library.display_books()

if __name__ == "__main__":
    main()
```

### ✅ 5.7.5 은행 계좌 관리 시스템

**요구사항:**
1. `Account` 클래스 구현
   - 속성: 계좌번호, 소유자, 잔액
   - 메서드: 입금, 출금, 잔액조회
2. `Bank` 클래스 구현
   - 속성: 계좌목록
   - 메서드: 계좌생성, 계좌검색, 계좌이체
3. 잔액 부족 등의 예외 처리

```python
class InsufficientFundsError(Exception):
    """잔액이 부족할 때 발생하는 사용자 정의 예외"""
    pass

class Account:
    def __init__(self, account_number, owner, balance=0):
        self.account_number = account_number
        self.owner = owner
        self._balance = balance  # protected 속성
    
    @property
    def balance(self):
        """잔액 조회용 getter"""
        return self._balance
    
    def deposit(self, amount):
        """입금 메서드"""
        if amount <= 0:
            raise ValueError("입금액은 0보다 커야 합니다.")
        
        self._balance += amount
        print(f"{amount}원이 입금되었습니다. 잔액: {self._balance}원")
        return True
    
    def withdraw(self, amount):
        """출금 메서드"""
        if amount <= 0:
            raise ValueError("출금액은 0보다 커야 합니다.")
        
        if amount > self._balance:
            raise InsufficientFundsError("잔액이 부족합니다.")
        
        self._balance -= amount
        print(f"{amount}원이 출금되었습니다. 잔액: {self._balance}원")
        return True
    
    def __str__(self):
        return f"계좌번호: {self.account_number}, 소유자: {self.owner}, 잔액: {self._balance}원"

class Bank:
    def __init__(self, name):
        self.name = name
        self.accounts = {}
        self.next_account_number = 1001
    
    def create_account(self, owner, initial_deposit=0):
        """새 계좌 생성"""
        account_number = str(self.next_account_number)
        account = Account(account_number, owner, initial_deposit)
        self.accounts[account_number] = account
        self.next_account_number += 1
        
        print(f"{owner} 님의 계좌가 생성되었습니다. 계좌번호: {account_number}")
        return account
    
    def find_account(self, account_number):
        """계좌번호로 계좌 검색"""
        return self.accounts.get(account_number)
    
    def transfer(self, from_acc_num, to_acc_num, amount):
        """계좌 이체"""
        try:
            from_account = self.find_account(from_acc_num)
            to_account = self.find_account(to_acc_num)
            
            if not from_account or not to_account:
                raise ValueError("계좌를 찾을 수 없습니다.")
                
            # 출금 및 입금
            from_account.withdraw(amount)
            to_account.deposit(amount)
            
            print(f"이체 완료: {from_account.owner} -> {to_account.owner}, {amount}원")
            return True
            
        except InsufficientFundsError as e:
            print(f"이체 실패: {e}")
            return False
        except ValueError as e:
            print(f"이체 실패: {e}")
            return False
    
    def display_accounts(self):
        """모든 계좌 정보 출력"""
        print(f"\n===== {self.name} 계좌 목록 =====")
        if not self.accounts:
            print("등록된 계좌가 없습니다.")
            return
        
        for account in self.accounts.values():
            print(account)

# 테스트
def main():
    bank = Bank("파이썬 은행")
    
    # 계좌 생성
    account1 = bank.create_account("홍길동", 10000)
    account2 = bank.create_account("김철수", 5000)
    account3 = bank.create_account("이영희", 2000)
    
    # 계좌 목록 출력
    bank.display_accounts()
    
    # 입금 및 출금 테스트
    print("\n=== 입금 및 출금 테스트 ===")
    try:
        account1.deposit(5000)
        account1.withdraw(2000)
        # 오류 테스트
        account3.withdraw(3000)  # 잔액 부족
    except InsufficientFundsError as e:
        print(f"오류: {e}")
    
    # 계좌 이체 테스트
    print("\n=== 계좌 이체 테스트 ===")
    bank.transfer(account1.account_number, account2.account_number, 3000)
    
    # 계좌 목록 다시 출력
    bank.display_accounts()

if __name__ == "__main__":
    main()
```

## 📌 학습 정리
✅ 객체 지향 프로그래밍은 데이터와 기능을 클래스라는 단위로 묶어 관리합니다.  
✅ 클래스는 객체를 생성하기 위한 템플릿으로, 속성과 메서드를 포함합니다.  
✅ 상속은 기존 클래스의 특성을 새로운 클래스에 물려주는 메커니즘입니다.  
✅ 다형성은 같은 인터페이스로 다양한 객체 타입을 다룰 수 있는 능력입니다.  
✅ 캡슐화는 객체의 내부 상태를 외부로부터 보호하고 메서드를 통해 접근하도록 합니다.  
✅ 매직 메서드를 사용하여 연산자와 내장 함수를 커스터마이징할 수 있습니다. 