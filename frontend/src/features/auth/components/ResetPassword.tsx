'use client'

import type React from 'react'

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { resetPassword } from '../services/authService'

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') // get token from URL

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    try {
      await resetPassword(token, password)
      console.log('password reset success')
      setPassword('')
      setIsSuccess(true)
      setMessage(
        'Password reset successfully! You can now log in with your new password.'
      )
    } catch (err: any) {
      console.error(err)
      setMessage(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 w-full max-w-md mx-4"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-white">
          Reset Password
        </h2>

        <p className="text-slate-400 text-center mb-8">
          Enter your new password below
        </p>

        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter your new password"
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSuccess}
          />
        </div>

        <button
          type="submit"
          disabled={loading || isSuccess}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Resetting...'
            : isSuccess
            ? 'Password Reset!'
            : 'Reset Password'}
        </button>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              isSuccess ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Remember your password?{' '}
            <a
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Log in
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}

export default ResetPassword
