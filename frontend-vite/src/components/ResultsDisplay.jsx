// ResultsDisplay component
import { motion } from 'framer-motion'
import { FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiShare2, FiRefreshCw } from 'react-icons/fi'

const ResultsDisplay = ({ results, onNewAnalysis }) => {
  if (!results) return null

  const { overall_trust_score, fake_news_detection, sentiment_analysis, bias_detection, source_validation, image_verification } = results

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getGradeIcon = (grade) => {
    if (grade === 'A' || grade === 'B') return <FiCheckCircle className="text-4xl" />
    if (grade === 'C' || grade === 'D') return <FiAlertTriangle className="text-4xl" />
    return <FiAlertCircle className="text-4xl" />
  }

  const handleShare = () => {
    const shareText = `TruthLens AI Analysis:\n${overall_trust_score.recommendation}\n\nTrust Score: ${overall_trust_score.score}/100 (Grade ${overall_trust_score.grade})`
    
    if (navigator.share) {
      navigator.share({ title: 'TruthLens AI Analysis', text: shareText })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Results copied to clipboard!')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto mt-12"
    >
      {/* Trust Score Card */}
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="glass-card p-10 text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Overall Trust Score</h2>
        
        {/* Circular Score */}
        <div className="relative inline-block">
          <svg className="w-64 h-64" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#e5e7eb"
              strokeWidth="20"
              fill="none"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              stroke="url(#gradient)"
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(overall_trust_score.score / 100) * 502} 502`}
              initial={{ strokeDasharray: "0 502" }}
              animate={{ strokeDasharray: `${(overall_trust_score.score / 100) * 502} 502` }}
              transition={{ duration: 2, ease: "easeOut" }}
              transform="rotate(-90 100 100)"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%">
                <stop offset="0%" className={`text-${getScoreColor(overall_trust_score.score).split('-')[1]}-500`} />
                <stop offset="100%" className={`text-${getScoreColor(overall_trust_score.score).split('-')[3]}-500`} />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-6xl font-bold gradient-text"
            >
              {overall_trust_score.score}
            </motion.div>
            <div className="text-2xl font-semibold text-gray-600 mt-2">
              Grade {overall_trust_score.grade}
            </div>
            <div className="mt-2">
              {getGradeIcon(overall_trust_score.grade)}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={`mt-8 p-6 rounded-xl bg-gradient-to-r ${getScoreColor(overall_trust_score.score)} text-white text-xl font-semibold`}
        >
          {overall_trust_score.recommendation}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            <FiShare2 /> Share Results
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
          >
            <FiRefreshCw /> New Analysis
          </motion.button>
        </div>
      </motion.div>

      {/* Detailed Analysis Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fake News Detection */}
        {fake_news_detection && fake_news_detection.label !== 'ERROR' && (
          <AnalysisCard
            title="🤖 Fake News Detection"
            badge={fake_news_detection.label}
            badgeColor={fake_news_detection.label === 'FAKE' ? 'bg-red-500' : 'bg-green-500'}
          >
            <Metric label="Prediction" value={fake_news_detection.label} />
            <Metric label="Confidence" value={`${(fake_news_detection.confidence * 100).toFixed(1)}%`} />
            <Metric label="Risk Level" value={fake_news_detection.risk_level} />
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Fake: {(fake_news_detection.probabilities.FAKE * 100).toFixed(1)}%</span>
                <span>Real: {(fake_news_detection.probabilities.REAL * 100).toFixed(1)}%</span>
              </div>
            </div>
          </AnalysisCard>
        )}

        {/* Source Validation */}
        {source_validation && (
          <AnalysisCard
            title="🔍 Source Credibility"
            badge={source_validation.tier.toUpperCase()}
            badgeColor={source_validation.tier === 'high' ? 'bg-green-500' : source_validation.tier === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}
          >
            <Metric label="Domain" value={source_validation.domain} />
            <Metric label="Credibility" value={`${(source_validation.credibility_score * 100).toFixed(0)}%`} />
            <Metric label="HTTPS" value={source_validation.https_enabled ? '✓ Yes' : '✗ No'} />
            <Metric label="NewsAPI" value={source_validation.newsapi_verified ? '✓ Verified' : '✗ Not Verified'} />
          </AnalysisCard>
        )}

        {/* Sentiment Analysis */}
        {sentiment_analysis && (
          <AnalysisCard
            title="😡 Emotional Manipulation"
            badge={sentiment_analysis.manipulation_score.score > 0.5 ? 'HIGH' : sentiment_analysis.manipulation_score.score > 0.3 ? 'MODERATE' : 'LOW'}
            badgeColor={sentiment_analysis.manipulation_score.score > 0.5 ? 'bg-red-500' : sentiment_analysis.manipulation_score.score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}
          >
            <Metric label="Manipulation" value={`${(sentiment_analysis.manipulation_score.score * 100).toFixed(1)}%`} />
            <Metric label="Emotional Intensity" value={`${(sentiment_analysis.emotional_intensity * 100).toFixed(1)}%`} />
            {sentiment_analysis.manipulation_score.detected_tactics.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm">
                <strong>Tactics:</strong> {sentiment_analysis.manipulation_score.detected_tactics.join(', ')}
              </div>
            )}
            {sentiment_analysis.red_flags.length > 0 && (
              <div className="mt-2 p-3 bg-red-50 rounded-lg text-sm">
                <strong>🚩 Flags:</strong> {sentiment_analysis.red_flags.join(', ')}
              </div>
            )}
          </AnalysisCard>
        )}

        {/* Bias Detection */}
        {bias_detection && (
          <AnalysisCard
            title="📊 Bias Analysis"
            badge={bias_detection.bias_level}
            badgeColor={bias_detection.bias_level === 'HIGH' ? 'bg-red-500' : bias_detection.bias_level === 'MODERATE' ? 'bg-yellow-500' : 'bg-green-500'}
          >
            <Metric label="Bias Score" value={`${(bias_detection.overall_bias_score * 100).toFixed(1)}%`} />
            <Metric label="Source Diversity" value={`${(bias_detection.source_diversity * 100).toFixed(0)}%`} />
            <Metric label="Attribution" value={`${(bias_detection.attribution_score * 100).toFixed(0)}%`} />
          </AnalysisCard>
        )}

        {/* Image Verification */}
        {image_verification && (
          <AnalysisCard
            title="🖼️ Image Verification"
            badge={image_verification.overall_trust_score > 0.7 ? 'TRUSTWORTHY' : image_verification.overall_trust_score > 0.5 ? 'MODERATE' : 'SUSPICIOUS'}
            badgeColor={image_verification.overall_trust_score > 0.7 ? 'bg-green-500' : image_verification.overall_trust_score > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}
          >
            <Metric label="Trust Score" value={`${(image_verification.overall_trust_score * 100).toFixed(0)}%`} />
            {image_verification.manipulation_detection && !image_verification.manipulation_detection.error && (
              <Metric label="Manipulation" value={image_verification.manipulation_detection.likely_manipulated ? 'DETECTED' : 'CLEAN'} />
            )}
            {image_verification.reverse_search?.similar_images_found && (
              <Metric label="Similar Images" value={image_verification.reverse_search.similar_images_found} />
            )}
          </AnalysisCard>
        )}
      </div>
    </motion.div>
  )
}

const AnalysisCard = ({ title, badge, badgeColor, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="glass-card p-6"
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${badgeColor}`}>
        {badge}
      </span>
    </div>
    <div className="space-y-2">
      {children}
    </div>
  </motion.div>
)

const Metric = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-sm font-semibold text-gray-600">{label}:</span>
    <span className="text-sm font-bold text-purple-600">{value}</span>
  </div>
)

export default ResultsDisplay