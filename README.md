# TruthLens AI 🔍

An advanced AI-powered platform for detecting fake news, analyzing sentiment, identifying bias, and verifying information credibility using state-of-the-art machine learning models.

## 🌐 Live Demo

- **Frontend**: [https://deeplens-ai-2mz3.vercel.app](https://deeplens-ai-2mz3.vercel.app)
- **Backend API**: [https://truthlens-ai-3.onrender.com](https://truthlens-ai-3.onrender.com)

## ✨ Features

### 🤖 AI-Powered Analysis
- **Fake News Detection**: Uses RoBERTa transformer model to identify misinformation
- **Sentiment Analysis**: Analyzes emotional tone and manipulation tactics
- **Bias Detection**: Identifies political bias and loaded language
- **Fact Checking**: Verifies claims using Google Fact Check API
- **Source Validation**: Evaluates source credibility and reputation
- **Image Verification**: Reverse image search and manipulation detection

### 📊 Trust Score System
- Comprehensive scoring algorithm (0-100 scale)
- Letter grades (A-F) for quick assessment
- Detailed breakdown of analysis components
- Actionable recommendations

### 🔐 User Features
- User authentication (JWT-based)
- Analysis history tracking
- API key management
- Rate limiting (free/pro tiers)

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 3.0.0
- **ML/AI**: 
  - PyTorch 2.9.1+
  - Transformers 4.36.0 (HuggingFace)
  - scikit-learn 1.3.2
- **Database**: SQLite with SQLAlchemy 2.0.44
- **Authentication**: JWT (PyJWT 2.8.0)
- **APIs**: 
  - Google Fact Check API
  - News API
  - Google Custom Search API
  - Gemini API
- **Deployment**: Gunicorn 21.2.0 on Render

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.21
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router 6.26.0
- **HTTP Client**: Axios 1.7.2
- **Deployment**: Vercel

### AI Models
- **Fake News**: `hamzab/roberta-fake-news-classification`
- **Sentiment**: `cardiffnlp/twitter-roberta-base-sentiment`
- Custom bias detection and source validation algorithms

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Roshan0411/truthlens-ai.git
   cd truthlens-ai/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   HUGGINGFACE_TOKEN=your_token
   GOOGLE_FACT_CHECK_API_KEY=your_key
   NEWS_API_KEY=your_key
   GEMINI_API_KEY=your_key
   GOOGLE_CUSTOM_SEARCH_KEY=your_key
   GOOGLE_SEARCH_ENGINE_ID=your_id
   SECRET_KEY=your_secret_key
   JWT_SECRET_KEY=your_jwt_secret
   ```

5. **Run the backend**
   ```bash
   python app.py
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend-vite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create `.env.local`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
truthlens-ai/
├── backend/
│   ├── models/              # AI model implementations
│   │   ├── fake_news_detector.py
│   │   ├── sentiment_analyzer.py
│   │   └── bias_detector.py
│   ├── services/            # Business logic
│   │   ├── fact_checker.py
│   │   ├── source_validator.py
│   │   └── image_verifier.py
│   ├── utils/               # Utility functions
│   │   ├── preprocessing.py
│   │   └── scoring.py
│   ├── app.py               # Main Flask application
│   ├── auth.py              # Authentication logic
│   ├── config.py            # Configuration
│   ├── database.py          # Database models
│   └── requirements.txt     # Python dependencies
│
└── frontend-vite/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── Navbar.jsx
    │   │   ├── Hero.jsx
    │   │   ├── AnalysisForm.jsx
    │   │   └── ResultsDisplay.jsx
    │   ├── pages/           # Page components
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   └── Dashboard.jsx
    │   ├── services/        # API services
    │   │   └── api.js
    │   └── App.jsx          # Main app component
    └── package.json         # Node dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Analysis
- `POST /api/analyze` - Analyze text, URL, or image
  ```json
  {
    "text": "Article text...",
    "url": "https://example.com/article",
    "image_url": "https://example.com/image.jpg"
  }
  ```

### History
- `GET /api/history?page=1` - Get analysis history

### Health
- `GET /api/health` - API health check

## 🧪 Example Analysis Response

```json
{
  "fake_news_detection": {
    "label": "REAL",
    "confidence": 0.9572,
    "probabilities": {
      "FAKE": 0.0428,
      "REAL": 0.9572
    }
  },
  "sentiment_analysis": {
    "sentiment": {
      "positive": 0.85,
      "neutral": 0.10,
      "negative": 0.05
    },
    "emotional_intensity": 0.75,
    "manipulation_score": {
      "score": 0.15,
      "detected_tactics": []
    }
  },
  "bias_detection": {
    "bias_level": "LOW",
    "overall_bias_score": 0.12,
    "bias_breakdown": {
      "left_bias": 0,
      "right_bias": 0,
      "loaded_language": 2
    }
  },
  "overall_trust_score": {
    "score": 87.5,
    "grade": "A",
    "recommendation": "✅ Highly Trustworthy"
  }
}
```

## 🚀 Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set environment variables
4. Use `backend/Procfile` for startup command
5. Set Python version in `backend/runtime.txt`

### Frontend (Vercel)
1. Import project from GitHub
2. Set root directory to `frontend-vite`
3. Set environment variable: `VITE_API_URL=https://truthlens-ai-3.onrender.com/api`
4. Deploy

## 📊 Performance

- **Model Loading Time**: 30-60 seconds (first request)
- **Analysis Time**: 2-5 seconds per request
- **Accuracy**: ~95% for fake news detection
- **API Response Time**: <100ms (excluding model inference)

## 🔒 Security

- JWT-based authentication
- Password hashing with Werkzeug
- Rate limiting on all endpoints
- CORS protection
- Input validation and sanitization

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Roshan**
- GitHub: [@Roshan0411](https://github.com/Roshan0411)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Support

Give a ⭐️ if this project helped you!

---

**Note**: This is an AI-powered tool and should be used as a supplementary resource for fact-checking. Always verify important information through multiple reliable sources.
