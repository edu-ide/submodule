---

# 📘 에러와 디버깅 - 디버깅 기법

## 8.5 디버깅 기법

### ✅ 8.5.1 디버깅 도구
1. **`print()` 함수**
   - 간단한 값 확인
   - 코드 흐름 추적
2. **`logging` 모듈**
   - 다양한 로그 레벨
   - 파일 저장 가능
3. **`pdb` 디버거**
   - 대화형 디버깅
   - 중단점 설정

```python
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='app.log'
)

def complex_calculation(x, y):
    logging.debug(f"입력값: x={x}, y={y}")
    
    try:
        result = x / y
        logging.info(f"계산 결과: {result}")
        return result
    except Exception as e:
        logging.error(f"오류 발생: {e}")
        raise 