import { CircularProgress } from '@mui/material'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { forgotPassword } from '../services/authService'
import { validateEmail } from '../../../shared/utils/validation'

interface ForgotPasswordProps {
  onBackToLogin: () => void
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate email
    const emailError = validateEmail(email.trim())
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await forgotPassword(email.trim())
      setIsEmailSent(true)
      toast.success('Password reset email sent! Please check your inbox.')
    } catch (error: any) {
      console.error('Forgot password error:', error)
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
          <div className="text-green-400 text-6xl mb-4">📧</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Check Your Email
          </h3>
          <p className="text-gray-300 mb-4">
            We've sent a password reset link to{' '}
            <span className="text-green-400 font-semibold">{email}</span>
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Click the link in your email to reset your password. The link will
            expire in 15 min.
          </p>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Back to Login
          </button>
        </div>

        <div className="text-gray-400 text-sm cursor-pointer">
          <p>Didn't receive the email? Check your spam folder or</p>
          <button
            type="button"
            onClick={() => setIsEmailSent(false)}
            className="text-green-400 hover:text-green-300 underline"
          >
            try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Forgot Password?</h3>
        <p className="text-gray-400">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2 text-left"
          >
            Email address
          </label>
          <input
            type="email"
            id="email"
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-gray-400 transition-all ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-700 focus:ring-teal-500'
            }`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            required
          />
          {error && (
            <p className="text-red-400 text-sm mt-2 text-left">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <CircularProgress size={20} color="inherit" className="mr-2" />
              Sending...
            </div>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <div className="text-gray-400 text-sm ">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-teal-400 hover:text-teal-300 underline cursor-pointer "
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}
