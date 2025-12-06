import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import SignupForm from '../components/SignupForm'

const Signup = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (formData) => {
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <SignupForm onSubmit={handleSignup} loading={loading} error={error} />
    </div>
  )
}

export default Signup