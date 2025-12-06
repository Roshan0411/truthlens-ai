import requests
from config import Config
from utils.error_handler import logger

class FactChecker:
    def __init__(self):
        self.api_key = Config.GOOGLE_FACT_CHECK_API
        self.base_url = Config.FACT_CHECK_URL
        logger.info("✓ Fact Checker Initialized")
    
    def verify_claims(self, text):
        """Verify claims using Google Fact Check API"""
        if not text or len(text.strip()) < 50:
            return {
                'claims_found': 0,
                'verified_claims': [],
                'overall_verification': {
                    'score': 0.5,
                    'status': 'INSUFFICIENT_DATA'
                }
            }
        
        claims = self._extract_claims(text)
        results = []
        
        for claim in claims[:3]:
            response = self._query_api(claim)
            if response:
                results.append(response)
        
        return {
            'claims_found': len(results),
            'verified_claims': results,
            'overall_verification': self._calculate_score(results)
        }
    
    def _extract_claims(self, text):
        """Extract claims from text"""
        import re
        sentences = re.split(r'[.!?]+', text)
        claims = []
        for sentence in sentences:
            if any(word in sentence.lower() for word in ['is', 'are', 'was', 'were']):
                if len(sentence.split()) > 5:
                    claims.append(sentence.strip())
        return claims[:5]
    
    def _query_api(self, claim):
        """Query Google Fact Check API"""
        try:
            params = {
                'key': self.api_key,
                'query': claim,
                'languageCode': 'en'
            }
            response = requests.get(self.base_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'claims' in data and len(data['claims']) > 0:
                    first_claim = data['claims'][0]
                    return {
                        'claim': claim[:100],
                        'fact_check': {
                            'rating': first_claim.get('claimReview', [{}])[0].get('textualRating', 'Unknown'),
                            'source': first_claim.get('claimReview', [{}])[0].get('publisher', {}).get('name', 'Unknown')
                        }
                    }
            return None
        except Exception as e:
            logger.error(f"Fact check error: {e}")
            return None
    
    def _calculate_score(self, results):
        """Calculate verification score"""
        if not results:
            return {'score': 0.5, 'status': 'UNVERIFIED'}
        
        verified = sum(1 for r in results if 'true' in r['fact_check']['rating'].lower())
        false = sum(1 for r in results if 'false' in r['fact_check']['rating'].lower())
        
        if false > verified:
            return {'score': 0.3, 'status': 'MOSTLY_FALSE'}
        elif verified > false:
            return {'score': 0.8, 'status': 'MOSTLY_TRUE'}
        else:
            return {'score': 0.5, 'status': 'MIXED'}