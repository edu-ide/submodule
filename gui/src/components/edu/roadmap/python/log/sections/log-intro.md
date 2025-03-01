---

# 📘 로깅과 테스트 자동화 - 로깅 개념

## 9.1 로깅(logging) 개념 및 사용법

### ✅ 9.1.1 로깅의 중요성
1. **디버깅 용이성**
   - 실시간 문제 추적
   - 오류 원인 분석
   - 성능 모니터링
2. **운영 관리**
   - 시스템 상태 모니터링
   - 보안 감사
   - 사용자 행동 분석
3. **규정 준수**
   - 감사 추적
   - 데이터 변경 이력
   - 접근 기록

```python
import logging

# 로깅 기본 설정
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def process_data(data):
    """데이터 처리 함수 예시"""
    logger.debug(f"데이터 처리 시작: {data}")
    try:
        result = data * 2
        logger.info(f"처리 완료: {result}")
        return result
    except Exception as e:
        logger.error(f"처리 중 오류 발생: {e}", exc_info=True)
        raise 