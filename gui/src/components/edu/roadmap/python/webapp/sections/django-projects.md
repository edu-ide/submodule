---

# 📘 13.3 Django 웹 프로젝트 구축

Django는 "완전한 기능을 갖춘" 파이썬 웹 프레임워크로, 대규모 프로젝트를 빠르게 개발할 수 있는 다양한 기능을 제공합니다.

## ✅ 13.3.1 Django MTV 패턴

Django는 Model-Template-View(MTV) 패턴을 기반으로 합니다:

- **Model**: 데이터베이스 구조와 비즈니스 로직
- **Template**: 사용자에게 보여지는 UI 부분
- **View**: HTTP 요청을 처리하고 모델과 템플릿을 연결하는 로직

이는 일반적인 MVC 패턴과 유사하지만, 컨트롤러의 역할을 Django 프레임워크 자체가 담당합니다.

## ✅ 13.3.2 Django 프로젝트 구조

Django 프로젝트의 일반적인 구조는 다음과 같습니다:

```
myproject/
├── manage.py               # 프로젝트 관리 명령어 도구
├── myproject/              # 프로젝트 설정 패키지
│   ├── __init__.py
│   ├── settings.py         # 프로젝트 설정
│   ├── urls.py             # URL 라우팅
│   ├── asgi.py             # ASGI 배포
│   └── wsgi.py             # WSGI 배포
└── myapp/                  # 애플리케이션 패키지
    ├── __init__.py
    ├── admin.py            # 관리자 인터페이스
    ├── apps.py             # 앱 설정
    ├── migrations/         # 데이터베이스 마이그레이션
    ├── models.py           # 데이터 모델
    ├── tests.py            # 테스트
    ├── views.py            # 뷰 로직
    └── templates/          # HTML 템플릿
        └── myapp/
            └── index.html
```

## ✅ 13.3.3 Django 모델 정의

Django ORM을 사용한 모델 정의:

```python
# myapp/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Category(models.Model):
    """블로그 카테고리 모델"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class BlogPost(models.Model):
    """블로그 포스트 모델"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def publish(self):
        """포스트 게시"""
        self.published = True
        self.published_at = timezone.now()
        self.save()
```

## ✅ 13.3.4 Django 뷰 구현

Django에서 뷰를 구현하는 다양한 방법:

### 함수 기반 뷰(FBV)

```python
# myapp/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import BlogPost, Category
from .forms import BlogPostForm

def home(request):
    """홈페이지 뷰"""
    posts = BlogPost.objects.filter(published=True)
    categories = Category.objects.all()
    return render(request, 'myapp/home.html', {'posts': posts, 'categories': categories})

def post_detail(request, slug):
    """포스트 상세 뷰"""
    post = get_object_or_404(BlogPost, slug=slug, published=True)
    return render(request, 'myapp/post_detail.html', {'post': post})

@login_required
def post_create(request):
    """포스트 작성 뷰"""
    if request.method == 'POST':
        form = BlogPostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            return redirect('post_detail', slug=post.slug)
    else:
        form = BlogPostForm()
    return render(request, 'myapp/post_form.html', {'form': form})
```

### 클래스 기반 뷰(CBV)

```python
# myapp/views.py
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from .models import BlogPost

class BlogListView(ListView):
    """블로그 목록 뷰"""
    model = BlogPost
    template_name = 'myapp/home.html'
    context_object_name = 'posts'
    
    def get_queryset(self):
        return BlogPost.objects.filter(published=True)

class BlogDetailView(DetailView):
    """블로그 상세 뷰"""
    model = BlogPost
    template_name = 'myapp/post_detail.html'
    context_object_name = 'post'
    slug_url_kwarg = 'slug'

class BlogCreateView(LoginRequiredMixin, CreateView):
    """블로그 작성 뷰"""
    model = BlogPost
    template_name = 'myapp/post_form.html'
    fields = ['title', 'slug', 'content', 'category']
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('post_detail', kwargs={'slug': self.object.slug})
```

## ✅ 13.3.5 Django 템플릿

Django의 템플릿 시스템 활용:

```html
<!-- myapp/templates/myapp/base.html -->
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}Django 블로그{% endblock %}</title>
    {% load static %}
    <link rel="stylesheet" href="{% static 'css/style.css' %}">
</head>
<body>
    <header>
        <h1>Django 블로그</h1>
        <nav>
            <a href="{% url 'home' %}">홈</a>
            {% if user.is_authenticated %}
                <a href="{% url 'post_create' %}">글쓰기</a>
                <a href="{% url 'logout' %}">로그아웃</a>
            {% else %}
                <a href="{% url 'login' %}">로그인</a>
                <a href="{% url 'register' %}">회원가입</a>
            {% endif %}
        </nav>
    </header>
    
    <main>
        {% if messages %}
            <div class="messages">
                {% for message in messages %}
                    <div class="message {{ message.tags }}">{{ message }}</div>
                {% endfor %}
            </div>
        {% endif %}
        
        {% block content %}{% endblock %}
    </main>
    
    <footer>
        <p>&copy; 2023 Django 블로그</p>
    </footer>
</body>
</html>
```

## ✅ 13.3.6 Django 폼

Django 폼 시스템을 활용한 데이터 검증 및 처리:

```python
# myapp/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import BlogPost, Comment

class BlogPostForm(forms.ModelForm):
    """포스트 작성 폼"""
    class Meta:
        model = BlogPost
        fields = ['title', 'slug', 'content', 'category']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'slug': forms.TextInput(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
        }

class CommentForm(forms.ModelForm):
    """댓글 작성 폼"""
    class Meta:
        model = Comment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class CustomUserCreationForm(UserCreationForm):
    """회원가입 폼"""
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user
```

## ✅ 13.3.7 Django 관리자 인터페이스

Django의 강력한 관리자 인터페이스 커스터마이징:

```python
# myapp/admin.py
from django.contrib import admin
from .models import Category, BlogPost, Comment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """카테고리 관리자 설정"""
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    """블로그 포스트 관리자 설정"""
    list_display = ('title', 'author', 'category', 'created_at', 'published')
    list_filter = ('published', 'created_at', 'category')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'
    actions = ['publish_posts', 'unpublish_posts']
    
    def publish_posts(self, request, queryset):
        """선택된 포스트 게시"""
        queryset.update(published=True)
    publish_posts.short_description = "선택된 포스트 게시하기"
    
    def unpublish_posts(self, request, queryset):
        """선택된 포스트 게시 취소"""
        queryset.update(published=False)
    unpublish_posts.short_description = "선택된 포스트 게시 취소하기"
```

## ✅ 13.3.8 Django URL 라우팅

URL 패턴 정의 및 관리:

```python
# myproject/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

```python
# myapp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.BlogListView.as_view(), name='home'),
    path('post/<slug:slug>/', views.BlogDetailView.as_view(), name='post_detail'),
    path('post/new/', views.BlogCreateView.as_view(), name='post_create'),
    path('post/<slug:slug>/edit/', views.BlogUpdateView.as_view(), name='post_update'),
    path('post/<slug:slug>/delete/', views.BlogDeleteView.as_view(), name='post_delete'),
    path('category/<slug:category_slug>/', views.category_posts, name='category_posts'),
]
```

## ✅ 13.3.9 Django 미들웨어

Django 미들웨어를 활용한 요청/응답 처리:

```python
# myapp/middleware.py
import time
from django.utils.deprecation import MiddlewareMixin
from django.db import connection

class ResponseTimeMiddleware(MiddlewareMixin):
    """응답 시간 측정 미들웨어"""
    def process_request(self, request):
        request.start_time = time.time()
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            response_time = time.time() - request.start_time
            response['X-Response-Time'] = f"{response_time:.2f}s"
        return response

class SQLCountMiddleware(MiddlewareMixin):
    """SQL 쿼리 개수 측정 미들웨어"""
    def process_response(self, request, response):
        if settings.DEBUG:
            response['X-SQL-Count'] = len(connection.queries)
        return response
```

```python
# myproject/settings.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'myapp.middleware.ResponseTimeMiddleware',  # 커스텀 미들웨어
    'myapp.middleware.SQLCountMiddleware',      # 커스텀 미들웨어
]
```

--- 