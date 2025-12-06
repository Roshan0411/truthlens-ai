import requests
from PIL import Image, ExifTags
from io import BytesIO
import hashlib
import numpy as np
from services.google_image_search import GoogleImageSearch
from utils.error_handler import logger

TAGS = ExifTags.TAGS

class ImageVerifier:
    def __init__(self):
        self.google_search = GoogleImageSearch()
        logger.info("✓ Image Verifier Initialized")
    
    def verify_image(self, image_url):
        """Complete image verification"""
        if not image_url:
            return None
        
        results = {
            'metadata_analysis': self._analyze_metadata(image_url),
            'manipulation_detection': self._detect_manipulation(image_url),
            'reverse_search': self.google_search.search_by_url(image_url),
            'overall_trust_score': 0,
            'warnings': []
        }
        
        results['overall_trust_score'], results['warnings'] = self._calculate_score(results)
        return results
    
    def _analyze_metadata(self, image_url):
        """Extract EXIF metadata"""
        try:
            response = requests.get(image_url, timeout=10)
            img = Image.open(BytesIO(response.content))
            
            metadata = {
                'format': img.format,
                'size': list(img.size),
                'has_exif': 0,
                'camera_info': {}
            }
            
            try:
                exif = img._getexif()
                if exif:
                    metadata['has_exif'] = 1
                    for tag_id, value in exif.items():
                        tag = TAGS.get(tag_id, tag_id)
                        if tag in ['Make', 'Model']:
                            metadata['camera_info'][tag] = str(value)
            except:
                pass
            
            metadata['is_low_res'] = 1 if img.size[0] * img.size[1] < 100000 else 0
            return metadata
        except Exception as e:
            logger.error(f"Metadata error: {e}")
            return {'error': 'Could not analyze metadata'}
    
    def _detect_manipulation(self, image_url):
        """Error Level Analysis"""
        try:
            response = requests.get(image_url, timeout=10)
            img = Image.open(BytesIO(response.content))
            
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if too large
            if max(img.size) > 1920:
                ratio = 1920 / max(img.size)
                new_size = tuple(int(dim * ratio) for dim in img.size)
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # ELA
            temp = BytesIO()
            img.save(temp, 'JPEG', quality=90)
            temp.seek(0)
            compressed = Image.open(temp)
            
            ela_array = np.abs(np.array(img, dtype=np.float64) - np.array(compressed, dtype=np.float64))
            
            ela_mean = np.mean(ela_array)
            ela_std = np.std(ela_array)
            ela_max = np.max(ela_array)
            
            return {
                'ela_mean': round(float(ela_mean), 2),
                'ela_std': round(float(ela_std), 2),
                'ela_max': round(float(ela_max), 2),
                'likely_manipulated': 1 if (ela_std > 15 or ela_max > 50) else 0,
                'confidence': 'HIGH' if ela_std > 20 else 'MEDIUM' if ela_std > 10 else 'LOW'
            }
        except Exception as e:
            logger.error(f"ELA error: {e}")
            return {'error': 'Could not detect manipulation'}
    
    def _calculate_score(self, results):
        """Calculate trust score"""
        score = 0.7
        warnings = []
        
        # Metadata
        metadata = results.get('metadata_analysis', {})
        if not metadata.get('error'):
            if metadata.get('has_exif'):
                score += 0.15
            else:
                warnings.append("No EXIF data")
                score -= 0.1
            
            if metadata.get('is_low_res'):
                warnings.append("Low resolution")
                score -= 0.1
        
        # Manipulation
        manip = results.get('manipulation_detection', {})
        if not manip.get('error') and manip.get('likely_manipulated'):
            warnings.append("⚠️ Manipulation detected")
            score -= 0.2
        
        # Reverse search
        reverse = results.get('reverse_search', {})
        if reverse.get('status') == 'success':
            if reverse.get('appears_elsewhere'):
                score += 0.05
                if reverse.get('context_warning'):
                    warnings.append(reverse['context_warning'])
                    score -= 0.2
        
        return round(max(0, min(1.0, score)), 2), warnings