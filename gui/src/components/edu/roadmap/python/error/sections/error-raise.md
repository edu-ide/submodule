---

# 📘 에러와 디버깅 - 예외 발생 (raise)

## 8.4 예외 발생 (raise)

### ✅ 8.4.1 사용자 정의 예외
- 특정 상황에 맞는 커스텀 예외 생성
- `Exception` 클래스 상속
- 의미 있는 에러 메시지 제공

```python
class InvalidAgeError(Exception):
    """나이가 유효하지 않을 때 발생하는 예외"""
    def __init__(self, age, message="유효하지 않은 나이입니다"):
        self.age = age
        self.message = message
        super().__init__(self.message)

def verify_age(age):
    if not isinstance(age, int):
        raise TypeError("나이는 정수여야 합니다")
    if age < 0 or age > 150:
        raise InvalidAgeError(age)
    return True

# 테스트
try:
    verify_age(200)
except InvalidAgeError as e:
    print(e)
``` 