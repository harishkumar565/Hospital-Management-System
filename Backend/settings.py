mport os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = 'django-insecure-hms-secret-key-pfsd-2026'
DEBUG = True
ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = []

MIDDLEWARE = []

ROOT_URLCONF = 'Backend.urls'

# Frontend Directory absolute path
FRONTEND_DIR = os.path.join(BASE_DIR, 'Frontend')

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
