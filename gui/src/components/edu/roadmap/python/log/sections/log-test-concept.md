---

# 📘 로깅과 테스트 자동화 - 테스트 자동화 개념

## 9.2 테스트 자동화 개념

### ✅ 9.2.1 테스트 자동화의 이점
1. **품질 향상**
   - 버그 조기 발견
   - 회귀 테스트 용이
   - 일관된 테스트 수행
2. **개발 생산성**
   - 반복 작업 감소
   - 빠른 피드백
   - 리팩토링 안정성
3. **문서화 효과**
   - 코드 동작 방식 이해
   - 사용 예제 제공
   - 요구사항 명세

```python
# 테스트할 클래스 예제
class Calculator:
    def add(self, x, y):
        return x + y
    
    def subtract(self, x, y):
        return x - y
    
    def multiply(self, x, y):
        return x * y
    
    def divide(self, x, y):
        if y == 0:
            raise ValueError("0으로 나눌 수 없습니다")
        return x / y
```

### ✅ 9.2.2 테스트 종류
1. **단위 테스트 (Unit Test)**
   - 개별 함수/메서드 테스트
   - 독립적인 테스트
   - 빠른 실행 속도
2. **통합 테스트 (Integration Test)**
   - 여러 모듈 연동 테스트
   - 실제 환경과 유사
   - 외부 의존성 포함
3. **시스템 테스트 (System Test)**
   - 전체 시스템 테스트
   - 엔드투엔드 테스트
   - 사용자 시나리오 