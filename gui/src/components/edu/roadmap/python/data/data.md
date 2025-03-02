아래는 제공된 JSON 문서를 마크다운 형식으로 변환한 결과입니다. 원문의 구조와 내용을 충실히 반영하여 제목, 코드 블록, 표 등을 마크다운 문법에 맞게 작성했습니다.

---

# 📘 1권 1부 3장: 데이터 구조

## 📌 목차  
3.1 리스트(List)와 튜플(Tuple)  
3.2 딕셔너리(Dictionary)와 집합(Set)  
3.3 리스트 컴프리헨션  
3.4 데이터 구조 활용하기  

## 3.1 리스트(List)와 튜플(Tuple)
### ✅ 리스트 (List)란?
리스트는 여러 개의 데이터를 순서대로 저장하는 자료구조입니다.

- 리스트는 **대괄호 []**를 사용하여 생성합니다.
- 리스트 안에는 숫자, 문자열, 리스트, 튜플 등 다양한 타입을 저장할 수 있습니다.
- 인덱스를 사용하여 데이터에 접근 가능합니다. (0부터 시작)

```python
# 리스트 생성
fruits = ["apple", "banana", "cherry"]

# 리스트 출력
print(fruits)

# 리스트 요소 접근 (인덱스 사용)
print(fruits[0])  # apple
print(fruits[1])  # banana
print(fruits[2])  # cherry
```

### ✅ 리스트 주요 기능
✔ 리스트 요소 추가 (`append()`, `insert()`)  
✔ 리스트 요소 제거 (`remove()`, `pop()`)  
✔ 리스트 정렬 및 뒤집기 (`sort()`, `reverse()`)

```python
numbers = [3, 1, 4, 2, 5]

# 요소 추가
numbers.append(6)  # 리스트 끝에 추가
numbers.insert(1, 10)  # 인덱스 1에 10 추가

# 요소 제거
numbers.remove(4)  # 값 4를 삭제
last_value = numbers.pop()  # 마지막 요소 삭제 후 반환

# 정렬 및 뒤집기
numbers.sort()  # 오름차순 정렬
numbers.reverse()  # 리스트 뒤집기

print(numbers)  # [10, 5, 3, 2, 1]
```

### ✅ 튜플 (Tuple)란?
튜플은 변경할 수 없는(immutable) 데이터 구조입니다.

- 튜플은 **소괄호 ()**를 사용하여 생성합니다.
- 리스트와 달리, 한 번 저장하면 값을 변경할 수 없습니다.
- 읽기 전용 데이터(변경할 필요 없는 데이터)를 저장할 때 사용됩니다.

```python
# 튜플 생성
colors = ("red", "green", "blue")

# 요소 접근 (인덱스 사용)
print(colors[0])  # red
print(colors[1])  # green

# 튜플은 요소 변경이 불가능
# colors[0] = "yellow"  # TypeError 발생!
```

## 3.2 딕셔너리(Dictionary)와 집합(Set)
### ✅ 딕셔너리 (Dictionary)란?
딕셔너리는 키(key)와 값(value)의 쌍으로 데이터를 저장하는 자료구조입니다.

- 딕셔너리는 **중괄호 {}**를 사용하여 생성합니다.
- 데이터의 순서가 아닌 고유한 키를 기준으로 저장됩니다.
- 키를 사용하여 데이터를 빠르게 조회할 수 있습니다.

```python
# 딕셔너리 생성
person = {
    "name": "Alice",
    "age": 25,
    "city": "Seoul"
}

# 딕셔너리 요소 접근
print(person["name"])  # Alice
print(person["age"])   # 25

# 요소 추가 및 수정
person["job"] = "Engineer"  # 새 키 추가
person["age"] = 26  # 값 수정

# 요소 삭제
del person["city"]

print(person)
```

### ✅ 집합 (Set)이란?
집합(Set)은 중복 없는 데이터를 저장하는 자료구조입니다.

- **중괄호 {}**를 사용하여 생성합니다.
- 중복된 요소를 자동으로 제거합니다.
- 순서가 없으며, 인덱스를 사용해 접근할 수 없습니다.

```python
# 집합 생성
numbers = {1, 2, 3, 3, 2, 1, 4, 5}
print(numbers)  # 중복이 자동 제거됨

# 요소 추가 및 제거
numbers.add(6)
numbers.remove(4)

print(numbers)
```

## 3.3 리스트 컴프리헨션
리스트 컴프리헨션은 간결하게 리스트를 생성하는 방법입니다.

```python
# 일반적인 리스트 생성 방식
squares = []
for i in range(1, 6):
    squares.append(i ** 2)

# 리스트 컴프리헨션 방식
squares_comp = [i ** 2 for i in range(1, 6)]

print(squares)  # [1, 4, 9, 16, 25]
print(squares_comp)  # [1, 4, 9, 16, 25]
```

## 3.4 데이터 구조 활용하기
### ✅ 리스트에서 특정 값 찾기

```python
numbers = [10, 20, 30, 40, 50]
if 30 in numbers:
    print("30이 리스트에 포함되어 있습니다.")
```

### ✅ 딕셔너리에서 키와 값 조회하기

```python
person = {"name": "Alice", "age": 25, "city": "Seoul"}

# 키 확인
print(person.keys())  # dict_keys(['name', 'age', 'city'])

# 값 확인
print(person.values())  # dict_values(['Alice', 25, 'Seoul'])

# 키-값 쌍 조회
print(person.items())  # dict_items([('name', 'Alice'), ('age', 25), ('city', 'Seoul')])
```

## 📌 3장 요약
✅ 리스트(List): 순서가 있는 데이터 저장, 수정 가능  
✅ 튜플(Tuple): 순서가 있지만 수정 불가능  
✅ 딕셔너리(Dictionary): 키-값 쌍으로 저장하며 키를 이용해 데이터 검색  
✅ 집합(Set): 중복 없는 데이터 저장, 순서 없음  
✅ 리스트 컴프리헨션을 사용하면 간결한 코드 작성 가능

---

마크다운 형식으로 변환하면서 원문의 모든 내용을 정확히 반영했습니다. 추가 수정이나 보완이 필요하면 말씀해주세요!