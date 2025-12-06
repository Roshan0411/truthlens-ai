// Dashboard page
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { analysisAPI } from '../services/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(userData))
    loadHistory()
  }, [navigate])

  const loadHistory = async () => {
    try {
      const response = await analysisAPI.getHistory()
      setHistory(response.data.analyses || [])
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user.name || user.email.split('@')[0]}</span>! 👋
          </h1>
          <p className="text-gray-600">Here's your fact-checking activity</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: '📊', label: 'Total Analyses', value: history.length },
            { icon: '📅', label: 'This Month', value: history.filter(a => new Date(a.created_at).getMonth() === new Date().getMonth()).length },
            { icon: '⚡', label: 'Account Tier', value: user.subscription_tier || 'Free' },
            { icon: '🎯', label: 'Avg Score', value: history.length > 0 ? Math.round(history.reduce((acc, h) => acc + h.trust_score, 0) / history.length) : 0 }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Analysis History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Analysis History</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">No analyses yet</h3>
              <p className="text-gray-600 mb-6">Start analyzing content to see your history here</p>
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Analyze Content
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Preview</th>
                    <th className="text-left py-3 px-4">Score</th>
                    <th className="text-left py-3 px-4">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-gray-100 hover:bg-purple-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {item.content_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 max-w-md truncate">
                        {item.content_preview}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-lg gradient-text">
                          {item.trust_score}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                          item.grade === 'A' || item.grade === 'B' ? 'bg-green-500' :
                          item.grade === 'C' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {item.grade}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard