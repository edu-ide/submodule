---

# 📘 1권 3장: 고급 데이터 처리

## 📌 목차

3.1 데이터 구조의 고급 활용  
3.2 collections 모듈  
3.3 함수형 프로그래밍 도구  
3.4 정렬과 검색  
3.5 고급 프로그래밍 기법

## 3.1 데이터 구조의 고급 활용

### ✅ 리스트 컴프리헨션
리스트 컴프리헨션은 리스트를 생성하는 간결한 방법입니다.

기본 문법:
```python
[표현식 for 항목 in 반복가능객체 if 조건문]
```

```python
# 리스트 컴프리헨션 예제
# 1. 기본 형태
squares = [x**2 for x in range(10)]
print("제곱수:", squares)

# 2. 조건문 포함
even_squares = [x**2 for x in range(10) if x % 2 == 0]
print("짝수의 제곱:", even_squares)

# 3. 중첩 반복문
matrix = [(x, y) for x in range(2) for y in range(2)]
print("좌표:", matrix)
```

### ✅ 딕셔너리 컴프리헨션
딕셔너리를 생성하는 간결한 방법입니다.

기본 문법:
```python
{키_표현식: 값_표현식 for 항목 in 반복가능객체 if 조건문}
```

```python
# 딕셔너리 컴프리헨션 예제
# 1. 기본 형태
square_dict = {x: x**2 for x in range(5)}
print("숫자-제곱 매핑:", square_dict)

# 2. 조건문 포함
even_square_dict = {x: x**2 for x in range(5) if x % 2 == 0}
print("짝수-제곱 매핑:", even_square_dict)

# 3. 문자열 처리
word = "hello"
char_count = {char: word.count(char) for char in word}
print("문자 출현 빈도:", char_count)
```

### ✅ 제너레이터 표현식
메모리 효율적인 이터레이터를 생성하는 방법입니다.

기본 문법:
```python
(표현식 for 항목 in 반복가능객체 if 조건문)
```

```python
# 제너레이터 표현식 예제
# 1. 기본 형태
gen = (x**2 for x in range(5))
print("제너레이터 객체:", gen)
print("제너레이터 결과:", list(gen))

# 2. 메모리 사용 비교
import sys

list_comp = [x**2 for x in range(1000)]
gen_exp = (x**2 for x in range(1000))

print("리스트 크기:", sys.getsizeof(list_comp), "bytes")
print("제너레이터 크기:", sys.getsizeof(gen_exp), "bytes")
```

### ✅ 중첩 데이터 구조 처리
복잡한 데이터 구조를 효과적으로 다루는 방법입니다.

```python
# 중첩 데이터 구조 예제
# 1. 중첩 리스트 처리
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# 행렬 전치
transposed = [[row[i] for row in matrix] for i in range(3)]
print("전치 행렬:", transposed)

# 2. 중첩 딕셔너리 처리
students = {
    '김철수': {'국어': 90, '수학': 85, '영어': 88},
    '이영희': {'국어': 92, '수학': 95, '영어': 90}
}

# 각 과목 평균 계산
subject_avg = {}
for subject in ['국어', '수학', '영어']:
    subject_avg[subject] = sum(student[subject] for student in students.values()) / len(students)

print("과목별 평균:", subject_avg)
```

### ✅ 깊은 복사와 얕은 복사
객체의 복사 방법과 그 차이점을 이해합니다.

```python
import copy

# 깊은 복사와 얕은 복사 예제
# 1. 중첩 리스트
original = [[1, 2, 3], [4, 5, 6]]

# 얕은 복사
shallow_copy = original.copy()
shallow_copy[0][0] = 9
print("얕은 복사 후 원본:", original)
print("얕은 복사본:", shallow_copy)

# 깊은 복사
deep_copy = copy.deepcopy(original)
deep_copy[0][0] = 7
print("깊은 복사 후 원본:", original)
print("깊은 복사본:", deep_copy)
```

## 3.2 collections 모듈

collections 모듈은 파이썬의 내장 컨테이너 타입(dict, list, set, tuple)을 확장하는 특수 컨테이너 데이터형을 제공합니다.

### ✅ Counter 클래스
요소의 개수를 세는 딕셔너리 서브클래스입니다.

```python
from collections import Counter

# 1. 기본 카운팅
text = "hello world"
counter = Counter(text)
print("문자 빈도:", counter)

# 2. 가장 흔한 요소 찾기
print("가장 흔한 문자 2개:", counter.most_common(2))

# 3. Counter 산술 연산
c1 = Counter(['a', 'b', 'c', 'a'])
c2 = Counter(['a', 'd', 'e'])
print("Counter 합집합:", c1 + c2)
print("Counter 교집합:", c1 & c2)
```

### ✅ defaultdict 클래스
존재하지 않는 키에 대해 기본값을 자동으로 생성하는 딕셔너리입니다.

```python
from collections import defaultdict

# 1. 기본값 설정
int_dict = defaultdict(int)
int_dict['a'] += 1  # 키가 없어도 오류 발생하지 않음
print("int 기본값:", int_dict)

# 2. 그룹화 활용
words = ['apple', 'banana', 'apple', 'cherry', 'banana']
word_groups = defaultdict(list)

for word in words:
    word_groups[word[0]].append(word)  # 첫 글자로 그룹화

print("\n단어 그룹화:", dict(word_groups))
```

### ✅ OrderedDict 클래스
항목의 순서를 기억하는 딕셔너리입니다. (Python 3.7+ 에서는 일반 dict도 순서 유지)

```python
from collections import OrderedDict

# 1. 순서가 있는 딕셔너리 생성
ordered = OrderedDict()
ordered['a'] = 1
ordered['b'] = 2
ordered['c'] = 3
print("OrderedDict 항목:", ordered)

# 2. 순서 비교
dict1 = OrderedDict({'a': 1, 'b': 2})
dict2 = OrderedDict({'b': 2, 'a': 1})
print("순서가 다른 두 딕셔너리 비교:", dict1 == dict2)  # False
```

### ✅ namedtuple 함수
이름이 있는 필드를 가진 튜플의 서브클래스를 만듭니다.

```python
from collections import namedtuple

# 1. 기본 사용
Point = namedtuple('Point', ['x', 'y'])
p = Point(11, y=22)
print("좌표:", p)
print("x 좌표:", p.x)
print("y 좌표:", p.y)

# 2. 클래스와 유사한 사용
Student = namedtuple('Student', 'name age grade')
s = Student('홍길동', 20, 'A')
print(f"\n학생: {s.name}, {s.age}세, 학점: {s.grade}")
```

### ✅ deque 클래스
양쪽 끝에서 빠르게 추가와 삭제가 가능한 양방향 큐입니다.

```python
from collections import deque

# 1. 기본 사용
d = deque([1, 2, 3])
d.append(4)        # 오른쪽 끝에 추가
d.appendleft(0)    # 왼쪽 끝에 추가
print("deque:", d)

# 2. 회전과 슬라이싱
d.rotate(1)        # 오른쪽으로 1칸 회전
print("회전 후:", d)

# 3. 양방향 처리
d.pop()            # 오른쪽 끝에서 제거
d.popleft()        # 왼쪽 끝에서 제거
print("양쪽 제거 후:", d)
```

### ✅ ChainMap 클래스
여러 딕셔너리나 매핑을 함께 검색할 수 있는 클래스입니다.

```python
from collections import ChainMap

# 1. 다중 매핑
defaults = {'theme': 'default', 'language': 'en', 'user': 'guest'}
user_settings = {'language': 'kr', 'user': 'admin'}

settings = ChainMap(user_settings, defaults)
print("전체 설정:", dict(settings))

# 2. 우선순위 처리
print(f"테마: {settings['theme']}")
print(f"언어: {settings['language']}")
print(f"사용자: {settings['user']}")

# 3. 새로운 매핑 추가
new_settings = settings.new_child({'theme': 'dark'})
print("\n새로운 설정 추가 후:")
print("전체 설정:", dict(new_settings))
```

## 3.3 데이터 처리 함수

### ✅ map() 함수
시퀀스의 각 요소에 함수를 적용합니다.

```python
# map() 예제
numbers = [1, 2, 3, 4, 5]

# 1. 제곱 계산
squares = list(map(lambda x: x**2, numbers))
print("제곱:", squares)

# 2. 문자열 변환
str_numbers = list(map(str, numbers))
print("문자열 변환:", str_numbers)

# 3. 여러 시퀀스 처리
list1 = [1, 2, 3]
list2 = [10, 20, 30]
sums = list(map(lambda x, y: x + y, list1, list2))
print("두 리스트의 합:", sums)
```

### ✅ filter() 함수
시퀀스의 요소 중 조건을 만족하는 것만 선택합니다.

```python
# filter() 예제
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 1. 짝수만 선택
evens = list(filter(lambda x: x % 2 == 0, numbers))
print("짝수:", evens)

# 2. 5보다 큰 수 선택
greater_than_five = list(filter(lambda x: x > 5, numbers))
print("5보다 큰 수:", greater_than_five)

# 3. None이 아닌 값만 선택
mixed = [1, None, 'hello', '', [], False, 0, True]
valid = list(filter(None, mixed))
print("유효한 값:", valid)
```

### ✅ reduce() 함수
시퀀스의 요소들을 순차적으로 처리하여 단일 값으로 줄입니다.

```python
from functools import reduce

# reduce() 예제
numbers = [1, 2, 3, 4, 5]

# 1. 모든 수의 곱
product = reduce(lambda x, y: x * y, numbers)
print("모든 수의 곱:", product)

# 2. 최대값 찾기
max_num = reduce(lambda x, y: x if x > y else y, numbers)
print("최대값:", max_num)

# 3. 문자열 연결
words = ['Hello', ' ', 'World', '!']
sentence = reduce(lambda x, y: x + y, words)
print("문자열 연결:", sentence)
```

### ✅ zip() 함수
여러 시퀀스를 동시에 순회하면서 요소들을 묶어줍니다.

```python
# zip() 예제
names = ['Alice', 'Bob', 'Charlie']
ages = [24, 50, 18]
cities = ['Seoul', 'Busan', 'Incheon']

# 1. 기본 사용
for name, age, city in zip(names, ages, cities):
    print(f"{name} ({age}) lives in {city}")

# 2. 딕셔너리 생성
person_dict = dict(zip(names, ages))
print("\n이름-나이 매핑:", person_dict)

# 3. 리스트로 변환
zipped = list(zip(names, ages, cities))
print("\n튜플 리스트:", zipped)
```

### ✅ enumerate() 함수
시퀀스의 요소와 인덱스를 함께 순회합니다.

```python
# enumerate() 예제
fruits = ['apple', 'banana', 'cherry']

# 1. 기본 사용
print("과일 목록:")
for i, fruit in enumerate(fruits):
    print(f"{i+1}. {fruit}")

# 2. 시작 인덱스 지정
print("\n시작 인덱스 변경:")
for i, fruit in enumerate(fruits, start=100):
    print(f"인덱스 {i}: {fruit}")

# 3. 딕셔너리 생성
fruit_dict = dict(enumerate(fruits))
print("\n인덱스-과일 매핑:", fruit_dict)
```

## 3.4 정렬과 검색

### ✅ sorted()와 sort() 메서드
시퀀스를 정렬하는 두 가지 방법입니다.

```python
# 정렬 예제
numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]

# 1. sorted() - 새로운 리스트 반환
sorted_numbers = sorted(numbers)
print("정렬된 새 리스트:", sorted_numbers)
print("원본 리스트:", numbers)

# 2. sort() - 원본 리스트 수정
numbers.sort()
print("\n원본 리스트 정렬 후:", numbers)

# 3. 내림차순 정렬
desc_numbers = sorted(numbers, reverse=True)
print("내림차순 정렬:", desc_numbers)
```

### ✅ key 함수를 이용한 정렬
정렬 기준을 사용자가 정의할 수 있습니다.

```python
# key 함수 정렬 예제
# 1. 문자열 길이로 정렬
words = ['python', 'java', 'c++', 'javascript', 'rust']
sorted_by_len = sorted(words, key=len)
print("길이순 정렬:", sorted_by_len)

# 2. 딕셔너리 정렬
students = [
    {'name': 'Alice', 'age': 20, 'grade': 'A'},
    {'name': 'Bob', 'age': 19, 'grade': 'B'},
    {'name': 'Charlie', 'age': 22, 'grade': 'A'}
]

# 나이순 정렬
sorted_by_age = sorted(students, key=lambda x: x['age'])
print("\n나이순 정렬:")
for student in sorted_by_age:
    print(f"{student['name']}: {student['age']}세")

# 3. 여러 기준으로 정렬
from operator import itemgetter
sorted_by_grade_age = sorted(students, key=itemgetter('grade', 'age'))
print("\n학점-나이순 정렬:")
for student in sorted_by_grade_age:
    print(f"{student['name']}: {student['grade']}학점, {student['age']}세")
```

### ✅ 이진 검색 (bisect 모듈)
정렬된 시퀀스에서 효율적으로 검색합니다.

```python
import bisect

# 이진 검색 예제
numbers = [1, 3, 5, 7, 9, 11, 13, 15]

# 1. 삽입 위치 찾기
print("정렬된 리스트:", numbers)
x = 6
pos = bisect.bisect(numbers, x)
print(f"\n{x}의 삽입 위치: {pos}")

# 2. 정렬 상태 유지하며 삽입
bisect.insort(numbers, x)
print(f"{x} 삽입 후:", numbers)

# 3. 이진 검색 활용
def find_closest(numbers, x):
    pos = bisect.bisect_left(numbers, x)
    if pos == 0:
        return numbers[0]
    if pos == len(numbers):
        return numbers[-1]
    before = numbers[pos - 1]
    after = numbers[pos]
    return before if x - before <= after - x else after

target = 8
closest = find_closest(numbers, target)
print(f"\n{target}에 가장 가까운 값: {closest}")
```

## 3.5 고급 프로그래밍 기법

### ✅ 컨텍스트 관리자
리소스의 획득과 반환을 자동으로 처리하는 with 문과 컨텍스트 관리자를 살펴봅니다.

```python
# 1. 기본적인 파일 처리
with open('example.txt', 'w') as f:
    f.write('Hello, World!')

# 2. 커스텀 컨텍스트 관리자
from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.time()
    yield
    end = time.time()
    print(f'실행 시간: {end - start:.2f}초')

# 사용 예시
with timer():
    # 시간을 측정할 코드
    sum(range(1000000))
```

### ✅ 제너레이터와 이터레이터
메모리를 효율적으로 사용하는 제너레이터와 이터레이터의 고급 활용법을 알아봅니다.

```python
# 1. 제너레이터 함수
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 2. 이터레이터 프로토콜
class CountDown:
    def __init__(self, start):
        self.start = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.start <= 0:
            raise StopIteration
        self.start -= 1
        return self.start + 1

# 사용 예시
for num in fibonacci(5):
    print(num)

for num in CountDown(3):
    print(num)
```

### ✅ 데코레이터
함수와 클래스의 기능을 수정하거나 확장하는 데코레이터를 학습합니다.

```python
# 1. 함수 데코레이터
def logging_decorator(func):
    def wrapper(*args, **kwargs):
        print(f'함수 {func.__name__} 실행 시작')
        result = func(*args, **kwargs)
        print(f'함수 {func.__name__} 실행 완료')
        return result
    return wrapper

@logging_decorator
def greet(name):
    return f'Hello, {name}!'

# 2. 클래스 데코레이터
def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance
```

### ✅ 메모리 관리
대용량 데이터 처리와 메모리 최적화 기법을 다룹니다.

```python
# 1. 대용량 파일 처리
def process_large_file(filename):
    with open(filename) as f:
        for line in f:  # 한 줄씩 처리
            yield line.strip()

# 2. 캐싱 기법
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

### ✅ 병렬 처리
멀티프로세싱과 스레딩을 통한 병렬 처리 방법을 학습합니다.

```python
# 1. 멀티프로세싱
from multiprocessing import Pool

def process_data(x):
    return x * x

if __name__ == '__main__':
    with Pool(4) as p:
        result = p.map(process_data, range(10))

# 2. 스레딩
import threading
import queue

def worker(q):
    while True:
        item = q.get()
        if item is None:
            break
        # 작업 처리
        q.task_done()

# 3. 비동기 처리
import asyncio

async def async_task(name):
    print(f'Task {name} starting')
    await asyncio.sleep(1)
    print(f'Task {name} completed')

async def main():
    await asyncio.gather(
        async_task('A'),
        async_task('B')
    )
```

## 🎯 실습 문제

### 1. 버블 정렬 구현하기

다음 리스트를 버블 정렬로 정렬하는 프로그램을 작성하세요: `[64, 34, 25, 12, 22, 11, 90]`

요구사항:
1. `bubble_sort()` 함수를 구현하세요.
2. 각 패스마다 정렬 과정을 출력하세요.
   - 예: "패스 1: [34, 25, 12, 22, 11, 64, 90]"
3. 각 패스에서 발생한 교환 횟수를 출력하세요.
4. 최종 정렬된 결과와 총 교환 횟수를 출력하세요.

```python
def bubble_sort(arr):
    n = len(arr)
    total_swaps = 0
    
    for i in range(n):
        swaps = 0
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swaps += 1
        total_swaps += swaps
        print(f"패스 {i+1}: {arr} (교환: {swaps}회)")
        if swaps == 0:  # 교환이 없으면 이미 정렬된 상태
            break
    return arr, total_swaps

# 테스트
numbers = [64, 34, 25, 12, 22, 11, 90]
print("원본 리스트:", numbers)
sorted_numbers, total_swaps = bubble_sort(numbers.copy())
print(f"\n최종 결과: {sorted_numbers}")
print(f"총 교환 횟수: {total_swaps}회")
```

### 2. 고급 이진 탐색 구현하기

정렬된 리스트에서 특정 값의 모든 출현을 찾는 이진 탐색 프로그램을 작성하세요.
리스트: `[1, 2, 2, 2, 3, 4, 4, 5, 5, 6]`

요구사항:
1. `binary_search_range()` 함수를 구현하세요.
2. 찾고자 하는 값의 첫 번째와 마지막 위치를 반환하세요.
3. 검색 과정의 각 단계를 자세히 출력하세요.
   - 현재 검색 범위
   - 중간 값
   - 검색 방향
4. 값이 없는 경우 적절한 메시지를 출력하세요.

```python
def binary_search_range(arr, target):
    def find_bound(is_first):
        left, right = 0, len(arr) - 1
        bound = -1
        step = 1
        
        while left <= right:
            mid = (left + right) // 2
            print(f"단계 {step}: 범위[{left}-{right}], 중간값={arr[mid]}", end="")
            
            if arr[mid] == target:
                bound = mid
                if is_first:
                    right = mid - 1
                    print(", 왼쪽으로 이동")
                else:
                    left = mid + 1
                    print(", 오른쪽으로 이동")
            elif arr[mid] < target:
                left = mid + 1
                print(", 오른쪽으로 이동")
            else:
                right = mid - 1
                print(", 왼쪽으로 이동")
            step += 1
        return bound
    
    print(f"찾을 값: {target}")
    print("첫 번째 위치 찾기...")
    first = find_bound(True)
    if first == -1:
        return None
    
    print("\n마지막 위치 찾기...")
    last = find_bound(False)
    
    return first, last

# 테스트
numbers = [1, 2, 2, 2, 3, 4, 4, 5, 5, 6]
print(f"리스트: {numbers}\n")

result = binary_search_range(numbers, 2)
if result:
    first, last = result
    print(f"\n2는 인덱스 {first}부터 {last}까지 존재합니다.")
    print(f"총 출현 횟수: {last - first + 1}")
else:
    print("\n값을 찾을 수 없습니다.")
```

### 3. 고급 데코레이터 구현하기

함수의 실행을 모니터링하는 다기능 데코레이터를 만드세요.

요구사항:
1. 다음 정보를 기록하는 데코레이터를 구현하세요:
   - 함수 이름
   - 실행 시작/종료 시간
   - 실행 소요 시간
   - 입력 매개변수
   - 반환값
   - 메모리 사용량
2. 로그를 파일로 저장하는 기능을 추가하세요.
3. 에러 발생 시 에러 정보도 기록하세요.
4. 데코레이터에 매개변수를 추가하여 기록할 정보를 선택할 수 있게 하세요.

```python
import time
import psutil
import logging
from functools import wraps
from datetime import datetime

def monitor(log_params=True, log_memory=True, filename=None):
    if filename:
        logging.basicConfig(filename=filename, level=logging.INFO,
                          format='%(asctime)s - %(message)s')
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            start_memory = psutil.Process().memory_info().rss / 1024  # KB
            
            # 시작 정보 기록
            log_msg = f"함수 '{func.__name__}' 실행 시작\n"
            
            # 매개변수 기록
            if log_params:
                params = f"args: {args}, kwargs: {kwargs}"
                log_msg += f"매개변수: {params}\n"
            
            try:
                # 함수 실행
                result = func(*args, **kwargs)
                
                # 실행 정보 기록
                end_time = time.time()
                execution_time = end_time - start_time
                
                if log_memory:
                    end_memory = psutil.Process().memory_info().rss / 1024
                    memory_used = end_memory - start_memory
                    log_msg += f"메모리 사용량: {memory_used:.2f} KB\n"
                
                log_msg += f"실행 시간: {execution_time:.2f}초\n"
                log_msg += f"반환값: {result}\n"
                
                if filename:
                    logging.info(log_msg)
                else:
                    print(log_msg)
                    
                return result
                
            except Exception as e:
                error_msg = f"에러 발생: {str(e)}\n"
                if filename:
                    logging.error(error_msg)
                else:
                    print(error_msg)
                raise
                
        return wrapper
    return decorator

# 테스트
@monitor(log_params=True, log_memory=True)
def process_numbers(numbers):
    time.sleep(1)  # 실행 시간 시뮬레이션
    return [x * 2 for x in numbers]

# 함수 실행
result = process_numbers([1, 2, 3, 4, 5])
```

### 4. 고성능 소수 생성기 구현하기

에라토스테네스의 체를 사용하여 효율적인 소수 생성기를 구현하세요.

요구사항:
1. 다음 기능을 구현하세요:
   - 에라토스테네스의 체 알고리즘
   - 제너레이터를 사용한 메모리 효율적인 구현
   - 성능 측정 (시간, 메모리 사용량)
2. 다음 정보를 출력하세요:
   - 주어진 범위 내의 모든 소수
   - 소수의 개수
   - 가장 큰 소수
   - 실행 시간
   - 메모리 사용량
3. 큰 범위(예: 1,000,000)에서도 효율적으로 동작해야 합니다.

```python
import time
import psutil
import math

class PrimeGenerator:
    def __init__(self, limit):
        self.limit = limit
        self.prime_count = 0
        self.largest_prime = 0
        self.start_memory = psutil.Process().memory_info().rss
        self.start_time = time.time()
    
    def sieve_of_eratosthenes(self):
        sieve = [True] * (self.limit + 1)
        sieve[0] = sieve[1] = False
        
        for i in range(2, int(math.sqrt(self.limit)) + 1):
            if sieve[i]:
                for j in range(i * i, self.limit + 1, i):
                    sieve[j] = False
        
        for i in range(2, self.limit + 1):
            if sieve[i]:
                self.prime_count += 1
                self.largest_prime = i
                yield i
    
    def get_statistics(self):
        end_time = time.time()
        end_memory = psutil.Process().memory_info().rss
        
        return {
            'execution_time': end_time - self.start_time,
            'memory_used': (end_memory - self.start_memory) / 1024,
            'prime_count': self.prime_count,
            'largest_prime': self.largest_prime
        }

# 실행 함수
def run_prime_generator(limit):
    print(f"범위: 1 ~ {limit}")
    print("처리 중...")
    
    generator = PrimeGenerator(limit)
    primes = list(generator.sieve_of_eratosthenes())
    stats = generator.get_statistics()
    
    print(f"\n소수 목록: {', '.join(map(str, primes[:10]))}")
    if len(primes) > 10:
        print(f"... 외 {len(primes)-10}개")
    
    print(f"\n소수 개수: {stats['prime_count']}개")
    print(f"가장 큰 소수: {stats['largest_prime']}")
    print(f"실행 시간: {stats['execution_time']:.2f}초")
    print(f"메모리 사용량: {stats['memory_used']:.2f} KB")

# 직접 실행
if __name__ == "__main__":
    print("소수 생성기 테스트\n")
    
    # 다양한 범위로 테스트
    for limit in [100, 1000, 10000]:
        print("\n" + "="*50)
        run_prime_generator(limit)
```

## 📌 3장 요약
✅ 리스트(List): 순서가 있는 데이터 저장, 수정 가능  
✅ 튜플(Tuple): 순서가 있지만 수정 불가능  
✅ 딕셔너리(Dictionary): 키-값 쌍으로 저장하며 키를 이용해 데이터 검색  
✅ 집합(Set): 중복 없는 데이터 저장, 순서 없음  
✅ 리스트 컴프리헨션을 사용하면 간결한 코드 작성 가능

---