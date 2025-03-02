---

# 📘 10.5 성능 모니터링

## ✅ 10.5.1 시스템 리소스 모니터링

파이썬 애플리케이션의 시스템 리소스 사용량을 모니터링하는 방법을 알아봅니다.

```python
import psutil
import time

def monitor_system_resources(duration=10, interval=1):
    """
    시스템 리소스 사용량을 모니터링합니다.
    
    Args:
        duration: 모니터링 기간(초)
        interval: 측정 간격(초)
    """
    # 현재 프로세스 가져오기
    process = psutil.Process()
    
    # 모니터링 데이터 초기화
    monitoring_data = {
        'cpu_percent': [],
        'memory_percent': [],
        'io_counters': [],
        'timestamp': []
    }
    
    # 지정된 기간 동안 모니터링
    start_time = time.time()
    while time.time() - start_time < duration:
        # CPU 사용량
        cpu_percent = process.cpu_percent(interval=0.1)
        
        # 메모리 사용량
        memory_info = process.memory_info()
        memory_percent = process.memory_percent()
        
        # I/O 카운터
        io_counters = process.io_counters() if hasattr(process, 'io_counters') else None
        
        # 데이터 저장
        monitoring_data['cpu_percent'].append(cpu_percent)
        monitoring_data['memory_percent'].append(memory_percent)
        monitoring_data['io_counters'].append(io_counters)
        monitoring_data['timestamp'].append(time.time() - start_time)
        
        # 간격 대기
        time.sleep(interval)
    
    return monitoring_data
```

## ✅ 10.5.2 애플리케이션 로깅과 모니터링

로깅을 통한 성능 모니터링과 문제 추적 방법을 소개합니다.

```python
import logging
import time
from functools import wraps

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='app_performance.log'
)

logger = logging.getLogger('performance_monitor')

def log_execution_time(func):
    """함수 실행 시간을 로깅하는 데코레이터"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        # 실행 시간 로깅
        execution_time = end_time - start_time
        logger.info(f"함수 {func.__name__} 실행 시간: {execution_time:.6f}초")
        
        return result
    return wrapper

@log_execution_time
def example_function(n):
    """예제 함수"""
    total = 0
    for i in range(n):
        total += i * i
    return total

# 실행 예제
if __name__ == "__main__":
    example_function(1000000)
```

## ✅ 10.5.3 시각화 도구 활용

성능 데이터를 시각화하여 분석하는 방법을 배웁니다.

```python
import matplotlib.pyplot as plt
import numpy as np
import time

def visualize_performance_data(monitoring_data):
    """성능 모니터링 데이터 시각화"""
    # 플롯 설정
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))
    
    # CPU 사용량 그래프
    ax1.plot(monitoring_data['timestamp'], monitoring_data['cpu_percent'], 'b-', label='CPU 사용량 (%)')
    ax1.set_title('CPU 사용량 시간 추이')
    ax1.set_xlabel('시간 (초)')
    ax1.set_ylabel('CPU 사용량 (%)')
    ax1.grid(True)
    ax1.legend()
    
    # 메모리 사용량 그래프
    ax2.plot(monitoring_data['timestamp'], monitoring_data['memory_percent'], 'r-', label='메모리 사용량 (%)')
    ax2.set_title('메모리 사용량 시간 추이')
    ax2.set_xlabel('시간 (초)')
    ax2.set_ylabel('메모리 사용량 (%)')
    ax2.grid(True)
    ax2.legend()
    
    plt.tight_layout()
    plt.savefig('performance_monitoring.png')
    plt.show()
    
    return fig

# 성능 데이터 수집 및 시각화 예제
def example_cpu_intensive_task():
    """CPU 집약적 작업 예제"""
    # 모니터링 시작
    monitoring_data = {
        'cpu_percent': [],
        'memory_percent': [],
        'io_counters': [],
        'timestamp': []
    }
    
    start_time = time.time()
    process = psutil.Process()
    
    # 데이터 수집 시작
    for i in range(50):
        # CPU 작업 실행
        _ = [i * i for i in range(1000000)]
        
        # 현재 리소스 사용량 측정
        monitoring_data['cpu_percent'].append(process.cpu_percent())
        monitoring_data['memory_percent'].append(process.memory_percent())
        monitoring_data['io_counters'].append(None)
        monitoring_data['timestamp'].append(time.time() - start_time)
        
        time.sleep(0.1)
    
    # 데이터 시각화
    visualize_performance_data(monitoring_data)
```

## ✅ 10.5.4 지속적인 성능 모니터링 설정

프로덕션 환경에서의 지속적인 성능 모니터링 방법과 도구를 소개합니다.

1. **외부 모니터링 도구 통합**
   - Prometheus, Grafana, New Relic 등의 도구 활용 방법
   - 대시보드 구성 및 알림 설정

2. **핵심 성능 지표(KPI) 설정**
   - 응답 시간, 처리량, 오류율, 리소스 사용량 등 모니터링
   - 성능 기준선(baseline) 설정 및 편차 추적

3. **로그 분석 시스템 구축**
   - ELK 스택(Elasticsearch, Logstash, Kibana) 활용
   - 성능 관련 이벤트 추적 및 패턴 분석

```python
# Prometheus 클라이언트 예제
from prometheus_client import start_http_server, Summary, Counter, Gauge
import random
import time

# 메트릭 정의
REQUEST_TIME = Summary('request_processing_seconds', '요청 처리 시간')
REQUEST_COUNTER = Counter('request_count', '총 요청 수')
ACTIVE_REQUESTS = Gauge('active_requests', '현재 활성 요청 수')

@REQUEST_TIME.time()
def process_request():
    """요청 처리 시뮬레이션"""
    ACTIVE_REQUESTS.inc()
    REQUEST_COUNTER.inc()
    
    # 요청 처리 시뮬레이션
    time.sleep(random.uniform(0.1, 0.5))
    
    ACTIVE_REQUESTS.dec()

# 메트릭 서버 시작
def start_metrics_server():
    """Prometheus 메트릭 서버 시작"""
    # 9090 포트에서 HTTP 서버 시작
    start_http_server(9090)
    
    # 요청 시뮬레이션
    while True:
        process_request()
        time.sleep(random.uniform(0.1, 0.3))

if __name__ == '__main__':
    start_metrics_server()
```

--- 