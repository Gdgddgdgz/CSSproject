import { useState } from 'react'
import { api } from '../../api'

export default function HttpDemo({ onResultUpdate }) {
  const [username, setUsername] = useState('alice_network')
  const [message, setMessage] = useState('Confidential Project Alpha credentials: Pass123!')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleSend(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.exp8HttpDemo({ username, message })
      setResult(res)
      if (onResultUpdate) onResultUpdate('http', res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="demo-card">
      <div className="demo-header insecure-header">
        <span className="demo-badge insecure-badge">⚠️ INSECURE HTTP</span>
        <h3>Plaintext HTTP Request Demo</h3>
        <p className="demo-sub">
          Transmits credentials and payload in cleartext without Transport Layer Security (TLS).
        </p>
      </div>

      <form onSubmit={handleSend} className="demo-form">
        <div className="field">
          <label>Simulated Username / Identifier</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Sensitive Message / Payload to Transmit</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="code-input"
          />
        </div>

        <button type="submit" className="btn btn-warning" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Send via HTTP (Port 8000)'}
        </button>
      </form>

      {error && <div className="alert alert-error mt-16">⚠️ {error}</div>}

      {result && (
        <div className="result-container mt-16">
          <div className="result-title">
            <span>📡 Intercepted Wire Representation (Plaintext)</span>
            <span className="badge-tag insecure-tag">Unencrypted</span>
          </div>
          
          <pre className="code-block insecure-block">
{`POST /exp8/http-demo HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Connection: keep-alive

{
  "username": "${result.received.username}",
  "message": "${result.received.message}"
}`}
          </pre>

          <div className="security-alert-box alert-danger">
            <strong>🔴 Sniffer / Attacker View:</strong> Because HTTP lacks transport encryption, any network intermediary (Wi-Fi eavesdropper, malicious router, ISP) captures the sensitive message in 100% human-readable plaintext.
          </div>
        </div>
      )}
    </div>
  )
}
