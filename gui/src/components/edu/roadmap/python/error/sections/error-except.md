---

# 📘 에러와 디버깅 - 예외 처리 (try-except)

## 8.2 예외 처리 (try-except)

### ✅ 8.2.1 기본 예외 처리 구문
```python
try:
    # 예외가 발생할 수 있는 코드
except 예외종류:
    # 예외 처리 코드
else:
    # 예외가 발생하지 않았을 때 실행
finally:
    # 항상 실행되는 코드
```

### ✅ 8.2.2 예외 처리 패턴
1. **특정 예외만 처리**
2. **여러 예외 동시 처리**
3. **모든 예외 처리**
4. **예외 정보 활용**

```python
# 1. 특정 예외 처리
def divide_numbers():
    try:
        num1 = int(input("첫 번째 숫자: "))
        num2 = int(input("두 번째 숫자: "))
        result = num1 / num2
        print(f"결과: {result}")
    except ValueError:
        print("숫자를 입력해야 합니다.")
    except ZeroDivisionError:
        print("0으로 나눌 수 없습니다.")

# 2. 여러 예외 동시 처리
def process_list(lst):
    try:
        value = lst[0] + "10"
        return value
    except (IndexError, TypeError) as e:
        return f"오류 발생: {type(e).__name__}"

# 3. 모든 예외 처리
def safe_operation():
    try:
        # 위험한 연산
        pass
    except Exception as e:
        print(f"예상치 못한 오류: {e}")
    finally:
        print("작업 완료")
``` 