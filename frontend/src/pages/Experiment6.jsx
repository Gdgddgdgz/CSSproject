import { useState, useCallback } from 'react'
import Register from './Register'
import Login from './Login'
import OTPVerify from './OTPVerify'
import Dashboard from './Dashboard'

export default function Experiment6() {
  const [page, setPage] = useState('login')
  const [pendingUsername, setPendingUsername] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [sessionToken, setSessionToken] = useState(
    () => sessionStorage.getItem('secureauth_token') || ''
  )

  const handleLoginSuccess = useCallback((username, masked) => {
    setPendingUsername(username)
    setMaskedEmail(masked)
    setPage('otp')
  }, [])

  const handleOTPSuccess = useCallback((token) => {
    sessionStorage.setItem('secureauth_token', token)
    setSessionToken(token)
    setPage('dashboard')
  }, [])

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('secureauth_token')
    setSessionToken('')
    setPendingUsername('')
    setMaskedEmail('')
    setPage('login')
  }, [])

  return (
    <div className="experiment-container exp6-container">
      <div className="experiment-header">
        <div className="badge-wrapper">
          <span className="exp-badge">Experiment 6</span>
          <span className="exp-subbadge">Mandatory Two-Factor Authentication</span>
        </div>
        <h2>SecureAuth – Real Email-Based 2FA</h2>
        <p className="experiment-desc">
          Authenticates user through username/password verification followed by a cryptographically secure 6-digit OTP delivered via Gmail SMTP.
        </p>
      </div>

      <div className="exp6-auth-inner">
        {page === 'register' && (
          <Register onNavigateLogin={() => setPage('login')} />
        )}
        {page === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => setPage('register')}
          />
        )}
        {page === 'otp' && (
          <OTPVerify
            username={pendingUsername}
            maskedEmail={maskedEmail}
            onVerifySuccess={handleOTPSuccess}
            onBack={() => setPage('login')}
          />
        )}
        {page === 'dashboard' && (
          <Dashboard token={sessionToken} onLogout={handleLogout} />
        )}
      </div>
    </div>
  )
}

