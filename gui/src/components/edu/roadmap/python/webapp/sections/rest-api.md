---

# 📘 13.4 REST API 개발 및 테스트

REST API는 현대 웹과 모바일 애플리케이션 개발에서 필수적인 요소입니다. 이 섹션에서는 파이썬 프레임워크를 사용하여 RESTful API를 개발하고 테스트하는 방법을 살펴봅니다.

## ✅ 13.4.1 API 엔드포인트 설계

효과적인 API 설계는 명확한 엔드포인트 구조에서 시작합니다:

- **GET /api/posts/**: 포스트 목록 조회
- **POST /api/posts/**: 새 포스트 생성
- **GET /api/posts/{id}/**: 특정 포스트 조회
- **PUT /api/posts/{id}/**: 포스트 수정
- **DELETE /api/posts/{id}/**: 포스트 삭제

## ✅ 13.4.2 Django REST Framework (DRF)

Django REST Framework는 Django 기반 API 개발을 위한 강력한 도구입니다:

```python
# requirements.txt
Django==4.2.0
djangorestframework==3.14.0
```

```python
# myproject/settings.py
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework.authtoken',  # 토큰 인증 사용 시
    # ...
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

## ✅ 13.4.3 직렬화 (Serializers)

API를 통해 데이터를 주고받을 때 직렬화가 필요합니다:

```python
# myapp/serializers.py
from rest_framework import serializers
from .models import BlogPost, Category, Comment

class CategorySerializer(serializers.ModelSerializer):
    """카테고리 시리얼라이저"""
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class CommentSerializer(serializers.ModelSerializer):
    """댓글 시리얼라이저"""
    author_username = serializers.ReadOnlyField(source='author.username')
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_at', 'author_username']
        read_only_fields = ['author']

class BlogPostSerializer(serializers.ModelSerializer):
    """블로그 포스트 시리얼라이저"""
    author_username = serializers.ReadOnlyField(source='author.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'author_username',
            'category', 'category_name', 'created_at', 'updated_at',
            'published', 'comments'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']
```

## ✅ 13.4.4 뷰셋과 라우터

Django REST Framework의 뷰셋과 라우터를 사용하면 CRUD 작업을 쉽게 구현할 수 있습니다:

```python
# myapp/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import BlogPost, Category, Comment
from .serializers import BlogPostSerializer, CategorySerializer, CommentSerializer
from .permissions import IsAuthorOrReadOnly

class BlogPostViewSet(viewsets.ModelViewSet):
    """블로그 포스트 API 뷰셋"""
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    
    def perform_create(self, serializer):
        """생성 시 현재 사용자를 저자로 설정"""
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, slug=None):
        """포스트 게시 액션"""
        post = self.get_object()
        post.publish()
        return Response({'status': 'post published'})
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, slug=None):
        """댓글 추가 액션"""
        post = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
```

```python
# myapp/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.BlogPostViewSet)
router.register(r'categories', views.CategoryViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
```

## ✅ 13.4.5 커스텀 권한 클래스

API 권한을 세밀하게 제어하기 위한 커스텀 권한 클래스:

```python
# myapp/permissions.py
from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    객체의 저자만 편집 가능하도록 하는 권한
    """
    def has_object_permission(self, request, view, obj):
        # 읽기 권한은 모든 요청에 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 쓰기 권한은 객체의 저자에게만 허용
        return obj.author == request.user
```

## ✅ 13.4.6 필터링 및 검색

API 응답을 필터링하고 검색하는 기능 구현:

```python
# myapp/views.py
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

class BlogPostViewSet(viewsets.ModelViewSet):
    # ...
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'published']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
```

## ✅ 13.4.7 API 문서화

Swagger/OpenAPI를 사용한 API 문서 자동 생성:

```python
# requirements.txt
drf-yasg==1.21.4
```

```python
# myproject/settings.py
INSTALLED_APPS = [
    # ...
    'drf_yasg',
    # ...
]
```

```python
# myproject/urls.py
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Blog API",
        default_version='v1',
        description="Blog API documentation",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # ...
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # ...
]
```

## ✅ 13.4.8 API 테스트

Django REST Framework API 테스트 방법:

```python
# myapp/tests.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import BlogPost, Category

class BlogPostTests(APITestCase):
    """BlogPost API 테스트"""
    
    def setUp(self):
        """테스트 데이터 설정"""
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.login(username='testuser', password='testpass')
        
        self.category = Category.objects.create(name='Test Category', slug='test-category')
        
        # 샘플 블로그 포스트 생성
        self.post = BlogPost.objects.create(
            title='Test Post',
            slug='test-post',
            content='Test content',
            author=self.user,
            category=self.category
        )
        
        self.list_url = reverse('blogpost-list')
        self.detail_url = reverse('blogpost-detail', kwargs={'slug': self.post.slug})
    
    def test_list_posts(self):
        """포스트 목록 조회 테스트"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_post(self):
        """포스트 생성 테스트"""
        data = {
            'title': 'New Post',
            'slug': 'new-post',
            'content': 'New content',
            'category': self.category.id
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BlogPost.objects.count(), 2)
    
    def test_update_post(self):
        """포스트 수정 테스트"""
        data = {'title': 'Updated Title'}
        response = self.client.patch(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, 'Updated Title')
    
    def test_delete_post(self):
        """포스트 삭제 테스트"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(BlogPost.objects.count(), 0)
```

## ✅ 13.4.9 Flask에서의 REST API

Flask와 Flask-RESTful을 사용한 API 개발:

```python
# app.py
from flask import Flask, request, jsonify
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)
api = Api(app)

# 모델 정의
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    def __repr__(self):
        return f"Post('{self.title}')"

# 스키마 정의
class PostSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Post
        load_instance = True

post_schema = PostSchema()
posts_schema = PostSchema(many=True)

# API 리소스 정의
class PostListResource(Resource):
    def get(self):
        """모든 포스트 조회"""
        posts = Post.query.all()
        return posts_schema.dump(posts)
    
    def post(self):
        """새 포스트 생성"""
        parser = reqparse.RequestParser()
        parser.add_argument('title', required=True)
        parser.add_argument('content', required=True)
        args = parser.parse_args()
        
        new_post = Post(title=args['title'], content=args['content'])
        db.session.add(new_post)
        db.session.commit()
        return post_schema.dump(new_post), 201

class PostResource(Resource):
    def get(self, post_id):
        """특정 포스트 조회"""
        post = Post.query.get_or_404(post_id)
        return post_schema.dump(post)
    
    def put(self, post_id):
        """포스트 수정"""
        post = Post.query.get_or_404(post_id)
        parser = reqparse.RequestParser()
        parser.add_argument('title')
        parser.add_argument('content')
        args = parser.parse_args()
        
        if args['title']:
            post.title = args['title']
        if args['content']:
            post.content = args['content']
        
        db.session.commit()
        return post_schema.dump(post)
    
    def delete(self, post_id):
        """포스트 삭제"""
        post = Post.query.get_or_404(post_id)
        db.session.delete(post)
        db.session.commit()
        return '', 204

# API 라우트 등록
api.add_resource(PostListResource, '/api/posts')
api.add_resource(PostResource, '/api/posts/<int:post_id>')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
```

--- 