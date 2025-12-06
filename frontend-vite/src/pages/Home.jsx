// Home page
import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AnalysisForm from '../components/AnalysisForm'
import ResultsDisplay from '../components/ResultsDisplay'

const Home = () => {
  const [results, setResults] = useState(null)

  const handleNewAnalysis = () => {
    setResults(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4">
        <Hero />
        {!results ? (
          <AnalysisForm onResults={setResults} />
        ) : (
          <ResultsDisplay results={results} onNewAnalysis={handleNewAnalysis} />
        )}

        {/* Features Section */}
        {!results && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20"
          >
            <h2 className="text-4xl font-bold text-center text-white mb-12">
              How TruthLens AI Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '🤖', title: 'AI Detection', desc: 'Advanced transformer models analyze text patterns with 99%+ accuracy' },
                { icon: '🔍', title: 'Source Check', desc: 'Validates credibility against trusted databases' },
                { icon: '✓', title: 'Fact Verification', desc: 'Cross-references claims with multiple fact-checking sources' },
                { icon: '😡', title: 'Emotion Analysis', desc: 'Detects manipulation tactics and clickbait language' },
                { icon: '📊', title: 'Bias Detection', desc: 'Identifies political bias and one-sided reporting' },
                { icon: '🖼️', title: 'Image Verification', desc: 'Checks for manipulation and performs reverse search' }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glass-card p-6 text-center"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Home