---

# 📘 객체 지향 프로그래밍 - 개념 소개

## 5.1 객체 지향 프로그래밍이란?

객체 지향 프로그래밍(OOP, Object-Oriented Programming)은 데이터(속성)와 기능(메서드)을 하나의 객체로 묶어 사용하는 프로그래밍 방식입니다.

### ✅ 5.1.1 OOP의 주요 특징

1. **코드 구조화**
   - 관련 데이터와 기능을 하나의 단위로 관리
   - 재사용성과 유지보수성 향상
   - 대규모 소프트웨어 개발에 적합

2. **다양한 언어 지원**
   - C++, Java, Python 등 많은 프로그래밍 언어에서 지원
   - 각 언어마다 OOP 구현 방식에 차이가 있음
   - Python은 간결하고 직관적인 OOP 문법 제공

3. **실제 세계 모델링**
   - 현실 세계의 개체를 프로그래밍 객체로 표현
   - 복잡한 문제를 객체 간의 상호작용으로 해결
   - 직관적인 설계 가능

### ✅ 5.1.2 절차적 프로그래밍과의 차이점

| 절차적 프로그래밍 | 객체 지향 프로그래밍 |
|-------------------|----------------------|
| 함수 중심 | 객체(클래스) 중심 |
| 데이터와 함수가 분리됨 | 데이터와 함수가 하나의 객체로 결합 |
| 함수 호출 방식으로 코드 실행 | 객체 간의 메시지 전달 방식으로 코드 실행 |
| 상속 개념 없음 | 상속을 통한 코드 재사용 |

```python
# 절차적 프로그래밍 예시
def calculate_rectangle_area(width, height):
    return width * height

def calculate_rectangle_perimeter(width, height):
    return 2 * (width + height)

# 사용 예시
width = 10
height = 5
area = calculate_rectangle_area(width, height)
perimeter = calculate_rectangle_perimeter(width, height)
print(f"면적: {area}, 둘레: {perimeter}")

# 객체 지향 프로그래밍 예시
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def calculate_area(self):
        return self.width * self.height
    
    def calculate_perimeter(self):
        return 2 * (self.width + self.height)

# 사용 예시
rectangle = Rectangle(10, 5)
print(f"면적: {rectangle.calculate_area()}, 둘레: {rectangle.calculate_perimeter()}") 