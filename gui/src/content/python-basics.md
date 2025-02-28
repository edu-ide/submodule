# 기본 문법
## 파이썬 프로그래밍의 기초

## 변수와 데이터 타입
```python
name = "Python"
age = 30
print(type(name))  # <class 'str'>
print(type(age))   # <class 'int'>
```

## 조건문
```python
if age > 18:
    print("성인입니다")
elif age > 13:
    print("청소년입니다")
else:
    print("어린이입니다")
```

## 반복문
```python
for i in range(5):
    print(i)  # 0-4 출력

count = 0
while count < 5:
    print(count)
    count += 1
```

---
**📚 학습 리소스**
- [파이썬 공식 튜토리얼](https://docs.python.org/ko/3/tutorial/index.html)
- [점프 투 파이썬](https://wikidocs.net/book/1)

**🏆 도전 과제**
- 구구단 출력: 중첩 반복문으로 2-9단 출력
- 소수 판별기: 입력받은 숫자가 소수인지 판별 