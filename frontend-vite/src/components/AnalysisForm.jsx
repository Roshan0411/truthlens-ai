// AnalysisForm component
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFileText, FiLink, FiImage } from 'react-icons/fi'
import { analysisAPI } from '../services/api'

const AnalysisForm = ({ onResults }) => {
  const [activeTab, setActiveTab] = useState('text')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    text: '',
    url: '',
    image_url: ''
  })

  const tabs = [
    { id: 'text', label: 'Text Analysis', icon: FiFileText },
    { id: 'url', label: 'URL Check', icon: FiLink },
    { id: 'image', label: 'Image Verify', icon: FiImage }
  ]

  const examples = {
    text: [
      {
        label: '✅ Real News',
        content: 'Scientists at MIT published groundbreaking research in Nature journal regarding renewable energy.'
      },
      {
        label: '❌ Fake News',
        content: 'BREAKING: Miracle cure discovered! Doctors HATE this! Share before they remove it!'
      }
    ],
    url: [
      { label: '🔗 BBC News', content: 'https://www.bbc.com/news' },
      { label: '🔗 Reuters', content: 'https://www.reuters.com' }
    ],
    image: [
      { label: '🖼️ Test Image', content: 'https://picsum.photos/800/600' }
    ]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        text: activeTab === 'text' ? formData.text : '',
        url: activeTab === 'url' ? formData.url : '',
        image_url: activeTab === 'image' ? formData.image_url : ''
      }

      const response = await analysisAPI.analyze(payload)
      onResults(response.data)
    } catch (error) {
      console.error('Analysis error:', error)
      alert(error.response?.data?.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExample = (content) => {
    setFormData({ ...formData, [activeTab === 'text' ? 'text' : activeTab === 'url' ? 'url' : 'image_url']: content })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 max-w-4xl mx-auto"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Icon className="text-xl" />
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {activeTab === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <label className="block mb-2 font-semibold text-gray-700">
                Paste news article or social media post:
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Example: 'BREAKING NEWS: Scientists discover...'"
                rows="6"
                className="input-field resize-none"
              />
              <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                💡 <strong>Tip:</strong> Our AI analyzes writing style, emotional manipulation, and factual claims
              </div>
            </motion.div>
          )}

          {activeTab === 'url' && (
            <motion.div
              key="url"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <label className="block mb-2 font-semibold text-gray-700">
                Enter news article URL:
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/news-article"
                className="input-field"
              />
              <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                💡 <strong>Tip:</strong> We'll check source credibility and domain reputation
              </div>
            </motion.div>
          )}

          {activeTab === 'image' && (
            <motion.div
              key="image"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <label className="block mb-2 font-semibold text-gray-700">
                Enter image URL:
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="input-field"
              />
              <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                💡 <strong>Tip:</strong> We analyze metadata, detect manipulation, and perform reverse search
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-6 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </div>
          ) : (
            <span>🧠 Analyze Content</span>
          )}
        </motion.button>

        {/* Examples */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples[activeTab].map((example, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleExample(example.content)}
                className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg text-sm font-medium text-purple-700 hover:from-purple-200 hover:to-pink-200 transition-all"
              >
                {example.label}
              </motion.button>
            ))}
          </div>
        </div>
      </form>
    </motion.div>
  )
}

export default AnalysisForm