---

# 📘 로깅과 테스트 자동화 - 로그 레벨

## 9.1 로깅(logging) 개념 및 사용법 (계속)

### ✅ 9.1.2 로그 레벨 상세 설명
| 레벨      | 값  | 사용 시점                     |
|-----------|-----|-------------------------------|
| DEBUG     | 10  | 상세한 정보, 문제 해결용      |
| INFO      | 20  | 정상 동작 확인용             |
| WARNING   | 30  | 잠재적 문제 경고             |
| ERROR     | 40  | 오류 발생, 기능 동작 실패     |
| CRITICAL  | 50  | 시스템 중단 수준의 심각한 문제 |

```python
import logging

# 로거 생성 및 레벨 설정
logger = logging.getLogger('level_example')
logger.setLevel(logging.DEBUG)

# 핸들러 추가
handler = logging.StreamHandler()
handler.setLevel(logging.DEBUG)

# 포맷터 설정
formatter = logging.Formatter('%(levelname)s: %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# 다양한 레벨의 로그 메시지 출력
logger.debug("디버깅 정보: 변수값 확인")
logger.info("정보: 작업이 성공적으로 완료됨")
logger.warning("경고: 디스크 공간이 부족함")
logger.error("오류: 데이터베이스 연결 실패")
logger.critical("심각: 시스템 다운, 즉시 조치 필요")
``` 