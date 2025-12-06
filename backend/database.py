# Database models (SQLAlchemy)
from time import timezone
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
import secrets

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255))
    subscription_tier = db.Column(db.String(50), default='free')
    api_key = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    analyses = db.relationship('Analysis', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Verify password"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def generate_api_key(self):
        """Generate unique API key"""
        self.api_key = secrets.token_urlsafe(32)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'subscription_tier': self.subscription_tier,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Analysis(db.Model):
    __tablename__ = 'analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    content_hash = db.Column(db.String(64), index=True)
    content_type = db.Column(db.String(20))  # text, url, image
    content_preview = db.Column(db.Text)
    trust_score = db.Column(db.Float)
    grade = db.Column(db.String(1))
    analysis_result = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'content_type': self.content_type,
            'content_preview': self.content_preview,
            'trust_score': self.trust_score,
            'grade': self.grade,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'analysis_result': self.analysis_result
        }

def init_db(app):
    """Initialize database"""
    db.init_app(app)
    with app.app_context():
        # Create database directory if it doesn't exist
        import os
        os.makedirs('database', exist_ok=True)
        db.create_all()
        try:
            print("✅ Database initialized successfully")
        except:
            print("[OK] Database initialized successfully")