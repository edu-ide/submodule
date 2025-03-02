---

# 📘 2권 2장: 데이터 분석 및 시각화

## 📌 목차
12.1 데이터 분석 개념 및 기초  
12.2 numpy와 pandas를 사용한 데이터 처리  
12.3 matplotlib과 seaborn을 사용한 데이터 시각화  
12.4 plotly를 활용한 대화형 그래프 제작  

## 12.1 데이터 분석 개념 및 기초

### ✅ 12.1.1 데이터 분석의 단계
1. **데이터 수집**
   - 웹 크롤링
   - API 활용
   - 데이터베이스 조회
2. **데이터 전처리**
   - 결측값 처리
   - 이상치 제거
   - 데이터 정규화
3. **데이터 분석**
   - 기술 통계
   - 상관 분석
   - 가설 검정
4. **결과 시각화**
   - 그래프 작성
   - 대시보드 구성
   - 보고서 작성

```python
import numpy as np
import pandas as pd

# 기본 데이터 분석 클래스
class DataAnalyzer:
    def __init__(self, data):
        self.data = data
        self.df = pd.DataFrame(data)
    
    def basic_statistics(self):
        """기본 통계 분석"""
        stats = {
            'mean': np.mean(self.data),
            'median': np.median(self.data),
            'std': np.std(self.data),
            'min': np.min(self.data),
            'max': np.max(self.data)
        }
        return stats
    
    def check_missing_values(self):
        """결측값 확인"""
        return self.df.isnull().sum()
    
    def detect_outliers(self, column, threshold=3):
        """이상치 탐지 (Z-score 방법)"""
        z_scores = np.abs((self.df[column] - self.df[column].mean()) / self.df[column].std())
        return self.df[z_scores > threshold]
```

## 12.2 numpy와 pandas를 사용한 데이터 처리

### ✅ 12.2.1 numpy 고급 기능
1. **다차원 배열 연산**
2. **브로드캐스팅**
3. **행렬 연산**

```python
import numpy as np

# 다차원 배열 생성
arr_2d = np.array([[1, 2, 3], [4, 5, 6]])
arr_3d = np.array([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])

# 행렬 연산
matrix_a = np.array([[1, 2], [3, 4]])
matrix_b = np.array([[5, 6], [7, 8]])

# 행렬 곱
matrix_product = np.dot(matrix_a, matrix_b)

# 전치 행렬
transposed = matrix_a.T
```

## 12.3 matplotlib과 seaborn을 사용한 데이터 시각화

### ✅ 12.3.1 고급 시각화 기법

```python
import matplotlib.pyplot as plt
import seaborn as sns

class AdvancedVisualizer:
    def __init__(self, data):
        self.df = pd.DataFrame(data)
        self.setup_style()
    
    def setup_style(self):
        """시각화 스타일 설정"""
        plt.style.use('seaborn')
        sns.set_palette("husl")
    
    def create_subplots(self, num_plots=2):
        """여러 그래프 동시 표시"""
        fig, axes = plt.subplots(1, num_plots, figsize=(15, 5))
        return fig, axes
    
    def plot_distribution(self, column):
        """분포 시각화"""
        fig, (ax1, ax2) = self.create_subplots()
        
        # 히스토그램
        sns.histplot(data=self.df, x=column, ax=ax1)
        ax1.set_title(f'{column} 분포')
        
        # 박스플롯
        sns.boxplot(data=self.df, y=column, ax=ax2)
        ax2.set_title(f'{column} 박스플롯')
        
        plt.tight_layout()
        return fig
```

## 12.4 plotly를 활용한 대화형 그래프

### ✅ 12.4.1 대화형 시각화 구현

```python
import plotly.express as px
import plotly.graph_objects as go

class InteractiveVisualizer:
    def __init__(self, data):
        self.df = pd.DataFrame(data)
    
    def create_line_plot(self, x, y, title="대화형 선 그래프"):
        """대화형 선 그래프 생성"""
        fig = px.line(self.df, x=x, y=y, title=title)
        fig.update_layout(hovermode='x unified')
        return fig
    
    def create_scatter_plot(self, x, y, color=None, size=None):
        """대화형 산점도 생성"""
        fig = px.scatter(self.df, x=x, y=y, color=color, size=size,
                        title="대화형 산점도")
        return fig
    
    def create_dashboard(self):
        """대화형 대시보드 생성"""
        fig = go.Figure()
        
        # 여러 트레이스 추가
        for column in self.df.select_dtypes(include=[np.number]).columns:
            fig.add_trace(go.Scatter(
                x=self.df.index,
                y=self.df[column],
                name=column,
                mode='lines+markers'
            ))
        
        fig.update_layout(
            title="데이터 대시보드",
            xaxis_title="인덱스",
            yaxis_title="값",
            hovermode='x unified'
        )
        
        return fig
```

## 🎯 실습 프로젝트

### [실습 1] 데이터 분석 및 시각화 프로젝트

```python
def analyze_sales_data():
    """판매 데이터 분석 프로젝트"""
    # 샘플 데이터 생성
    data = {
        'date': pd.date_range('2023-01-01', '2023-12-31', freq='D'),
        'sales': np.random.normal(1000, 100, 365),
        'category': np.random.choice(['A', 'B', 'C'], 365)
    }
    df = pd.DataFrame(data)
    
    # 1. 기본 통계 분석
    print("기본 통계 정보:")
    print(df['sales'].describe())
    
    # 2. 시계열 그래프 생성
    plt.figure(figsize=(15, 5))
    plt.plot(df['date'], df['sales'])
    plt.title('일별 매출 추이')
    plt.xlabel('날짜')
    plt.ylabel('매출')
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    # 3. 카테고리별 분석
    category_stats = df.groupby('category')['sales'].agg(['mean', 'std'])
    print("\n카테고리별 통계:")
    print(category_stats)
    
    # 4. 대화형 그래프 생성
    fig = px.box(df, x='category', y='sales', title='카테고리별 매출 분포')
    fig.show()
    
    return df
```

### [실습 2] 고급 시각화 프로젝트

```python
def create_advanced_visualization(df):
    """고급 시각화 프로젝트"""
    # 1. Seaborn을 사용한 고급 시각화
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # 히스토그램
    sns.histplot(data=df, x='sales', ax=axes[0,0])
    axes[0,0].set_title('매출 분포')
    
    # 박스플롯
    sns.boxplot(data=df, x='category', y='sales', ax=axes[0,1])
    axes[0,1].set_title('카테고리별 매출')
    
    # 바이올린 플롯
    sns.violinplot(data=df, x='category', y='sales', ax=axes[1,0])
    axes[1,0].set_title('카테고리별 매출 분포')
    
    # 시계열 플롯
    sns.lineplot(data=df, x='date', y='sales', hue='category', ax=axes[1,1])
    axes[1,1].set_title('카테고리별 매출 추이')
    axes[1,1].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    
    # 2. Plotly를 사용한 대화형 대시보드
    fig = px.scatter(df, x='date', y='sales', color='category',
                     title='매출 대시보드')
    fig.show()
    
    return fig
```

---