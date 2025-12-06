try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
except ImportError as e:
    print(f"Warning: {e}. Please ensure transformers and torch are installed.")
    AutoTokenizer = None
    AutoModelForSequenceClassification = None
    torch = None
from textblob import TextBlob
import re
from utils.error_handler import logger

class SentimentAnalyzer:
    def __init__(self):
        try:
            logger.info("Loading Sentiment Analysis Model...")
            self.tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
            self.model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
            self.model.eval()
            logger.info("✓ Sentiment Model Loaded")
        except Exception as e:
            logger.error(f"Sentiment model error: {e}")
            raise
    
    def analyze_emotions(self, text):
        """Detect emotional manipulation"""
        try:
            # Sentiment analysis
            inputs = self.tokenizer(text[:512], return_tensors="pt", truncation=True)
            with torch.no_grad():
                outputs = self.model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            sentiment_scores = {
                'negative': round(probs[0][0].item(), 4),
                'neutral': round(probs[0][1].item(), 4),
                'positive': round(probs[0][2].item(), 4)
            }
            
            # Manipulation detection
            manipulation = self._detect_manipulation(text)
            
            # TextBlob analysis
            blob = TextBlob(text)
            
            return {
                'sentiment': sentiment_scores,
                'manipulation_score': manipulation,
                'polarity': round(blob.sentiment.polarity, 3),
                'subjectivity': round(blob.sentiment.subjectivity, 3),
                'emotional_intensity': max(sentiment_scores.values()),
                'red_flags': self._identify_red_flags(text)
            }
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {
                'sentiment': {'negative': 0, 'neutral': 1, 'positive': 0},
                'manipulation_score': {'score': 0, 'detected_tactics': []},
                'polarity': 0,
                'subjectivity': 0,
                'emotional_intensity': 0,
                'red_flags': []
            }
    
    def _detect_manipulation(self, text):
        """Detect manipulation tactics"""
        tactics = {
            'fear_mongering': ['crisis', 'danger', 'threat', 'scary', 'terrifying'],
            'urgency': ['now', 'immediately', 'urgent', 'breaking', 'alert'],
            'sensationalism': ['shocking', 'unbelievable', 'incredible', 'stunning'],
            'absolutes': ['always', 'never', 'everyone', 'nobody']
        }
        
        text_lower = text.lower()
        score = 0
        detected = []
        
        for category, words in tactics.items():
            matches = sum(1 for word in words if word in text_lower)
            if matches > 0:
                score += matches * 0.1
                detected.append(category)
        
        return {
            'score': min(round(score, 2), 1.0),
            'detected_tactics': detected
        }
    
    def _identify_red_flags(self, text):
        """Identify red flags"""
        flags = []
        if re.search(r'[A-Z]{5,}', text):
            flags.append('Excessive capitalization')
        if re.search(r'!{2,}', text):
            flags.append('Multiple exclamation marks')
        if re.search(r'(you won\'t believe|what happened next)', text, re.I):
            flags.append('Clickbait language')
        return flags