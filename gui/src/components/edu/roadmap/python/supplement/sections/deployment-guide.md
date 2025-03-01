---

# 📘 A.3 프로젝트 배포 가이드

## ✅ A.3.1 패키지 배포 도구

```python
class PackageDeployer:
    """패키지 배포 도우미"""
    
    def __init__(self, package_name, version):
        self.package_name = package_name
        self.version = version
    
    def create_setup_py(self):
        """setup.py 파일 생성"""
        setup_content = f"""\
from setuptools import setup, find_packages

setup(
    name='{self.package_name}',
    version='{self.version}',
    packages=find_packages(),
    install_requires=[
        'requests>=2.25.1',
        'numpy>=1.19.2',
    ],
    author='Your Name',
    author_email='your.email@example.com',
    description='A sample Python package',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='https://github.com/yourusername/{self.package_name}',
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)"""
        
        with open('setup.py', 'w') as f:
            f.write(setup_content)
    
    def build_package(self):
        """패키지 빌드"""
        try:
            subprocess.run(['python', 'setup.py', 'sdist', 'bdist_wheel'], check=True)
            print("패키지 빌드 완료")
        except subprocess.CalledProcessError as e:
            print(f"패키지 빌드 실패: {e}")
    
    def upload_to_pypi(self):
        """PyPI에 업로드"""
        try:
            subprocess.run(['twine', 'upload', 'dist/*'], check=True)
            print("PyPI 업로드 완료")
        except subprocess.CalledProcessError as e:
            print(f"PyPI 업로드 실패: {e}")
```

--- 