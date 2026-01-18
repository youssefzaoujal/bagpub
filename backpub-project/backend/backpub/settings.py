import os
from pathlib import Path
from datetime import timedelta
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Sécurité - IMPORTANT: Utiliser des variables d'environnement en production
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key-12345-change-this-in-production')

DEBUG = os.environ.get('DEBUG', 'False') == 'True'  # False par défaut pour la production

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Railway met automatiquement le domaine dans RAILWAY_PUBLIC_DOMAIN
if os.environ.get('RAILWAY_PUBLIC_DOMAIN'):
    ALLOWED_HOSTS.append(os.environ.get('RAILWAY_PUBLIC_DOMAIN'))
if os.environ.get('RAILWAY_STATIC_URL'):
    ALLOWED_HOSTS.append(os.environ.get('RAILWAY_STATIC_URL').replace('https://', '').replace('http://', '').split('/')[0])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # WhiteNoise pour servir les fichiers statiques sur Railway
    'django.middleware.gzip.GZipMiddleware',  # Compression GZIP
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Sécurité renforcée
# IMPORTANT: Désactiver SECURE_SSL_REDIRECT pour éviter les redirections lors des preflight requests CORS
if not DEBUG:
    # SECURE_SSL_REDIRECT = True  # Désactivé pour éviter les conflits avec CORS preflight
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
else:
    # En mode développement avec HTTP
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

ROOT_URLCONF = 'backpub.urls'

# CORRECTION ICI : Utiliser 'BACKEND' au lieu de 'ENGINE'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',  # CHANGÉ ICI
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

WSGI_APPLICATION = 'backpub.wsgi.application'

# Configuration de la base de données pour Railway (PostgreSQL)
# Utilise DATABASE_URL si disponible (Railway le configure automatiquement)
DATABASE_URL = os.environ.get('DATABASE_URL', '')
if DATABASE_URL:
    # Utilise PostgreSQL si DATABASE_URL est fourni (Railway)
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Utilise SQLite en développement local si DATABASE_URL n'est pas défini
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
            'OPTIONS': {
                'timeout': 20,
            },
        }
    }

# Cache configuration - Améliore grandement les performances
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 300,  # 5 minutes par défaut
        'OPTIONS': {
            'MAX_ENTRIES': 1000
        }
    }
}

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
# URL du frontend - configurable via variable d'environnement
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# WhiteNoise configuration pour servir les fichiers statiques
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Pour Railway, on peut stocker les médias dans un service de stockage cloud (optionnel)
# Pour l'instant, on utilise le système de fichiers local

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'api.User'

# CORS settings
# En production, on doit spécifier les origines autorisées
# Nettoyer les URLs : retirer les espaces et les '/' à la fin
cors_origins_raw = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')
CORS_ALLOWED_ORIGINS = [
    origin.strip().rstrip('/') for origin in cors_origins_raw.split(',') if origin.strip()
]
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Seulement en mode debug
CORS_ALLOW_CREDENTIALS = True

# CORS headers et méthodes supplémentaires pour les preflight requests
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# CSRF settings - Nécessaire pour les requêtes POST/PUT/DELETE
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()
# Ajouter aussi l'URL Railway du backend si nécessaire
if os.environ.get('RAILWAY_PUBLIC_DOMAIN'):
    backend_url = f"https://{os.environ.get('RAILWAY_PUBLIC_DOMAIN')}"
    if backend_url not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(backend_url)

# REST Framework settings - Optimisé pour performance
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,  # Pagination pour réduire la taille des réponses
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# JWT settings - Optimisé pour performance
SIMPLE_JWT = {
    'UPDATE_LAST_LOGIN': False,  # Désactiver pour éviter les écritures DB lentes
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
}
# backend/backpub/settings.py

import os # Assurez-vous que os est importé tout en haut

# ... autres configurations ...

# Configuration Email pour GMAIL (SMTP)
# IMPORTANT: Utiliser des variables d'environnement en production
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'

# Identifiants via variables d'environnement (sécurité)
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'bagbup.ads@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

# Expéditeur par défaut
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'BagPub <bagbup.ads@gmail.com>')
SERVER_EMAIL = os.environ.get('SERVER_EMAIL', EMAIL_HOST_USER)
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', EMAIL_HOST_USER)


# Rate Limiting - Protection contre les abus
RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = 'default'

# Logging de sécurité
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'security': {
            'format': 'SECURITY {asctime} {levelname} {module} {message} User: {user} IP: {ip}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'security.log'),
            'formatter': 'verbose',
        },
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'security_events.log'),
            'formatter': 'security',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['security_file'],
            'level': 'WARNING',
            'propagate': True,
        },
        'api.security': {
            'handlers': ['security_file'],
            'level': 'WARNING',
            'propagate': True,
        },
    },
}