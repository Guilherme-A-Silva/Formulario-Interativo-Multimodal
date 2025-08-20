from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-f($vp@q_0r5c1%mgv$ntfdyh5s5eglzmz1*2o&x4h4mimql_=%'

DEBUG = True  # ⚠️ Altere para False em produção

ALLOWED_HOSTS = [
    'frontend-production-78a1.up.railway.app',
    'cidivan-production.up.railway.app',
    'gelinc.com.br',
]

# CORS CONFIG
CORS_ALLOWED_ORIGINS = [
    "https://frontend-production-78a1.up.railway.app",
    "https://gelinc.com.br",
]

CSRF_TRUSTED_ORIGINS = [
    "https://frontend-production-78a1.up.railway.app",
    "https://gelinc.com.br",
]

CSRF_COOKIE_SECURE = True  # obrigatoriamente se estiver em HTTPS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False  # o token precisa estar acessível via JS

CORS_ALLOW_CREDENTIALS = True

# APPS
INSTALLED_APPS = [
    'corsheaders',  # deve vir antes dos apps django
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
    'corsheaders.middleware.CorsMiddleware',  # deve ser o primeiro
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
        'rest_framework.permissions.IsAuthenticated',  # ⚠️ Troque para IsAuthenticated se quiser proteger por padrão
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
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
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

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'guilhermekelder@gmail.com'
EMAIL_HOST_PASSWORD = 'amovebmxfeabuqxa'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER