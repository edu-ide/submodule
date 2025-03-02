---

# 📘 에러와 디버깅 - 단위 테스트

## 8.6 단위 테스트

### ✅ 8.6.1 테스트 작성 원칙
1. **독립성**: 각 테스트는 독립적으로 실행
2. **반복성**: 동일한 결과 보장
3. **단순성**: 하나의 기능만 테스트
4. **자동화**: 자동으로 실행 가능

```python
import unittest

def calculate_grade(score):
    if not isinstance(score, (int, float)):
        raise TypeError("점수는 숫자여야 합니다")
    if score < 0 or score > 100:
        raise ValueError("점수는 0~100 사이여야 합니다")
    
    if score >= 90: return 'A'
    elif score >= 80: return 'B'
    elif score >= 70: return 'C'
    else: return 'F'

class TestGradeCalculation(unittest.TestCase):
    def test_valid_grades(self):
        self.assertEqual(calculate_grade(95), 'A')
        self.assertEqual(calculate_grade(85), 'B')
        self.assertEqual(calculate_grade(75), 'C')
        self.assertEqual(calculate_grade(65), 'F')
    
    def test_invalid_types(self):
        with self.assertRaises(TypeError):
            calculate_grade("not a number")
    
    def test_out_of_range(self):
        with self.assertRaises(ValueError):
            calculate_grade(-1)
        with self.assertRaises(ValueError):
            calculate_grade(101)

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False) 