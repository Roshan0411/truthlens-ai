import requests
from urllib.parse import urlparse
from config import Config
from utils.error_handler import logger

class SourceValidator:
    def __init__(self):
        self.news_api_key = Config.NEWS_API_KEY
        self.credible_sources = {
            'high': ['reuters.com', 'apnews.com', 'bbc.com', 'npr.org'],
            'medium': ['cnn.com', 'nytimes.com', 'washingtonpost.com'],
            'low': []
        }
        logger.info("✓ Source Validator Initialized")
    
    def validate_source(self, url):
        """Validate source credibility"""
        if not url:
            return None
        
        domain = self._extract_domain(url)
        tier = self._check_known_sources(domain)
        newsapi_verified = self._check_newsapi(domain)
        domain_info = self._check_domain_info(url)
        
        score = self._calculate_score(tier, newsapi_verified, domain_info)
        
        return {
            'domain': domain,
            'credibility_score': score,
            'tier': tier,
            'newsapi_verified': newsapi_verified.get('verified', False),
            'https_enabled': domain_info['https'],
            'warnings': domain_info['warnings']
        }
    
    def _extract_domain(self, url):
        """Extract domain from URL"""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc or parsed.path
            return domain.replace('www.', '')
        except:
            return url
    
    def _check_known_sources(self, domain):
        """Check against known sources"""
        for tier, sources in self.credible_sources.items():
            if any(source in domain for source in sources):
                return tier
        return 'unknown'
    
    def _check_newsapi(self, domain):
        """Check NewsAPI"""
        try:
            response = requests.get(
                "https://newsapi.org/v2/sources",
                params={'apiKey': self.news_api_key},
                timeout=5
            )
            if response.status_code == 200:
                sources = response.json().get('sources', [])
                for source in sources:
                    if domain in source.get('url', ''):
                        return {'verified': True, 'name': source.get('name')}
            return {'verified': False}
        except:
            return {'verified': False}
    
    def _check_domain_info(self, url):
        """Check domain info"""
        warnings = []
        https = url.startswith('https://')
        if not https:
            warnings.append("No HTTPS")
        
        domain = self._extract_domain(url)
        if any(p in domain.lower() for p in ['-news', 'real', 'true']):
            warnings.append("Suspicious domain pattern")
        
        return {'https': https, 'warnings': warnings}
    
    def _calculate_score(self, tier, newsapi, domain_info):
        """Calculate credibility score"""
        score = 0.5
        if tier == 'high': score += 0.4
        elif tier == 'medium': score += 0.2
        elif tier == 'low': score -= 0.4
        
        if newsapi.get('verified'): score += 0.15
        if domain_info['https']: score += 0.05
        score -= len(domain_info['warnings']) * 0.1
        
        return max(0, min(1.0, round(score, 2)))