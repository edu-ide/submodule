---

# 📘 입출력 및 파일 처리 - 파일 및 디렉터리 관리

## 4.5 파일 및 디렉터리 관리 (os 모듈 활용)

### os 모듈의 주요 기능:
1. **파일 관리**
   - `os.remove()`: 파일 삭제
   - `os.rename()`: 파일 이름 변경
   - `os.path.exists()`: 파일 존재 여부 확인

2. **디렉터리 관리**
   - `os.getcwd()`: 현재 작업 디렉터리 확인
   - `os.chdir()`: 디렉터리 변경
   - `os.mkdir()`: 디렉터리 생성
   - `os.rmdir()`: 디렉터리 삭제

3. **경로 관리**
   - `os.path.join()`: 경로 결합
   - `os.path.split()`: 경로와 파일명 분리
   - `os.path.dirname()`: 디렉터리 경로 추출
   - `os.path.basename()`: 파일명 추출

```python
import os

# 현재 작업 디렉터리 확인
current_dir = os.getcwd()
print(f"현재 디렉터리: {current_dir}")

# 새 디렉터리 생성
if not os.path.exists("new_folder"):
    os.mkdir("new_folder")
    print("새 폴더가 생성되었습니다.")

# 파일 존재 여부 확인 및 삭제
file_path = "data.json"
if os.path.exists(file_path):
    os.remove(file_path)
    print(f"{file_path} 파일이 삭제되었습니다.")

# 경로 다루기
path = os.path.join("new_folder", "test.txt")
print(f"전체 경로: {path}")
print(f"디렉터리: {os.path.dirname(path)}")
print(f"파일명: {os.path.basename(path)}")
``` 