import { useState } from 'react'
import { api } from '../api'

export default function Register({ onNavigateLogin }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required.'
    else if (form.username.length < 3) e.username = 'At least 3 characters.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
    else if (form.password.length < 8) e.password = 'At least 8 characters.'
    if (!form.confirm_password) e.confirm_password = 'Please confirm your password.'
    else if (form.password !== form.confirm_password)
      e.confirm_password = 'Passwords do not match.'
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
      const res = await api.register(form)
      setSuccess(res.message)
      setForm({ username: '', email: '', password: '', confirm_password: '' })
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
          <p className="brand-tagline">Create your secure account</p>
        </div>

        {success ? (
          <div className="alert alert-success">
            <span>✅ {success}</span>
            <button className="btn btn-primary mt-16" onClick={onNavigateLogin}>
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}

            <div className="field">
              <label>Username</label>
              <input
                name="username"
                type="text"
                autoComplete="username"
                placeholder="e.g. john_doe"
                value={form.username}
                onChange={handleChange}
                className={errors.username ? 'input-error' : ''}
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="field">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <input
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirm_password}
                onChange={handleChange}
                className={errors.confirm_password ? 'input-error' : ''}
              />
              {errors.confirm_password && (
                <span className="field-error">{errors.confirm_password}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>
        )}

        {!success && (
          <p className="nav-link">
            Already have an account?{' '}
            <button className="link-btn" onClick={onNavigateLogin}>
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

