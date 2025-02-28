# 테스트
## 코드 신뢰성 보장

## unittest 예제
```python
import unittest

class TestMath(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1+1, 2)

if __name__ == '__main__':
    unittest.main()
```

---
**📚 학습 리소스**
- [파이썬 테스트 - Real Python](https://realpython.com/python-testing/)

**🏆 도전 과제**
- 계산기 모듈에 대한 단위 테스트 작성 