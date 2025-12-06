// Navbar component
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLogOut, FiUser, FiHome, FiBarChart2 } from 'react-icons/fi'

const Navbar = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-card sticky top-4 mx-4 mt-4 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.span 
              className="text-5xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🔍
            </motion.span>
            <span className="text-2xl font-bold gradient-text">
              TruthLens AI
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
              <FiHome /> Analyze
            </Link>
            
            {token ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
                  <FiBarChart2 /> Dashboard
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-lg">
                  <FiUser />
                  <span className="font-medium">{user.name || user.email?.split('@')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-6 py-2 rounded-lg hover:bg-purple-100 transition-colors font-medium">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar