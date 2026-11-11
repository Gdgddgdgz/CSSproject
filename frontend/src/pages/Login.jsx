import { useState } from 'react'
import { api } from '../api'

export default function Login({ onLoginSuccess, onNavigateRegister }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required.'
    if (!form.password) e.password = 'Password is required.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    setApiError('')
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      const res = await api.login(form)
      onLoginSuccess(form.username, res.masked_email)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: '' }))
    setApiError('')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-icon">🔐</span>
          <h1 className="brand-name">SecureAuth</h1>
          <p className="brand-tagline">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}

          <div className="field">
            <label>Username</label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Your username"
              value={form.username}
              onChange={handleChange}
              className={errors.username ? 'input-error' : ''}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="nav-link">
          Don&apos;t have an account?{' '}
          <button className="link-btn" onClick={onNavigateRegister}>
            Register
          </button>
        </p>

        <div className="info-box">
          <span className="info-icon">🛡️</span>
          <span>After sign-in, a one-time code will be sent to your registered email address for two-factor verification.</span>
        </div>
      </div>
    </div>
  )
}

