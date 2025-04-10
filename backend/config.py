import os

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///travelplanner.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-please-change-in-production'
    
    # CORS configuration
    CORS_HEADERS = 'Content-Type' 