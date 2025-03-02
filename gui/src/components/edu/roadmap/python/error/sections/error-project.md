---

# 📘 에러와 디버깅 - 실습 문제

## 🎯 8장 실습 문제

### [실습 1] 사용자 입력 예외 처리
사용자로부터 나이를 입력받아 성인 여부를 판단하는 프로그램을 작성하세요.
- 나이는 1~120 사이의 정수여야 함
- 잘못된 입력에 대한 예외 처리 포함
- 로깅을 사용하여 입력값 기록

```python
import logging

logging.basicConfig(level=logging.INFO)

class AgeError(Exception):
    """나이 입력이 잘못된 경우 발생하는 예외"""
    pass

def check_adult(age):
    """나이를 확인하여 성인 여부를 반환하는 함수"""
    try:
        age = int(age)
        if not 1 <= age <= 120:
            raise AgeError("나이는 1~120 사이여야 합니다.")
        logging.info(f"입력된 나이: {age}")
        return age >= 18
    except ValueError:
        raise AgeError("나이는 숫자여야 합니다.")

# 테스트
try:
    age = input("나이를 입력하세요: ")
    if check_adult(age):
        print("성인입니다.")
    else:
        print("미성년자입니다.")
except AgeError as e:
    print(f"오류: {e}")
``` 