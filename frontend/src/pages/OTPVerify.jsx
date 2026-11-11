import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '../api'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 30

export default function OTPVerify({ username, maskedEmail, onVerifySuccess, onBack }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN) // start with initial cooldown
  const [resending, setResending] = useState(false)
  const inputRefs = useRef([])

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const otp = digits.join('')

  function handleInput(index, value) {
    // Accept only digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setApiError('')

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!text) return
    const next = [...digits]
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setDigits(next)
    // Focus last filled or next empty
    const focusIdx = Math.min(text.length, OTP_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (otp.length < OTP_LENGTH) {
      setApiError('Please enter the complete 6-digit code.')
      return
    }
    setLoading(true)
    setApiError('')
    try {
      const res = await api.verifyOTP({ username, otp })
      onVerifySuccess(res.session_token)
    } catch (err) {
      setApiError(err.message)
      // Clear OTP boxes on failure
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    setApiError('')
    try {
      await api.resendOTP({ username })
      setDigits(Array(OTP_LENGTH).fill(''))
      setCooldown(RESEND_COOLDOWN)
      inputRefs.current[0]?.focus()
    } catch (err) {
      setApiError(err.message)
    } finally {
      setResending(false)
    }
  }, [cooldown, resending, username])

  return (
    <div className="auth-wrapper">
      <div className="auth-card otp-card">
        <div className="brand">
          <span className="brand-icon">📧</span>
          <h1 className="brand-name">SecureAuth</h1>
          <p className="brand-tagline">Two-Factor Verification</p>
        </div>

        <div className="otp-info">
          <p>
            A 6-digit code was sent to{' '}
            <strong className="email-highlight">{maskedEmail}</strong>
          </p>
          <p className="otp-sub">Check your inbox and enter the code below. It expires in <strong>2 minutes</strong>.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}

          <div className="otp-inputs">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className={`otp-box${d ? ' otp-filled' : ''}${apiError ? ' otp-error' : ''}`}
                aria-label={`OTP digit ${i + 1}`}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || otp.length < OTP_LENGTH}
          >
            {loading ? <span className="spinner" /> : 'Verify Code'}
          </button>
        </form>

        <div className="resend-section">
          {cooldown > 0 ? (
            <p className="resend-cooldown">
              Resend available in <strong>{cooldown}s</strong>
            </p>
          ) : (
            <button
              className="link-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Sending…' : "Didn't receive it? Resend code"}
            </button>
          )}
        </div>

        <button className="back-btn" onClick={onBack}>
          ← Back to Login
        </button>
      </div>
    </div>
  )
}

