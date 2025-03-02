---

# 📘 2권 6장: 머신러닝과 딥러닝 입문

## 📌 목차
16.1 머신러닝 개념 및 기본 원리  
16.2 scikit-learn을 사용한 머신러닝  
16.3 딥러닝 기초  
16.4 TensorFlow와 PyTorch 활용  

## 16.1 머신러닝의 핵심 개념

### ✅ 16.1.1 머신러닝의 종류
1. **지도 학습**
   - 분류(Classification)
   - 회귀(Regression)
2. **비지도 학습**
   - 군집화(Clustering)
   - 차원 축소(Dimensionality Reduction)
3. **강화 학습**
   - 보상 기반 학습
   - 환경과 상호작용

### ✅ 16.1.2 머신러닝 프로세스
1. 데이터 수집 및 전처리
2. 모델 선택 및 학습
3. 평가 및 최적화
4. 예측 및 배포

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

class MLProject:
    """머신러닝 프로젝트 기본 클래스"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = None
        
    def prepare_data(self, X, y, test_size=0.2):
        """데이터 전처리 및 분할"""
        # 데이터 분할
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # 특성 스케일링
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        return X_train_scaled, X_test_scaled, y_train, y_test
```

## 16.2 머신러닝 모델 구현

### ✅ 16.2.1 분류 모델 구현

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

class ClassificationModel(MLProject):
    """분류 모델 클래스"""
    
    def __init__(self):
        super().__init__()
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
    
    def train(self, X_train, y_train):
        """모델 학습"""
        self.model.fit(X_train, y_train)
    
    def evaluate(self, X_test, y_test):
        """모델 평가"""
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred)
        
        print(f"모델 정확도: {accuracy:.4f}")
        print("\n분류 보고서:")
        print(report)
        
        return accuracy, report
```

### ✅ 16.2.2 회귀 모델 구현

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

class RegressionModel(MLProject):
    """회귀 모델 클래스"""
    
    def __init__(self):
        super().__init__()
        self.model = LinearRegression()
    
    def train(self, X_train, y_train):
        """모델 학습"""
        self.model.fit(X_train, y_train)
    
    def evaluate(self, X_test, y_test):
        """모델 평가"""
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"평균 제곱 오차: {mse:.4f}")
        print(f"R² 점수: {r2:.4f}")
        
        return mse, r2
```

## 16.3 딥러닝 모델 구현

### ✅ 16.3.1 TensorFlow를 사용한 신경망

```python
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout

class DeepLearningModel:
    """딥러닝 모델 클래스"""
    
    def __init__(self, input_dim, num_classes):
        self.model = Sequential([
            Dense(64, activation='relu', input_dim=input_dim),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dropout(0.2),
            Dense(num_classes, activation='softmax')
        ])
        
        self.model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
    
    def train(self, X_train, y_train, epochs=10, batch_size=32):
        """모델 학습"""
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            verbose=1
        )
        return history
    
    def evaluate(self, X_test, y_test):
        """모델 평가"""
        loss, accuracy = self.model.evaluate(X_test, y_test, verbose=0)
        print(f"테스트 손실: {loss:.4f}")
        print(f"테스트 정확도: {accuracy:.4f}")
        return loss, accuracy
```

## 🎯 실습 프로젝트: 종합 머신러닝 시스템

```python
def run_ml_project():
    """종합 머신러닝 프로젝트 실행"""
    # 데이터 생성
    from sklearn.datasets import make_classification
    X, y = make_classification(
        n_samples=1000,
        n_features=20,
        n_classes=2,
        random_state=42
    )
    
    # 분류 모델
    print("=== 분류 모델 학습 ===")
    clf = ClassificationModel()
    X_train, X_test, y_train, y_test = clf.prepare_data(X, y)
    clf.train(X_train, y_train)
    clf.evaluate(X_test, y_test)
    
    # 딥러닝 모델
    print("\n=== 딥러닝 모델 학습 ===")
    dl_model = DeepLearningModel(input_dim=20, num_classes=2)
    dl_model.train(X_train, y_train)
    dl_model.evaluate(X_test, y_test)

if __name__ == '__main__':
    run_ml_project()
```

---