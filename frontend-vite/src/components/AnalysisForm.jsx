// AnalysisForm component
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFileText, FiLink, FiImage } from 'react-icons/fi'
import { analysisAPI } from '../services/api'

const AnalysisForm = ({ onResults }) => {
  const [activeTab, setActiveTab] = useState('text')
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Upload to imgbb or similar service (for demo, we'll use a placeholder)
      // In production, you'd upload to a service and get a URL
      const imageUrl = URL.createObjectURL(file)
      setFormData({ ...formData, image_url: imageUrl })
      
      alert('Note: For image upload, please use an image hosting service and paste the URL, or paste the image directly.')
    }
  }

  const handlePasteImage = async (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result)
          setFormData({ ...formData, image_url: reader.result })
        }
        reader.readAsDataURL(file)
        
        alert('Image pasted! Our AI will analyze it for manipulation and authenticity.')
        break
      }
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
                Upload or Paste Image:
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 w-auto mx-auto rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData({ ...formData, image_url: '' })
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Paste Area */}
              <div
                onPaste={handlePasteImage}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
              >
                <FiImage className="mx-auto text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600 mb-2">
                  <strong>Paste an image here</strong> (Ctrl+V / Cmd+V)
                </p>
                <p className="text-sm text-gray-500">or</p>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="btn-secondary w-full cursor-pointer text-center block"
                >
                  📁 Choose Image File
                </label>
              </div>

              {/* Or URL Input */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or enter URL</span>
                </div>
              </div>

              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="input-field mt-4"
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