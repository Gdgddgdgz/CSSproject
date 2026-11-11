import { useState } from 'react'
import { api } from '../../api'

export default function DefenseComparison() {
  const [targetPassword] = useState('SecretMasterKey2026')
  const [candidatePassword, setCandidatePassword] = useState('wrong_guess_1')
  const [unprotectedLogs, setUnprotectedLogs] = useState([])
  const [protectedLogs, setProtectedLogs] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleTest(mode) {
    setLoading(true)
    try {
      const res = await api.exp10DefenseTest({
        target_password: targetPassword,
        candidate_password: candidatePassword,
        mode: mode,
        client_id: 'lab-student-client',
      })
      const entry = { ...res, timestamp: new Date().toLocaleTimeString(), guess: candidatePassword }
      if (mode === 'unprotected') {
        setUnprotectedLogs((prev) => [entry, ...prev.slice(0, 9)])
      } else {
        setProtectedLogs((prev) => [entry, ...prev.slice(0, 9)])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetDefense() {
    try {
      await api.exp10DefenseReset()
      setProtectedLogs([])
      setUnprotectedLogs([])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="demo-card">
      <div className="demo-header">
        <span className="demo-badge">🛡️ ACTIVE DEFENSIVE MECHANISMS</span>
        <h3>Online Attack Mitigation: Rate Limiting & Account Lockout</h3>
        <p className="demo-sub">
          Compares an unprotected authentication endpoint with an enterprise-hardened endpoint employing bcrypt, attempt throttling, and temporary lockout.
        </p>
      </div>

      <div className="field mt-16">
        <label>Candidate Guess to Submit (Target: "SecretMasterKey2026")</label>
        <div className="input-group">
          <input
            type="text"
            value={candidatePassword}
            onChange={(e) => setCandidatePassword(e.target.value)}
            className="code-input"
          />
          <button
            type="button"
            className="btn btn-sm btn-outline ml-8"
            onClick={() => setCandidatePassword('SecretMasterKey2026')}
          >
            Insert Correct Password
          </button>
        </div>
      </div>

      <div className="actions-row mt-16">
        <button
          type="button"
          className="btn btn-warning"
          onClick={() => handleTest('unprotected')}
          disabled={loading}
        >
          Submit to Unprotected Endpoint
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleTest('protected')}
          disabled={loading}
        >
          Submit to Protected Endpoint (bcrypt + Lockout)
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleResetDefense}
        >
          Reset Lockout State
        </button>
      </div>

      {/* Side-by-side comparison panels */}
      <div className="comparison-grid mt-24">
        {/* Unprotected Panel */}
        <div className="comparison-box insecure-border">
          <div className="panel-title-row">
            <h5>⚠️ Unprotected Server</h5>
            <span className="badge-tag insecure-tag">Vulnerable to Online Brute-Force</span>
          </div>
          <p className="panel-desc">
            No lockout, no delay. Attacker can fire thousands of HTTP POST requests per second until the password is guessed.
          </p>
          <div className="log-container">
            {unprotectedLogs.length === 0 ? (
              <p className="text-muted">No requests sent yet.</p>
            ) : (
              unprotectedLogs.map((log, idx) => (
                <div key={idx} className="log-entry log-fail">
                  <span>[{log.timestamp}] Guess: "{log.guess}"</span>
                  <strong>{log.message} ({log.time_taken_ms}ms)</strong>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Protected Panel */}
        <div className="comparison-box secure-border">
          <div className="panel-title-row">
            <h5>🔒 Protected Server (SecureAuth)</h5>
            <span className="badge-tag secure-tag">Enterprise Hardened</span>
          </div>
          <p className="panel-desc">
            bcrypt deliberate delay (~100ms) + 5-attempt limit followed by a 15-second lockout period.
          </p>
          <div className="log-container">
            {protectedLogs.length === 0 ? (
              <p className="text-muted">No requests sent yet.</p>
            ) : (
              protectedLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`log-entry ${
                    log.status === 'locked' ? 'log-locked' : log.status === 'success' ? 'log-success' : 'log-fail'
                  }`}
                >
                  <span>[{log.timestamp}] Guess: "{log.guess}"</span>
                  <strong>{log.message}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
