import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function DictionaryAttackSimulator() {
  const [wordlist, setWordlist] = useState([])
  const [targetPassword, setTargetPassword] = useState('password123')
  const [useHash, setUseHash] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadWordlist() {
      try {
        const res = await api.exp10GetWordlist()
        setWordlist(res.wordlist || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadWordlist()
  }, [])

  async function handleAttack(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.exp10DictionaryAttack({
        target_password: targetPassword,
        use_hash: useHash,
      })
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="demo-card">
      <div className="demo-header">
        <span className="demo-badge">📖 DICTIONARY ATTACK SIMULATOR</span>
        <h3>Controlled Offline Wordlist Attack</h3>
        <p className="demo-sub">
          Demonstrates how attackers iterate through predefined common passwords and compares plaintext speed vs bcrypt key-stretching.
        </p>
      </div>

      <form onSubmit={handleAttack} className="demo-form mt-16">
        <div className="field">
          <label>Target Test Credential (Select preset or enter custom)</label>
          <div className="preset-buttons mb-8">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setTargetPassword('password123')}
            >
              Preset: "password123" (In list)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setTargetPassword('superman')}
            >
              Preset: "superman" (In list)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setTargetPassword('X#9vL_k8!2026')}
            >
              Preset: "X#9vL_k8!2026" (Not in list)
            </button>
          </div>
          <input
            type="text"
            value={targetPassword}
            onChange={(e) => setTargetPassword(e.target.value)}
            required
            className="code-input"
          />
        </div>

        <div className="checkbox-field mb-16">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useHash}
              onChange={(e) => setUseHash(e.target.checked)}
            />
            <span>Simulate attacking a <strong>bcrypt hash</strong> (adds key-stretching delay)</span>
          </label>
        </div>

        <button type="submit" className="btn btn-warning" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Launch Controlled Dictionary Simulation'}
        </button>
      </form>

      {error && <div className="alert alert-error mt-16">⚠️ {error}</div>}

      {result && (
        <div className="result-container mt-20">
          <div className={`result-banner ${result.found ? 'attack-success' : 'attack-failed'}`}>
            <span className="banner-icon">{result.found ? '💥' : '🛡️'}</span>
            <div>
              <h4>{result.found ? 'Target Password Discovered!' : 'Attack Exhausted — Password Not Found'}</h4>
              <p>
                {result.found
                  ? `Match discovered: "${result.matched_word}" after ${result.attempts} dictionary attempts.`
                  : `Tested all ${result.wordlist_size} entries without discovering a match.`}
              </p>
            </div>
          </div>

          <div className="stats-grid mt-16">
            <div className="stat-card">
              <span className="stat-label">Total Attempts</span>
              <strong className="stat-val">{result.attempts} / {result.wordlist_size}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Execution Time</span>
              <strong className="stat-val">{result.elapsed_seconds}s</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Mode Evaluated</span>
              <strong className="stat-val">{result.mode === 'bcrypt_hash' ? 'bcrypt Cost Factor' : 'Plaintext Match'}</strong>
            </div>
          </div>

          <div className="security-alert-box alert-info mt-16">
            <strong>💡 Cryptographic Takeaway:</strong> {result.security_note}
          </div>
        </div>
      )}
    </div>
  )
}
