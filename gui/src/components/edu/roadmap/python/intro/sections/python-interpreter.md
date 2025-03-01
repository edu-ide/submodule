# 파이썬 인터프리터와 기본 명령어

## ✅ 파이썬 인터프리터 실행하기  
설치가 완료되었다면, **파이썬 인터프리터(Python Shell)**를 실행할 수 있습니다.  

🖥 **Windows**: `cmd(명령 프롬프트)`에서 실행  
🖥 **macOS/Linux**: `Terminal`에서 실행  

```bash
python
```

실행하면 아래와 같은 파이썬 인터프리터 화면이 표시됩니다.  

```python
Python 3.10.4 (default, Apr 19 2023, 18:14:58)
[GCC 11.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

이제 간단한 명령어를 입력해 봅시다!  

## ✅ 기본 명령어 실행
```python
# 기본적인 파이썬 명령어 실행
print("Hello, Python!")  # 문자열 출력

2 + 3  # 덧셈 연산

10 / 2  # 나눗셈 연산

# 변수 선언
name = "Alice"
print(name)
```

**출력:**
```
Hello, Python!
Alice
```

✅ **CMD(명령 프롬프트)에서 실행**  
아래 내용을 `hi.py`로 메모장에 저장 후 실행:

```python
# 파일명 hi.py
print("Hello, Python!")
import sys
print(sys.version)
```

```bash
python hi.py
```

실행 시:
```
Hello, Python!
3.xx.xx
``` 