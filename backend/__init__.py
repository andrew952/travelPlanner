from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Register blueprints
    from .routes import spots_bp, accommodations_bp, transportation_bp
    app.register_blueprint(spots_bp)
    app.register_blueprint(accommodations_bp)
    app.register_blueprint(transportation_bp)
    
    return app 