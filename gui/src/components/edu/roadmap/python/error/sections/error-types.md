# 📘 에러와 디버깅 - 자주 발생하는 예외 종류

## 8.3 자주 발생하는 예외 종류

### ✅ 8.3.1 주요 예외 클래스
1. **ValueError**: 부적절한 값
2. **TypeError**: 부적절한 타입
3. **IndexError**: 인덱스 범위 초과
4. **KeyError**: 존재하지 않는 키
5. **FileNotFoundError**: 파일 없음
6. **AttributeError**: 존재하지 않는 속성
7. **ImportError**: 모듈 임포트 실패

```python
def demonstrate_exceptions():
    # ValueError
    try:
        int("abc")
    except ValueError as e:
        print(f"ValueError: {e}")
    
    # TypeError
    try:
        "123" + 456
    except TypeError as e:
        print(f"TypeError: {e}")
    
    # IndexError
    try:
        [1, 2, 3][10]
    except IndexError as e:
        print(f"IndexError: {e}")
    
    # KeyError
    try:
        {"a": 1}["b"]
    except KeyError as e:
        print(f"KeyError: {e}")
```