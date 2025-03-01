---

# 📘 로깅과 테스트 자동화 - unittest 단위 테스트

## 9.3 unittest를 사용한 단위 테스트

### ✅ 9.3.1 unittest 프레임워크 개요
1. **TestCase 클래스**
   - 테스트의 기본 단위
   - 테스트 메서드 그룹화
   - 설정/정리 메서드 제공
2. **테스트 메서드**
   - `test_`로 시작하는 메서드
   - 하나의 기능 검증
   - 명확한 이름 사용
3. **어서션 메서드**
   - `assertEqual` - 값이 같은지 확인
   - `assertTrue` - 조건이 참인지 확인
   - `assertRaises` - 예외 발생 확인

```python
import unittest

class TestCalculator(unittest.TestCase):
    def setUp(self):
        """각 테스트 전에 실행"""
        self.calc = Calculator()
    
    def test_add(self):
        """덧셈 테스트"""
        self.assertEqual(self.calc.add(2, 3), 5)
        self.assertEqual(self.calc.add(-1, 1), 0)
        self.assertEqual(self.calc.add(0, 0), 0)
    
    def test_divide(self):
        """나눗셈 테스트"""
        self.assertEqual(self.calc.divide(6, 2), 3)
        self.assertEqual(self.calc.divide(5, 2), 2.5)
        
        # 예외 테스트
        with self.assertRaises(ValueError):
            self.calc.divide(10, 0)

# 테스트 실행
if __name__ == '__main__':
    unittest.main()
```

### ✅ 9.3.2 테스트 실행 및 결과 해석
1. **테스트 실행 방법**
   - 모듈로 직접 실행: `python test_module.py`
   - unittest로 실행: `python -m unittest test_module.py`
   - 디스커버리 모드: `python -m unittest discover -s tests`
2. **결과 해석**
   - `.` - 테스트 성공
   - `F` - 테스트 실패 (어서션 오류)
   - `E` - 테스트 중 예외 발생
   - 통계 요약 (실행된 테스트, 실패, 오류) 