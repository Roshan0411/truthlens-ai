class TrustScoreCalculator:
    @staticmethod
    def calculate(analysis_results):
        """Calculate overall trust score (0-100)"""
        scores = []
        weights = []
        
        # Fake News Detection (35%)
        if analysis_results.get('fake_news_detection'):
            fake = analysis_results['fake_news_detection']
            if fake.get('label') != 'ERROR':
                scores.append(fake['probabilities']['REAL'])
                weights.append(0.35)
        
        # Source Credibility (25%)
        if analysis_results.get('source_validation'):
            scores.append(analysis_results['source_validation']['credibility_score'])
            weights.append(0.25)
        
        # Fact Checking (20%)
        if analysis_results.get('fact_checking'):
            scores.append(analysis_results['fact_checking']['overall_verification']['score'])
            weights.append(0.20)
        
        # Bias Detection (10%)
        if analysis_results.get('bias_detection'):
            bias_score = 1 - analysis_results['bias_detection']['overall_bias_score']
            scores.append(bias_score)
            weights.append(0.10)
        
        # Emotional Manipulation (10%)
        if analysis_results.get('sentiment_analysis'):
            emotion_score = 1 - analysis_results['sentiment_analysis']['manipulation_score']['score']
            scores.append(emotion_score)
            weights.append(0.10)
        
        # Calculate weighted average
        if scores:
            total_weight = sum(weights)
            weighted_sum = sum(s * w for s, w in zip(scores, weights))
            final_score = (weighted_sum / total_weight) * 100
        else:
            final_score = 50
        
        return {
            'score': round(final_score, 1),
            'grade': TrustScoreCalculator._get_grade(final_score),
            'recommendation': TrustScoreCalculator._get_recommendation(final_score)
        }
    
    @staticmethod
    def _get_grade(score):
        if score >= 80: return 'A'
        elif score >= 70: return 'B'
        elif score >= 60: return 'C'
        elif score >= 50: return 'D'
        else: return 'F'
    
    @staticmethod
    def _get_recommendation(score):
        if score >= 80:
            return "✅ Highly Trustworthy - Safe to share"
        elif score >= 70:
            return "👍 Generally Reliable - Verify key claims before sharing"
        elif score >= 60:
            return "⚠️ Moderate Concerns - Cross-check with other sources"
        elif score >= 50:
            return "⚠️ Questionable - Multiple credibility issues detected"
        else:
            return "❌ High Risk - Do NOT share without verification"