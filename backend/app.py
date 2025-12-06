from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import hashlib
from datetime import datetime, date, timezone
import os
import sys

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except:
        pass

from config import Config
from database import db, init_db, User, Analysis
from auth import generate_token, login_required, optional_auth
from utils.error_handler import ValidationError, logger
from utils.preprocessing import TextPreprocessor
from utils.scoring import TrustScoreCalculator

# Import AI models
from models.fake_news_detector import FakeNewsDetector
from models.sentiment_analyzer import SentimentAnalyzer
from models.bias_detector import BiasDetector
from services.fact_checker import FactChecker
from services.source_validator import SourceValidator
from services.image_verifier import ImageVerifier

# Initialize Flask
app = Flask(__name__)
app.config.from_object(Config)

# Debug: Log database configuration
logger.info(f"Database URL: {app.config.get('SQLALCHEMY_DATABASE_URI', 'NOT SET')}")
logger.info(f"Flask ENV: {app.config.get('FLASK_ENV', 'NOT SET')}")

# Enable CORS
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})

# Initialize database
init_db(app)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per hour"],
    storage_uri="memory://"
)

# Lazy loading for AI models (to save memory)
logger.info("=" * 50)
logger.info("🚀 TruthLens AI - Starting...")
logger.info("=" * 50)

# Global model instances (will be initialized on first use)
fake_news_detector = None
sentiment_analyzer = None
bias_detector = None
fact_checker = None
source_validator = None
image_verifier = None
preprocessor = None
trust_calculator = None

def get_models():
    """Lazy load models on first use"""
    global fake_news_detector, sentiment_analyzer, bias_detector
    global fact_checker, source_validator, image_verifier
    global preprocessor, trust_calculator
    
    if fake_news_detector is None:
        logger.info("Loading models (first request)...")
        try:
            fake_news_detector = FakeNewsDetector()
            sentiment_analyzer = SentimentAnalyzer()
            bias_detector = BiasDetector()
            fact_checker = FactChecker()
            source_validator = SourceValidator()
            image_verifier = ImageVerifier()
            preprocessor = TextPreprocessor()
            trust_calculator = TrustScoreCalculator()
            logger.info("✅ All models loaded successfully!")
        except Exception as e:
            logger.error(f"❌ Error loading models: {e}")
            raise
    
    return {
        'fake_news_detector': fake_news_detector,
        'sentiment_analyzer': sentiment_analyzer,
        'bias_detector': bias_detector,
        'fact_checker': fact_checker,
        'source_validator': source_validator,
        'image_verifier': image_verifier,
        'preprocessor': preprocessor,
        'trust_calculator': trust_calculator
    }

logger.info("✅ Server initialized (models will load on first request)")

# ==================== ROUTES ====================

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'TruthLens AI API',
        'version': '2.0.0',
        'status': 'running',
        'endpoints': {
            'analyze': '/api/analyze [POST]',
            'signup': '/api/auth/signup [POST]',
            'login': '/api/auth/login [POST]',
            'history': '/api/history [GET]',
            'health': '/api/health [GET]'
        }
    })

@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': True,
        'timestamp': datetime.utcnow().isoformat()
    })

# ==================== AUTH ROUTES ====================

@app.route('/api/auth/signup', methods=['POST'])
@limiter.limit("5 per hour")
def signup():
    """User registration"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        if not email or not password:
            raise ValidationError("Email and password required")
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters")
        
        if User.query.filter_by(email=email).first():
            raise ValidationError("Email already registered")
        
        user = User(email=email, name=name)
        user.set_password(password)
        user.generate_api_key()
        
        db.session.add(user)
        db.session.commit()
        
        token = generate_token(user.id)
        logger.info(f"New user: {email}")
        
        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        logger.error(f"Signup error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    """User login"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            raise ValidationError("Email and password required")
        
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            raise ValidationError("Invalid email or password")
        
        user.last_login = datetime.now(datetime.timezone.utc)
        db.session.commit()
        
        token = generate_token(user.id)
        logger.info(f"User logged in: {email}")
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        })
        
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_me(user):
    """Get current user"""
    return jsonify({'user': user.to_dict()})

# ==================== ANALYSIS ROUTES ====================

@app.route('/api/analyze', methods=['POST'])
@limiter.limit("30 per hour")
@optional_auth
def analyze(user=None):
    """Main analysis endpoint"""
    try:
        data = request.get_json()
        if not data:
            raise ValidationError('No data provided')
        
        text = data.get('text', '').strip()
        url = data.get('url', '').strip()
        image_url = data.get('image_url', '').strip()
        
        if not text and not url and not image_url:
            raise ValidationError('Provide text, URL, or image URL')
        
        # Check rate limit for logged-in users
        if user:
            today_start = datetime.combine(date.today(), datetime.min.time())
            today_count = Analysis.query.filter(
                Analysis.user_id == user.id,
                Analysis.created_at >= today_start
            ).count()
            
            limit = Config.RATE_LIMIT_FREE if user.subscription_tier == 'free' else Config.RATE_LIMIT_PRO
            if today_count >= limit:
                raise ValidationError(f"Daily limit of {limit} analyses reached")
        
        # Load models on first request (lazy loading)
        models = get_models()
        
        # Clean text
        cleaned_text = models['preprocessor'].clean_text(text) if text else ""
        
        # Generate hash
        content_hash = hashlib.md5(f"{cleaned_text}{url}{image_url}".encode()).hexdigest()
        
        # Run analyses
        results = {}
        
        # Text analysis
        if cleaned_text and len(cleaned_text) > 20:
            logger.info(f"Analyzing text ({len(cleaned_text)} chars)")
            results['fake_news_detection'] = models['fake_news_detector'].predict(cleaned_text)
            results['sentiment_analysis'] = models['sentiment_analyzer'].analyze_emotions(cleaned_text)
            results['bias_detection'] = models['bias_detector'].detect_bias(cleaned_text)
            
            if len(cleaned_text) > 100:
                results['fact_checking'] = models['fact_checker'].verify_claims(cleaned_text)
            else:
                results['fact_checking'] = None
        else:
            results['fake_news_detection'] = None
            results['sentiment_analysis'] = None
            results['bias_detection'] = None
            results['fact_checking'] = None
        
        # Source validation
        if url:
            logger.info(f"Validating source: {url}")
            results['source_validation'] = models['source_validator'].validate_source(url)
        else:
            results['source_validation'] = None
        
        # Image verification
        if image_url:
            logger.info(f"Verifying image: {image_url}")
            results['image_verification'] = models['image_verifier'].verify_image(image_url)
        else:
            results['image_verification'] = None
        
        # Calculate trust score
        trust_score = models['trust_calculator'].calculate(results)
        results['overall_trust_score'] = trust_score
        
        # Save to database
        if user:
            try:
                analysis = Analysis(
                    user_id=user.id,
                    content_hash=content_hash,
                    content_type='text' if text else ('url' if url else 'image'),
                    content_preview=(cleaned_text[:500] if cleaned_text else url[:500] if url else image_url[:500]),
                    trust_score=trust_score['score'],
                    grade=trust_score['grade'],
                    analysis_result=results
                )
                db.session.add(analysis)
                db.session.commit()
                logger.info(f"Analysis saved for user {user.id}")
            except Exception as e:
                logger.error(f"Save error: {e}")
                db.session.rollback()
        
        logger.info(f"✅ Analysis complete - Score: {trust_score['score']}")
        return jsonify(results)
        
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Analysis failed'}), 500

@app.route('/api/history', methods=['GET'])
@login_required
def get_history(user):
    """Get user's analysis history"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        analyses = Analysis.query.filter_by(user_id=user.id)\
            .order_by(Analysis.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'analyses': [a.to_dict() for a in analyses.items],
            'total': analyses.total,
            'page': page,
            'pages': analyses.pages
        })
    except Exception as e:
        logger.error(f"History error: {e}")
        return jsonify({'error': 'Failed to fetch history'}), 500

@app.route('/api/history/<int:analysis_id>', methods=['GET'])
@login_required
def get_analysis_detail(user, analysis_id):
    """Get specific analysis"""
    try:
        analysis = Analysis.query.filter_by(id=analysis_id, user_id=user.id).first()
        if not analysis:
            raise ValidationError("Analysis not found")
        return jsonify(analysis.to_dict())
    except ValidationError as e:
        return jsonify({'error': e.message}), 404
    except Exception as e:
        logger.error(f"Detail error: {e}")
        return jsonify({'error': 'Failed to fetch analysis'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# Run app
if __name__ == '__main__':
    port = Config.PORT
    app.run(host='0.0.0.0', port=port, debug=(Config.FLASK_ENV == 'development'))