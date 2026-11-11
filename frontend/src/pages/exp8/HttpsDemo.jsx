import { useState } from 'react'
import { api } from '../../api'

export default function HttpsDemo({ onResultUpdate }) {
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
      const res = await api.exp8HttpsDemo({ username, message })
      setResult(res)
      if (onResultUpdate) onResultUpdate('https', res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="demo-card">
      <div className="demo-header secure-header">
        <span className="demo-badge secure-badge">🔒 SECURE HTTPS / TLS</span>
        <h3>Encrypted HTTPS Request Demo</h3>
        <p className="demo-sub">
          Establishes a TLS cryptographic tunnel. Application records are ciphertext on the wire.
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

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Send via HTTPS (TLS 1.3 / Port 8443)'}
        </button>
      </form>

      {error && <div className="alert alert-error mt-16">⚠️ {error}</div>}

      {result && (
        <div className="result-container mt-16">
          <div className="result-title">
            <span>🛡️ Intercepted Wire Representation (Ciphertext)</span>
            <span className="badge-tag secure-tag">Encrypted via TLS 1.3</span>
          </div>

          <pre className="code-block secure-block">
{`TLSv1.3 Record Layer: Application Data Protocol: Hypertext Transfer Protocol
[Encrypted Application Data: 7f3b89a01e42a9b3d58ef1092a40b912c77... (AES-256-GCM)]
[Authentication Tag: 4c9a80e121bc823d (AEAD Integrity verified)]

(Decrypted Server Response):
{
  "status": ${result.status},
  "protocol": "${result.protocol}",
  "transport": "${result.transport}",
  "received_user": "${result.received?.username}"
}`}
          </pre>

          <div className="security-alert-box alert-success-box">
            <strong>🟢 Sniffer / Attacker View:</strong> The network observer only sees pseudo-random ciphertext and TLS record headers. Confidentiality and message authenticity are mathematically guaranteed by AES-256-GCM.
          </div>
        </div>
      )}
    </div>
  )
}
