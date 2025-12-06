import requests
from config import Config
from utils.error_handler import logger

class GoogleImageSearch:
    """Google Custom Search API for image verification"""
    
    def __init__(self):
        self.api_key = Config.GOOGLE_CUSTOM_SEARCH_KEY
        self.search_engine_id = Config.GOOGLE_SEARCH_ENGINE_ID
        self.endpoint = Config.GOOGLE_CUSTOM_SEARCH_URL
        logger.info("✓ Google Image Search Initialized")
    
    def search_by_url(self, image_url):
        """Search for similar images"""
        try:
            params = {
                'key': self.api_key,
                'cx': self.search_engine_id,
                'q': image_url,
                'searchType': 'image',
                'num': 10
            }
            
            response = requests.get(self.endpoint, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return self._parse_results(data)
            elif response.status_code == 429:
                logger.warning("Google API rate limit")
                return self._fallback("Daily limit reached (100/day)")
            else:
                logger.warning(f"Google API status: {response.status_code}")
                return self._fallback()
                
        except Exception as e:
            logger.error(f"Google search error: {e}")
            return self._fallback()
    
    def _parse_results(self, data):
        """Parse Google API response"""
        result = {
            'status': 'success',
            'similar_images_found': 0,
            'top_sources': [],
            'appears_elsewhere': 0,
            'context_warning': None
        }
        
        items = data.get('items', [])
        result['similar_images_found'] = len(items)
        
        if items:
            result['appears_elsewhere'] = 1
            sources = []
            for item in items[:10]:
                domain = item.get('displayLink', '')
                if domain and domain not in sources:
                    sources.append(domain)
            
            result['top_sources'] = sources[:5]
            
            if len(set(sources)) > 5:
                result['context_warning'] = "⚠️ Image appears on many different websites"
        
        return result
    
    def _fallback(self, message="Reverse search unavailable"):
        """Fallback response"""
        return {
            'status': 'unavailable',
            'similar_images_found': 'N/A',
            'note': message,
            'appears_elsewhere': 0,
            'top_sources': []
        }