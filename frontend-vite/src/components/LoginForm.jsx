// LoginForm component
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-10 max-w-md w-full"
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-6xl mb-4"
        >
          🔍
        </motion.div>
        <h1 className="text-3xl font-bold gradient-text mb-2">TruthLens AI</h1>
        <p className="text-gray-600">Welcome back!</p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
            className="input-field"
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            className="input-field"
            autoComplete="current-password"
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold">
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Logging in...
            </div>
          ) : (
            'Login'
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or</span>
        </div>
      </div>

      {/* Social Login (Optional) */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </motion.button>
      </div>

      {/* Links */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-600 font-semibold hover:underline">
            Sign up for free
          </Link>
        </p>
        <Link to="/" className="block text-gray-500 hover:text-purple-600 transition-colors">
          ← Back to Home
        </Link>
      </div>

      {/* Benefits */}
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <p className="text-sm font-semibold text-gray-700 mb-2">Why login?</p>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Save analysis history
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Track your usage
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Access premium features
          </li>
        </ul>
      </div>
    </motion.div>
  )
}

export default LoginForm