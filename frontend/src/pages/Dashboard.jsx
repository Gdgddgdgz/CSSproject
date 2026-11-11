import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Dashboard({ token, onLogout }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchDashboard() {
      try {
        const res = await api.dashboard(token)
        if (!cancelled) setUser(res)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }
    fetchDashboard()
    return () => { cancelled = true }
  }, [token])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await api.logout(token)
    } catch {
      // Even if the API call fails, clear the local session
    } finally {
      onLogout()
    }
  }

  if (error) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="alert alert-error">⚠️ {error}</div>
          <button className="btn btn-primary mt-16" onClick={onLogout}>
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card center-content">
          <span className="spinner spinner-lg" />
          <p className="loading-text">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrapper dashboard-wrapper">
      <div className="dashboard-card">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-brand">
            <span className="brand-icon">🔐</span>
            <span className="brand-name">SecureAuth</span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Signing out…' : 'Logout'}
          </button>
        </div>

        {/* Success banner */}
        <div className="success-banner">
          <div className="success-icon-wrap">
            <span className="success-icon">✅</span>
          </div>
          <div>
            <h2 className="success-title">Authentication Successful</h2>
            <p className="success-sub">Two-factor authentication was verified successfully.</p>
          </div>
        </div>

        {/* Welcome card */}
        <div className="welcome-card">
          <div className="avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="welcome-info">
            <h3 className="welcome-name">Welcome back, {user.username}!</h3>
            <p className="welcome-email">{user.email}</p>
          </div>
        </div>

        {/* Security summary */}
        <div className="security-grid">
          <div className="security-item">
            <span className="sec-icon">🔑</span>
            <div>
              <p className="sec-label">Step 1 — Password</p>
              <p className="sec-status verified">Verified</p>
            </div>
          </div>
          <div className="security-item">
            <span className="sec-icon">📧</span>
            <div>
              <p className="sec-label">Step 2 — Email OTP</p>
              <p className="sec-status verified">Verified</p>
            </div>
          </div>
          <div className="security-item">
            <span className="sec-icon">🛡️</span>
            <div>
              <p className="sec-label">Session</p>
              <p className="sec-status verified">Active (8h)</p>
            </div>
          </div>
        </div>

        <p className="dashboard-msg">{user.message}</p>
      </div>
    </div>
  )
}

