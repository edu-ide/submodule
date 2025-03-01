---

# 📘 에러와 디버깅 - 에러(예외)란?

## 8.1 에러(예외)란?

### 에러의 종류:
1. **문법 오류 (Syntax Error)**
   - 코드 작성 규칙 위반
   - 프로그램 실행 전에 발견
   - IDE에서 바로 표시됨

2. **런타임 오류 (Runtime Error)**
   - 프로그램 실행 중 발생
   - 예외 처리로 대응 가능
   - 사용자 입력 등으로 발생

3. **논리 오류 (Logical Error)**
   - 프로그램은 실행되지만 결과가 잘못됨
   - 디버깅이 가장 어려움
   - 단위 테스트로 발견 가능

```python
# 문법 오류 예시
# print("Hello"  # SyntaxError: ')'이 빠짐

# 런타임 오류 예시
try:
    print(10 / 0)  # ZeroDivisionError 발생
except ZeroDivisionError as e:
    print(f"오류 발생: {e}")

# 논리 오류 예시
def calculate_average(numbers):
    return sum(numbers) / len(numbers)  # 빈 리스트일 때 ZeroDivisionError

try:
    print(calculate_average([]))  # 오류 발생
except ZeroDivisionError:
    print("리스트가 비어있습니다.") 