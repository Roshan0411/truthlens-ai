import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    HUGGINGFACE_TOKEN = os.getenv('HUGGINGFACE_TOKEN')
    GOOGLE_FACT_CHECK_API = os.getenv('GOOGLE_FACT_CHECK_API_KEY')
    NEWS_API_KEY = os.getenv('NEWS_API_KEY')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # Google Custom Search (Image Verification)
    GOOGLE_CUSTOM_SEARCH_KEY = os.getenv('GOOGLE_CUSTOM_SEARCH_KEY')
    GOOGLE_SEARCH_ENGINE_ID = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
    
    # Flask Config
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    PORT = int(os.getenv('PORT', 5000))
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # JWT Authentication
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION_HOURS = 24
    
    # Database
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    # Use /tmp directory for SQLite on Render (ephemeral storage)
    if os.getenv('RENDER'):
        DB_PATH = '/tmp/truthlens.db'
    else:
        DB_PATH = os.path.join(os.path.dirname(BASE_DIR), "database", "truthlens.db")
    DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{DB_PATH}')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Model Settings
    FAKE_NEWS_MODEL = "hamzab/roberta-fake-news-classification"
    SENTIMENT_MODEL = "cardiffnlp/twitter-roberta-base-sentiment"
    
    # API Endpoints
    FACT_CHECK_URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    NEWS_API_URL = "https://newsapi.org/v2/everything"
    GOOGLE_CUSTOM_SEARCH_URL = "https://www.googleapis.com/customsearch/v1"
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Rate Limiting
    RATE_LIMIT_FREE = 10  # 10 analyses per day for free users
    RATE_LIMIT_PRO = 100