---

# 📘 13.2 Flask 웹 애플리케이션 개발

Flask는 가볍고 유연한 파이썬 웹 프레임워크로, 간단한 웹 애플리케이션부터 복잡한 API까지 다양한 용도로 활용할 수 있습니다.

## ✅ 13.2.1 Flask 프로젝트 구조

효율적인 Flask 프로젝트 구조는 다음과 같이 구성됩니다:

```
my_flask_app/
├── app/
│   ├── __init__.py    # 애플리케이션 초기화
│   ├── routes.py      # 라우트 정의
│   ├── models.py      # 데이터 모델
│   └── templates/     # HTML 템플릿
│       └── index.html
├── config.py          # 설정 파일
└── run.py             # 실행 스크립트
```

## ✅ 13.2.2 Flask 애플리케이션 설정

Flask 애플리케이션의 기본 설정 방법입니다:

```python
# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

# 애플리케이션과 DB 인스턴스 생성
app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

# 라우트 임포트 (순환 임포트 방지를 위해 여기서 임포트)
from app import routes, models
```

```python
# config.py
import os

class Config:
    """애플리케이션 설정 클래스"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard-to-guess-string'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

## ✅ 13.2.3 라우트 정의와 뷰 함수

Flask에서 라우트와 뷰 함수를 정의하는 방법입니다:

```python
# app/routes.py
from flask import render_template, redirect, url_for, request, flash
from app import app, db
from app.models import User, Post

@app.route('/')
def home():
    """홈페이지 라우트"""
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return render_template('home.html', posts=posts)

@app.route('/post/<int:id>')
def post_detail(id):
    """포스트 상세 라우트"""
    post = Post.query.get_or_404(id)
    return render_template('post_detail.html', post=post)

@app.route('/post/new', methods=['GET', 'POST'])
def new_post():
    """새 포스트 작성 라우트"""
    if request.method == 'POST':
        post = Post(
            title=request.form['title'],
            content=request.form['content'],
            author=current_user
        )
        db.session.add(post)
        db.session.commit()
        flash('포스트가 작성되었습니다!', 'success')
        return redirect(url_for('home'))
    return render_template('new_post.html')
```

## ✅ 13.2.4 템플릿 사용

Flask는 Jinja2 템플릿 엔진을 사용합니다:

```html
<!-- app/templates/layout.html -->
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}Flask 블로그{% endblock %}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">
</head>
<body>
    <header>
        <nav>
            <a href="{{ url_for('home') }}">홈</a>
            <a href="{{ url_for('new_post') }}">새 포스트</a>
        </nav>
    </header>
    
    <main>
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                {% for category, message in messages %}
                    <div class="alert alert-{{ category }}">{{ message }}</div>
                {% endfor %}
            {% endif %}
        {% endwith %}
        
        {% block content %}{% endblock %}
    </main>
    
    <footer>
        <p>&copy; 2023 Flask 블로그</p>
    </footer>
</body>
</html>
```

## ✅ 13.2.5 폼 처리와 유효성 검증

Flask-WTF를 사용한 폼 처리 예제:

```python
# app/forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length

class PostForm(FlaskForm):
    """포스트 작성 폼"""
    title = StringField('제목', validators=[DataRequired(), Length(min=5, max=100)])
    content = TextAreaField('내용', validators=[DataRequired()])
    submit = SubmitField('게시하기')
```

```python
# app/routes.py (수정)
from app.forms import PostForm

@app.route('/post/new', methods=['GET', 'POST'])
def new_post():
    """폼을 사용한 새 포스트 작성 라우트"""
    form = PostForm()
    if form.validate_on_submit():
        post = Post(
            title=form.title.data,
            content=form.content.data,
            author=current_user
        )
        db.session.add(post)
        db.session.commit()
        flash('포스트가 작성되었습니다!', 'success')
        return redirect(url_for('home'))
    return render_template('new_post.html', form=form)
```

## ✅ 13.2.6 데이터베이스 연동

SQLAlchemy를 사용한 데이터베이스 모델 정의:

```python
# app/models.py
from datetime import datetime
from app import db

class User(db.Model):
    """사용자 모델"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    posts = db.relationship('Post', backref='author', lazy=True)
    
    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class Post(db.Model):
    """포스트 모델"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def __repr__(self):
        return f"Post('{self.title}', '{self.created_at}')"
```

## ✅ 13.2.7 Flask 블루프린트

대규모 애플리케이션을 위한 블루프린트 활용:

```python
# app/posts/routes.py
from flask import Blueprint, render_template, redirect, url_for, flash
from app.posts.forms import PostForm
from app.models import Post
from app import db

posts = Blueprint('posts', __name__)

@posts.route('/post/new', methods=['GET', 'POST'])
def new_post():
    form = PostForm()
    if form.validate_on_submit():
        post = Post(title=form.title.data, content=form.content.data, author=current_user)
        db.session.add(post)
        db.session.commit()
        flash('포스트가 작성되었습니다!', 'success')
        return redirect(url_for('main.home'))
    return render_template('posts/create_post.html', form=form)
```

```python
# app/__init__.py (수정)
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    db.init_app(app)
    
    from app.main.routes import main
    from app.posts.routes import posts
    from app.users.routes import users
    
    app.register_blueprint(main)
    app.register_blueprint(posts)
    app.register_blueprint(users)
    
    return app
```

## ✅ 13.2.8 오류 처리

Flask 애플리케이션에서의 오류 처리 방법:

```python
# app/errors/handlers.py
from flask import Blueprint, render_template

errors = Blueprint('errors', __name__)

@errors.app_errorhandler(404)
def error_404(error):
    """404 페이지 찾을 수 없음 오류 핸들러"""
    return render_template('errors/404.html'), 404

@errors.app_errorhandler(403)
def error_403(error):
    """403 접근 금지 오류 핸들러"""
    return render_template('errors/403.html'), 403

@errors.app_errorhandler(500)
def error_500(error):
    """500 서버 오류 핸들러"""
    return render_template('errors/500.html'), 500
```

--- 