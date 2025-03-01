---

# 📘 입출력 및 파일 처리 - 예외 처리

## 4.3 예외 처리 (try-except)
파일 작업 중 발생할 수 있는 다양한 오류를 안전하게 처리하는 방법을 알아봅시다.

### 주요 예외 유형:
- `FileNotFoundError`: 파일을 찾을 수 없을 때
- `PermissionError`: 파일 접근 권한이 없을 때
- `IOError`: 입출력 작업 중 오류가 발생할 때

### try-except 구문의 기본 구조:
```python
try:
    # 실행할 코드
except 예외유형:
    # 예외 발생 시 실행할 코드
else:
    # 예외가 발생하지 않았을 때 실행할 코드
finally:
    # 항상 실행할 코드
```

```python
# 파일이 없는 경우 예외 처리
try:
    with open("nonexistent.txt", "r") as file:
        content = file.read()
        print(content)
except FileNotFoundError:
    print("파일을 찾을 수 없습니다.")
except PermissionError:
    print("파일 접근 권한이 없습니다.")
finally:
    print("파일 처리를 완료했습니다.") 