try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
except ImportError as e:
    print(f"Warning: {e}. Please ensure transformers and torch are installed.")
    AutoTokenizer = None
    AutoModelForSequenceClassification = None
    torch = None
from config import Config
from utils.error_handler import logger

class FakeNewsDetector:
    def __init__(self):
        try:
            logger.info("Loading Fake News Detection Model...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                Config.FAKE_NEWS_MODEL,
                token=Config.HUGGINGFACE_TOKEN
            )
            self.model = AutoModelForSequenceClassification.from_pretrained(
                Config.FAKE_NEWS_MODEL,
                token=Config.HUGGINGFACE_TOKEN
            )
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.model.to(self.device)
            self.model.eval()
            logger.info("✓ Fake News Model Loaded")
        except Exception as e:
            logger.error(f"Model loading error: {e}")
            raise
    
    def predict(self, text):
        """Predict if news is fake or real"""
        if not text or len(text.strip()) < 20:
            return {
                'label': 'INSUFFICIENT_DATA',
                'confidence': 0.0,
                'probabilities': {'FAKE': 0.0, 'REAL': 0.0},
                'risk_level': 'UNKNOWN'
            }
        
        try:
            inputs = self.tokenizer(
                text[:512],
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            ).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            fake_prob = probs[0][0].item()
            real_prob = probs[0][1].item()
            
            return {
                'label': 'FAKE' if fake_prob > real_prob else 'REAL',
                'confidence': round(max(fake_prob, real_prob), 4),
                'probabilities': {
                    'FAKE': round(fake_prob, 4),
                    'REAL': round(real_prob, 4)
                },
                'risk_level': self._get_risk_level(fake_prob)
            }
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                'label': 'ERROR',
                'confidence': 0.0,
                'probabilities': {'FAKE': 0.0, 'REAL': 0.0},
                'risk_level': 'UNKNOWN',
                'error': str(e)
            }
    
    def _get_risk_level(self, fake_prob):
        if fake_prob > 0.8: return "CRITICAL"
        elif fake_prob > 0.6: return "HIGH"
        elif fake_prob > 0.4: return "MEDIUM"
        else: return "LOW"