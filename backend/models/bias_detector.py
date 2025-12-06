import re

class BiasDetector:
    def __init__(self):
        self.biased_words = {
            'left': ['liberal', 'progressive', 'socialist', 'woke'],
            'right': ['conservative', 'traditional', 'patriot'],
            'loaded': ['terrorist', 'thug', 'elite', 'regime', 'propaganda']
        }
    
    def detect_bias(self, text):
        """Detect bias in text"""
        text_lower = text.lower()
        
        bias_scores = {
            'left_bias': 0,
            'right_bias': 0,
            'loaded_language': 0
        }
        
        found_words = []
        
        for category, words in self.biased_words.items():
            for word in words:
                count = text_lower.count(word)
                if count > 0:
                    if category == 'left':
                        bias_scores['left_bias'] += count
                    elif category == 'right':
                        bias_scores['right_bias'] += count
                    else:
                        bias_scores['loaded_language'] += count
                    found_words.append(word)
        
        total_bias = sum(bias_scores.values())
        overall_bias = min(total_bias / 10, 1.0)
        
        return {
            'overall_bias_score': round(overall_bias, 3),
            'bias_breakdown': bias_scores,
            'biased_words_found': found_words[:5],
            'source_diversity': self._check_diversity(text),
            'attribution_score': self._check_attribution(text),
            'bias_level': 'HIGH' if overall_bias > 0.7 else 'MODERATE' if overall_bias > 0.4 else 'LOW'
        }
    
    def _check_diversity(self, text):
        """Check for diverse perspectives"""
        indicators = ['however', 'on the other hand', 'critics say', 'but']
        count = sum(1 for phrase in indicators if phrase in text.lower())
        return min(count / 3, 1.0)
    
    def _check_attribution(self, text):
        """Check for proper attribution"""
        patterns = [r'according to', r'said', r'reported by', r'sources say']
        matches = sum(1 for pattern in patterns if re.search(pattern, text, re.I))
        return min(matches / 5, 1.0)