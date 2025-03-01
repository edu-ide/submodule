---

# 📘 객체 지향 프로그래밍 - Magic Methods

## 5.6 Magic Methods (__init__, __str__, __repr__ 등)

매직 메서드(Magic Methods 또는 Dunder Methods)는 이중 밑줄(__)로 시작하고 끝나는 특별한 메서드로, Python 인터프리터에 의해 특정 상황에서 자동으로 호출됩니다.

### ✅ 5.6.1 기본적인 매직 메서드

| 매직 메서드 | 호출 시점 | 주요 용도 |
|------------|----------|----------|
| `__init__(self, ...)` | 객체 생성 시 | 객체 초기화 |
| `__str__(self)` | `str(obj)`, `print(obj)` | 사용자 친화적 문자열 표현 |
| `__repr__(self)` | `repr(obj)`, 인터프리터 | 개발자 친화적 문자열 표현 |
| `__len__(self)` | `len(obj)` | 객체의 길이 반환 |
| `__del__(self)` | 객체 소멸 시 | 객체 소멸 시 정리 작업 |

```python
class Person:
    def __init__(self, name, age):
        print("객체가 생성되었습니다.")
        self.name = name
        self.age = age
    
    def __str__(self):
        return f"{self.name}({self.age}세)"
    
    def __repr__(self):
        return f"Person(name='{self.name}', age={self.age})"
    
    def __len__(self):
        return len(self.name)
    
    def __del__(self):
        print(f"{self.name} 객체가 제거되었습니다.")

# 객체 생성 및 매직 메서드 호출
person = Person("홍길동", 30)  # __init__ 호출

print(person)  # __str__ 호출: 홍길동(30세)
print(repr(person))  # __repr__ 호출: Person(name='홍길동', age=30)
print(len(person))  # __len__ 호출: 3

# 객체가 제거될 때 __del__ 호출됨
```

### ✅ 5.6.2 연산자 오버로딩을 위한 매직 메서드

| 연산자 | 매직 메서드 | 예시 |
|-------|------------|------|
| + | `__add__(self, other)` | `a + b` |
| - | `__sub__(self, other)` | `a - b` |
| * | `__mul__(self, other)` | `a * b` |
| / | `__truediv__(self, other)` | `a / b` |
| // | `__floordiv__(self, other)` | `a // b` |
| % | `__mod__(self, other)` | `a % b` |
| ** | `__pow__(self, other)` | `a ** b` |

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __str__(self):
        return f"Vector({self.x}, {self.y})"
    
    # 벡터 덧셈: v1 + v2
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    # 벡터 뺄셈: v1 - v2
    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)
    
    # 벡터와 스칼라 곱셈: v1 * 3
    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)
    
    # 벡터 크기: len(v)
    def __len__(self):
        return int((self.x**2 + self.y**2) ** 0.5)
    
    # 같은지 비교: v1 == v2
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

# 벡터 연산 예시
v1 = Vector(3, 4)
v2 = Vector(5, 6)

v3 = v1 + v2  # __add__ 호출
print(v3)  # Vector(8, 10)

v4 = v1 - v2  # __sub__ 호출
print(v4)  # Vector(-2, -2)

v5 = v1 * 2  # __mul__ 호출
print(v5)  # Vector(6, 8)

print(len(v1))  # __len__ 호출: 5 (벡터의 크기)

print(v1 == Vector(3, 4))  # __eq__ 호출: True
print(v1 == v2)            # __eq__ 호출: False
```

### ✅ 5.6.3 비교 연산자를 위한 매직 메서드

| 연산자 | 매직 메서드 | 예시 |
|-------|------------|------|
| == | `__eq__(self, other)` | `a == b` |
| != | `__ne__(self, other)` | `a != b` |
| < | `__lt__(self, other)` | `a < b` |
| <= | `__le__(self, other)` | `a <= b` |
| > | `__gt__(self, other)` | `a > b` |
| >= | `__ge__(self, other)` | `a >= b` |

```python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    
    def __str__(self):
        return f"{self.name}: {self.score}점"
    
    # 점수로 학생 비교
    def __eq__(self, other):
        return self.score == other.score
    
    def __lt__(self, other):
        return self.score < other.score
    
    def __gt__(self, other):
        return self.score > other.score

# 학생 비교 예시
s1 = Student("김철수", 85)
s2 = Student("이영희", 92)
s3 = Student("박지성", 85)

print(s1 == s3)  # True (점수가 같음)
print(s1 < s2)   # True (s1의 점수가 더 낮음)
print(s2 > s1)   # True (s2의 점수가 더 높음)

# 정렬 예시
students = [s1, s2, s3]
sorted_students = sorted(students)  # __lt__를 사용하여 정렬

for student in sorted_students:
    print(student)  # 점수 오름차순으로 출력
```

### ✅ 5.6.4 컨테이너 동작을 위한 매직 메서드

| 매직 메서드 | 호출 시점 | 주요 용도 |
|------------|----------|----------|
| `__getitem__(self, key)` | `obj[key]` | 인덱싱/키로 접근 |
| `__setitem__(self, key, value)` | `obj[key] = value` | 인덱싱/키로 값 설정 |
| `__delitem__(self, key)` | `del obj[key]` | 인덱싱/키로 삭제 |
| `__contains__(self, item)` | `item in obj` | 포함 여부 확인 |
| `__iter__(self)` | `for x in obj` | 반복자 반환 |

```python
class CustomDict:
    def __init__(self):
        self.data = {}
    
    def __setitem__(self, key, value):
        print(f"[{key}] 키에 값 {value} 저장")
        self.data[key] = value
    
    def __getitem__(self, key):
        print(f"[{key}] 키의 값 조회")
        return self.data[key]
    
    def __delitem__(self, key):
        print(f"[{key}] 키 삭제")
        del self.data[key]
    
    def __contains__(self, key):
        exists = key in self.data
        print(f"[{key}] 키 존재 여부 확인: {exists}")
        return exists
    
    def __len__(self):
        return len(self.data)
    
    def __str__(self):
        return str(self.data)

# 사용자 정의 사전 사용 예시
custom_dict = CustomDict()

# __setitem__ 호출
custom_dict["name"] = "홍길동"
custom_dict["age"] = 30

# __getitem__ 호출
print(custom_dict["name"])  # 홍길동

# __contains__ 호출
print("name" in custom_dict)  # True
print("address" in custom_dict)  # False

# __len__ 호출
print(len(custom_dict))  # 2

# __delitem__ 호출
del custom_dict["age"]

print(custom_dict)  # {'name': '홍길동'}
```

### ✅ 5.6.5 객체를 함수처럼 호출하기: __call__

`__call__` 메서드를 구현하면 객체를 함수처럼 호출할 수 있습니다.

```python
class Adder:
    def __init__(self, n):
        self.n = n
    
    def __call__(self, x):
        return self.n + x

# 객체를 함수처럼 사용
add_5 = Adder(5)
print(add_5(10))  # 15 (add_5.__call__(10))
print(add_5(20))  # 25

# 함수형 프로그래밍 활용
numbers = [1, 2, 3, 4, 5]
result = list(map(add_5, numbers))
print(result)  # [6, 7, 8, 9, 10]
```

### ✅ 5.6.6 컨텍스트 관리자: __enter__, __exit__

`with` 문과 함께 사용할 수 있는 컨텍스트 관리자를 구현할 수 있습니다.

```python
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        print(f"{self.filename} 파일 열기")
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"{self.filename} 파일 닫기")
        if self.file:
            self.file.close()
        # 예외 발생 정보 처리
        if exc_type is not None:
            print(f"예외 발생: {exc_val}")
        # True를 반환하면 예외를 억제
        return False

# 컨텍스트 관리자 사용 예시
try:
    # __enter__ 호출
    with FileManager("example.txt", "w") as f:
        f.write("Hello, World!")
        print("파일에 데이터 작성 완료")
    # 블록을 벗어날 때 __exit__ 호출
except Exception as e:
    print(f"오류 발생: {e}") 