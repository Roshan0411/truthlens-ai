// SignupForm component
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheck, FiX } from 'react-icons/fi'

const SignupForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [passwordStrength, setPasswordStrength] = useState(0)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!agreedToTerms) {
      alert('Please agree to the Terms of Service')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    onSubmit(formData)
  }

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password })
    
    // Calculate password strength
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    setPasswordStrength(strength)
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains uppercase & lowercase', met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
    { label: 'Contains a number', met: /\d/.test(formData.password) },
    { label: 'Contains special character', met: /[^a-zA-Z0-9]/.test(formData.password) }
  ]

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-300'
    if (passwordStrength === 1) return 'bg-red-500'
    if (passwordStrength === 2) return 'bg-orange-500'
    if (passwordStrength === 3) return 'bg-yellow-500'
    return 'bg-green-500'
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
        <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
        <p className="text-gray-600">Join thousands fighting misinformation</p>
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
        {/* Name Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="input-field"
            autoComplete="name"
          />
        </div>

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
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Create a strong password"
            className="input-field"
            autoComplete="new-password"
          />
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2"
            >
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      passwordStrength >= level ? getStrengthColor() : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="space-y-1">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {req.met ? (
                      <FiCheck className="text-green-500" />
                    ) : (
                      <FiX className="text-gray-400" />
                    )}
                    <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm Password
          </label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="password"
            required
            minLength={8}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Re-enter password"
            className="input-field"
            autoComplete="new-password"
          />
          {formData.confirmPassword && (
            <div className="mt-2 text-sm">
              {formData.password === formData.confirmPassword ? (
                <span className="text-green-600 flex items-center gap-1">
                  <FiCheck /> Passwords match
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <FiX /> Passwords don't match
                </span>
              )}
            </div>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="#" className="text-purple-600 hover:underline font-semibold">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-purple-600 hover:underline font-semibold">
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !agreedToTerms}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or sign up with</span>
        </div>
      </div>

      {/* Social Signup */}
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
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
        <Link to="/" className="block text-gray-500 hover:text-purple-600 transition-colors">
          ← Back to Home
        </Link>
      </div>

      {/* Benefits */}
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <p className="text-sm font-semibold text-gray-700 mb-3">What you get for free:</p>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-purple-600 font-bold">✓</span>
            <span>10 analyses per day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600 font-bold">✓</span>
            <span>Analysis history & tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600 font-bold">✓</span>
            <span>All AI models included</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600 font-bold">✓</span>
            <span>No credit card required</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SignupForm