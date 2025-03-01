---

# 📘 13.5 OAuth 및 사용자 인증 처리

웹 애플리케이션과 API에서 사용자 인증과 권한 부여는 보안의 핵심 요소입니다. 이 섹션에서는 다양한 인증 방식과 OAuth를 활용한 소셜 로그인 구현 방법을 살펴봅니다.

## ✅ 13.5.1 기본 인증 방식

웹 애플리케이션에서 사용되는 주요 인증 방식:

1. **세션 기반 인증**: 서버 측에서 세션을 유지하고 쿠키로 세션 ID를 전달
2. **토큰 기반 인증**: JWT(JSON Web Token)와 같은 토큰을 사용
3. **API 키**: API 요청 시 키를 통한 인증
4. **OAuth/OAuth2**: 타사 서비스를 통한 인증 위임
5. **OpenID Connect**: OAuth2 기반 신원 확인 프로토콜

## ✅ 13.5.2 Django에서의 사용자 인증

Django의 내장 인증 시스템 활용:

```python
# myproject/settings.py
INSTALLED_APPS = [
    # ...
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    # ...
]

# 인증 백엔드 설정
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'myapp.auth_backends.EmailBackend',  # 이메일 인증 커스텀 백엔드
]

# 로그인/로그아웃 설정
LOGIN_REDIRECT_URL = 'home'
LOGOUT_REDIRECT_URL = 'home'
LOGIN_URL = 'login'
```

```python
# myapp/urls.py
from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # ...
    path('login/', auth_views.LoginView.as_view(template_name='myapp/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('password-reset/', auth_views.PasswordResetView.as_view(template_name='myapp/password_reset.html'), name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='myapp/password_reset_done.html'), name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='myapp/password_reset_confirm.html'), name='password_reset_confirm'),
    path('password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(template_name='myapp/password_reset_complete.html'), name='password_reset_complete'),
    path('register/', views.register, name='register'),
    # ...
]
```

```python
# myapp/views.py
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import UserRegisterForm

def register(request):
    """사용자 등록 뷰"""
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'{username}님 계정이 생성되었습니다! 이제 로그인할 수 있습니다.')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'myapp/register.html', {'form': form})
```

```python
# myapp/forms.py
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

class UserRegisterForm(UserCreationForm):
    """확장된 사용자 등록 폼"""
    email = forms.EmailField()
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
```

## ✅ 13.5.3 Django REST Framework에서의 토큰 인증

DRF에서 토큰 기반 인증 구현:

```python
# myproject/settings.py
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework.authtoken',
    # ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}
```

```python
# myapp/views.py
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

class CustomAuthToken(ObtainAuthToken):
    """커스텀 토큰 획득 뷰"""
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })
```

```python
# myapp/urls.py
from django.urls import path
from .views import CustomAuthToken

urlpatterns = [
    # ...
    path('api/token/', CustomAuthToken.as_view(), name='api_token_auth'),
    # ...
]
```

## ✅ 13.5.4 JWT 인증

JSON Web Token을 사용한 인증 구현:

```python
# requirements.txt
djangorestframework-simplejwt==5.2.2
```

```python
# myproject/settings.py
INSTALLED_APPS = [
    # ...
    'rest_framework',
    # ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# JWT 설정
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}
```

```python
# myapp/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    # ...
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    # ...
]
```

## ✅ 13.5.5 OAuth2 및 소셜 로그인

Django에서 OAuth2를 활용한 소셜 로그인 구현:

```python
# requirements.txt
django-allauth==0.54.0
```

```python
# myproject/settings.py
INSTALLED_APPS = [
    # ...
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.github',
    # ...
]

MIDDLEWARE = [
    # ...
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # ...
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

SITE_ID = 1

# django-allauth 설정
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'

# 소셜 계정 제공자 설정
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': 'your-client-id',
            'secret': 'your-secret-key',
            'key': ''
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    },
    'github': {
        'APP': {
            'client_id': 'your-client-id',
            'secret': 'your-secret-key',
            'key': ''
        },
        'SCOPE': [
            'user',
            'repo',
        ],
    }
}
```

```python
# myproject/urls.py
from django.urls import path, include

urlpatterns = [
    # ...
    path('accounts/', include('allauth.urls')),
    # ...
]
```

소셜 로그인 템플릿 예제:

```html
<!-- myapp/templates/myapp/login.html -->
{% extends 'myapp/base.html' %}

{% block content %}
<div class="login-container">
    <h2>로그인</h2>
    
    <!-- 일반 로그인 폼 -->
    <form method="post">
        {% csrf_token %}
        {{ form.as_p }}
        <button type="submit">로그인</button>
    </form>
    
    <div class="social-login">
        <p>소셜 계정으로 로그인:</p>
        <a href="{% url 'socialaccount_signup' %}?next={{ request.path }}" class="btn-social btn-google">
            Google로 로그인
        </a>
        <a href="{% url 'socialaccount_signup' %}?next={{ request.path }}" class="btn-social btn-github">
            GitHub로 로그인
        </a>
    </div>
    
    <div class="links">
        <a href="{% url 'password_reset' %}">비밀번호를 잊으셨나요?</a>
        <a href="{% url 'register' %}">계정이 없으신가요? 회원가입</a>
    </div>
</div>
{% endblock %}
```

## ✅ 13.5.6 OAuth2 클라이언트 구현

파이썬에서 OAuth2 클라이언트 구현:

```python
# oauth_client.py
import requests
from requests_oauthlib import OAuth2Session
from flask import Flask, request, redirect, session, url_for
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# OAuth2 설정
client_id = "your-client-id"
client_secret = "your-client-secret"
authorization_base_url = "https://accounts.google.com/o/oauth2/auth"
token_url = "https://accounts.google.com/o/oauth2/token"
redirect_uri = "http://localhost:5000/callback"

@app.route("/")
def home():
    """홈페이지"""
    return '<a href="/login">Google로 로그인</a>'

@app.route("/login")
def login():
    """Google OAuth2 로그인 시작"""
    google = OAuth2Session(client_id, redirect_uri=redirect_uri,
                          scope=["openid", "email", "profile"])
    authorization_url, state = google.authorization_url(authorization_base_url)
    
    # 상태 저장
    session["oauth_state"] = state
    return redirect(authorization_url)

@app.route("/callback")
def callback():
    """OAuth2 콜백 처리"""
    google = OAuth2Session(client_id, state=session["oauth_state"], redirect_uri=redirect_uri)
    token = google.fetch_token(token_url, client_secret=client_secret,
                             authorization_response=request.url)
    
    # 토큰 저장
    session["oauth_token"] = token
    
    # 사용자 정보 가져오기
    user_info = google.get("https://www.googleapis.com/oauth2/v1/userinfo").json()
    return f"""
    <h1>로그인 성공!</h1>
    <p>이름: {user_info.get('name')}</p>
    <p>이메일: {user_info.get('email')}</p>
    <img src="{user_info.get('picture')}" alt="프로필 사진">
    <a href="/logout">로그아웃</a>
    """

@app.route("/logout")
def logout():
    """로그아웃"""
    session.clear()
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True)
```

## ✅ 13.5.7 OAuth2 서버 구현

파이썬에서 OAuth2 제공자(서버) 구현:

```python
# requirements.txt
django-oauth-toolkit==2.2.0
```

```python
# myproject/settings.py
INSTALLED_APPS = [
    # ...
    'oauth2_provider',
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    # ...
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

# CORS 설정
CORS_ORIGIN_ALLOW_ALL = False
CORS_ORIGIN_WHITELIST = (
    'http://localhost:3000',  # React 프론트엔드
)

# OAuth2 설정
OAUTH2_PROVIDER = {
    'SCOPES': {'read': 'Read scope', 'write': 'Write scope'},
    'ACCESS_TOKEN_EXPIRE_SECONDS': 3600,  # 1시간
    'REFRESH_TOKEN_EXPIRE_SECONDS': 86400,  # 1일
}
```

```python
# myproject/urls.py
from django.urls import path, include

urlpatterns = [
    # ...
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    # ...
]
```

```python
# myapp/views.py
from django.http import JsonResponse
from oauth2_provider.views.generic import ProtectedResourceView

class ApiEndpoint(ProtectedResourceView):
    """보호된 API 엔드포인트"""
    def get(self, request, *args, **kwargs):
        user = request.user
        return JsonResponse({
            'id': user.id,
            'username': user.username,
            'email': user.email,
        })
```

## ✅ 13.5.8 보안 모범 사례

웹 애플리케이션과 API 인증에서의 보안 모범 사례:

1. **HTTPS 사용**: 모든 인증 및 API 통신은 HTTPS를 통해 이루어져야 함
2. **토큰 보안**: JWT 같은 토큰은 안전하게 저장하고 전송해야 함
3. **CSRF 보호**: 세션 기반 인증에서는 CSRF 토큰을 구현해야 함
4. **비밀번호 보안**:
   - 강력한 비밀번호 정책 시행
   - 비밀번호는 반드시 해시하여 저장 (Django의 기본 기능)
   - 비밀번호 재설정 메커니즘 구현
5. **요청 비율 제한**: 무차별 대입 공격 방지를 위한 로그인 시도 제한
6. **권한 분리**: 인증(Authentication)과 권한 부여(Authorization) 명확히 구분
7. **세션 관리**: 적절한 세션 만료 시간 설정 및 안전한 쿠키 관리

```python
# Django에서 요청 비율 제한 설정 예제
# requirements.txt
django-ratelimit==4.0.0
```

```python
# myapp/views.py
from django.http import HttpResponse
from ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m')  # IP당 분당 5회 제한
def login_view(request):
    """요청 비율 제한이 적용된 로그인 뷰"""
    if request.method == 'POST':
        # 로그인 로직
        pass
    return render(request, 'myapp/login.html')

@ratelimit(key='user', rate='100/d')  # 사용자별 하루 100회 제한
def api_view(request):
    """요청 비율 제한이 적용된 API 뷰"""
    return JsonResponse({'data': 'some data'})
```

--- 