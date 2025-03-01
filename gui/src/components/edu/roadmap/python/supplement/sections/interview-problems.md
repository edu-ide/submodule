---

# 📘 A.2 고급 파이썬 인터뷰 문제

## ✅ A.2.1 알고리즘 및 자료구조 문제

```python
class InterviewProblems:
    """인터뷰 문제 모음"""
    
    @staticmethod
    def find_missing_number(nums):
        """1부터 n까지의 수에서 빠진 숫자 찾기"""
        n = len(nums) + 1
        expected_sum = n * (n + 1) // 2
        actual_sum = sum(nums)
        return expected_sum - actual_sum
    
    @staticmethod
    def longest_common_prefix(strs):
        """문자열 배열의 가장 긴 공통 접두사 찾기"""
        if not strs:
            return ""
            
        shortest = min(strs, key=len)
        
        for i, char in enumerate(shortest):
            for other in strs:
                if other[i] != char:
                    return shortest[:i]
        return shortest
    
    @staticmethod
    def is_valid_parentheses(s):
        """괄호 유효성 검사"""
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        
        for char in s:
            if char in '({[':
                stack.append(char)
            elif char in ')}]':
                if not stack or stack.pop() != pairs[char]:
                    return False
        
        return len(stack) == 0
```

## ✅ A.2.2 디자인 패턴 문제

```python
class Singleton:
    """싱글톤 패턴 구현"""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

class Observer:
    """옵저버 패턴 구현"""
    def __init__(self):
        self._observers = []
        self._state = None
    
    def attach(self, observer):
        self._observers.append(observer)
    
    def notify(self):
        for observer in self._observers:
            observer.update(self._state)
    
    @property
    def state(self):
        return self._state
    
    @state.setter
    def state(self, value):
        self._state = value
        self.notify()
```

--- 