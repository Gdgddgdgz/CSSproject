import { useState } from 'react'
import { api } from '../../api'

export default function BruteForceSimulator() {
  const [targetPassword, setTargetPassword] = useState('7a9')
  const [charsetName, setCharsetName] = useState('alphanumeric')
  const [maxLength, setMaxLength] = useState(3)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleAttack(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.exp10BruteForce({
        target_password: targetPassword,
        charset_name: charsetName,
        max_length: parseInt(maxLength, 10),
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
        <span className="demo-badge">⚙️ EXHAUSTIVE SEARCH SIMULATOR</span>
        <h3>Bounded Brute-Force Mathematical Model</h3>
        <p className="demo-sub">
          Generates permutation candidates across character sets. Demonstrates the exponential search space growth: |Σ|<sup>L</sup>.
        </p>
      </div>

      <form onSubmit={handleAttack} className="demo-form mt-16">
        <div className="field">
          <label>Target Short Test Password (Max 4 chars for laptop safety)</label>
          <div className="preset-buttons mb-8">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => { setTargetPassword('92'); setMaxLength(2); }}
            >
              Preset: "92" (2 digits)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => { setTargetPassword('cat'); setMaxLength(3); }}
            >
              Preset: "cat" (3 lowercase)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => { setTargetPassword('4x9'); setMaxLength(3); }}
            >
              Preset: "4x9" (3 alphanumeric)
            </button>
          </div>
          <input
            type="text"
            value={targetPassword}
            onChange={(e) => setTargetPassword(e.target.value)}
            maxLength={4}
            required
            className="code-input"
          />
        </div>

        <div className="grid-2col">
          <div className="field">
            <label>Alphabet / Character Set (|Σ|)</label>
            <select
              value={charsetName}
              onChange={(e) => setCharsetName(e.target.value)}
              className="select-input"
            >
              <option value="digits">Digits (0-9) — Size: 10</option>
              <option value="lowercase">Lowercase (a-z) — Size: 26</option>
              <option value="alphanumeric">Alphanumeric (a-z, 0-9) — Size: 36</option>
              <option value="mixed">Mixed (A-Z, a-z, 0-9) — Size: 62</option>
            </select>
          </div>

          <div className="field">
            <label>Max Search Depth / Length Limit (L)</label>
            <select
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              className="select-input"
            >
              <option value="2">Up to 2 characters</option>
              <option value="3">Up to 3 characters</option>
              <option value="4">Up to 4 characters</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-danger" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Run Bounded Brute-Force'}
        </button>
      </form>

      {error && <div className="alert alert-error mt-16">⚠️ {error}</div>}

      {result && (
        <div className="result-container mt-20">
          <div className={`result-banner ${result.found ? 'attack-success' : 'attack-failed'}`}>
            <span className="banner-icon">{result.found ? '🎯' : '🛑'}</span>
            <div>
              <h4>{result.found ? 'Candidate Discovered by Combinatorial Search!' : 'Halted or Target Outside Search Space'}</h4>
              <p>
                {result.found
                  ? `Matched: "${result.matched}" in ${result.attempts.toLocaleString()} generation cycles.`
                  : `Halt trigger: ${result.stopped_reason} after ${result.attempts.toLocaleString()} attempts.`}
              </p>
            </div>
          </div>

          <div className="stats-grid mt-16">
            <div className="stat-card">
              <span className="stat-label">Evaluated Candidates</span>
              <strong className="stat-val">{result.attempts.toLocaleString()}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Theoretical Space</span>
              <strong className="stat-val">{result.search_space.toLocaleString()}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Execution Time</span>
              <strong className="stat-val">{result.elapsed_seconds}s</strong>
            </div>
          </div>

          <div className="security-alert-box alert-info mt-16">
            <strong>📐 Combinatorial Complexity:</strong> {result.security_note}
          </div>
        </div>
      )}
    </div>
  )
}
