import re
from bs4 import BeautifulSoup

class TextPreprocessor:
    @staticmethod
    def clean_text(text):
        """Clean and preprocess text"""
        # Remove HTML
        text = BeautifulSoup(text, 'html.parser').get_text()
        # Remove URLs
        text = re.sub(r'http\S+|www\S+', '', text)
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text