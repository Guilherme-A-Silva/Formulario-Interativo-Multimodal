from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-f($vp@q_0r5c1%mgv$ntfdyh5s5eglzmz1*2o&x4h4mimql_=%'

DEBUG = True  # ⚠️ Alterar para False em produção

# Permitir todos os hosts (em produção, especifique os domínios)
ALLOWED_HOSTS = ["*"]

# CORS CONFIG
# Permitir somente domínios específicos quando credentials=True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://frontend-production-78a1.up.railway.app",
    "https://cidivan-production.up.railway.app",
    "https://www.gelinc.com.br",  # ⚠️ Adicione seu domínio de produção
]
CORS_ALLOW_CREDENTIALS = True

# CSRF CONFIG
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://frontend-production-78a1.up.railway.app",
    "https://cidivan-production.up.railway.app",
    "https://www.gelinc.com.br",
]

# Cookies
# Para cross-origin com HTTPS
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False  # Token acessível via JS
CSRF_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SAMESITE = "None"

# APPS
INSTALLED_APPS = [
    'corsheaders',  # deve vir antes dos apps Django
    'authentication',
    'questions',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # REST
    'rest_framework',
]

# MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # primeiro
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST FRAMEWORK
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # ou AllowAny para rotas públicas
    ],
}

# TEMPLATES
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# URLS & WSGI
ROOT_URLCONF = 'EchoThink.urls'
WSGI_APPLICATION = 'EchoThink.wsgi.application'

# DATABASE
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'railway',
        'USER': 'postgres',
        'PASSWORD': 'ksZDIZPiDVgNYIlXsLcrKcUpUZBqhlBT',
        'HOST': 'postgres.railway.internal',
        'PORT': '5432',
    }
}

# PASSWORD VALIDATORS
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# INTERNACIONALIZAÇÃO
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# STATIC & MEDIA
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# AUTO FIELD
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# EMAIL CONFIG
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'cidivanc@gmail.com'
EMAIL_HOST_PASSWORD = 'tebjhuvzskqhadsh'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
