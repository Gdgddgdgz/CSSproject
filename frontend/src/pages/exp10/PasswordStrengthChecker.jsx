import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!password) {
      setAnalysis(null)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.exp10CheckStrength(password)
        setAnalysis(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [password])

  function getLevelClass(level) {
    switch (level) {
      case 'Weak': return 'level-weak'
      case 'Medium': return 'level-medium'
      case 'Strong': return 'level-strong'
      case 'Very Strong': return 'level-very-strong'
      default: return ''
    }
  }

  return (
    <div className="demo-card">
      <div className="demo-header">
        <span className="demo-badge">📊 COMPREHENSIVE AUDIT</span>
        <h3>Real-Time Password Strength Evaluator</h3>
        <p className="demo-sub">
          Analyzes length, entropy (information density), character sets, pattern repetition, and common dictionary vulnerabilities.
        </p>
      </div>

      <div className="field mt-16">
        <label>Enter Candidate Password to Evaluate</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="e.g. Try '123456', 'qwerty', or 'K#9mX$2vL!99'"
          className="code-input text-lg"
        />
      </div>

      {analysis && (
        <div className="strength-results mt-20">
          <div className="meter-header">
            <div>
              <span className="text-secondary text-sm">Classification: </span>
              <strong className={`badge-pill ${getLevelClass(analysis.level)}`}>
                {analysis.level} ({analysis.score} / 100)
              </strong>
            </div>
            <div>
              <span className="text-secondary text-sm">Estimated Entropy: </span>
              <strong>{analysis.entropy_bits} bits</strong>
            </div>
          </div>

          <div className="meter-track mt-8">
            <div
              className={`meter-bar ${getLevelClass(analysis.level)}`}
              style={{ width: `${Math.max(5, analysis.score)}%` }}
            />
          </div>

          {/* Criteria Checklist */}
          <div className="criteria-grid mt-20">
            <div className={`criteria-item ${analysis.checks.length_ok ? 'pass' : 'fail'}`}>
              <span>{analysis.checks.length_ok ? '✅' : '❌'} Minimum 8 characters</span>
            </div>
            <div className={`criteria-item ${analysis.checks.length_12 ? 'pass' : 'fail'}`}>
              <span>{analysis.checks.length_12 ? '✅' : '❌'} Recommended 12+ characters</span>
            </div>
            <div className={`criteria-item ${analysis.checks.has_uppercase ? 'pass' : 'fail'}`}>
              <span>{analysis.checks.has_uppercase ? '✅' : '❌'} Uppercase (A-Z)</span>
            </div>
            <div className={`criteria-item ${analysis.checks.has_lowercase ? 'pass' : 'fail'}`}>
              <span>{analysis.checks.has_lowercase ? '✅' : '❌'} Lowercase (a-z)</span>
            </div>
            <div className={`criteria-item ${analysis.checks.has_digit ? 'pass' : 'fail'}`}>
              <span>{analysis.checks.has_digit ? '✅' : '❌'} Numbers (0-9)</span>
            </div>
            <div className={`criteria-item ${analysis.checks.has_special ? 'pass' : 'fail'}`}>
              <span>{analysis.checks.has_special ? '✅' : '❌'} Symbols (!@#$%^&*)</span>
            </div>
            <div className={`criteria-item ${analysis.checks.no_repeats ? 'pass' : 'fail'}`}>
              <span>{analysis.checks.no_repeats ? '✅' : '❌'} No 3x repeating chars</span>
            </div>
            <div className={`criteria-item ${analysis.checks.no_sequential ? 'pass' : 'fail'}`}>
              <span>{analysis.checks.no_sequential ? '✅' : '❌'} No sequential sequences</span>
            </div>
            <div className={`criteria-item ${analysis.checks.not_common ? 'pass' : 'fail'}`}>
              <span>{analysis.checks.not_common ? '✅' : '❌'} Not in common wordlist</span>
            </div>
          </div>

          {analysis.suggestions.length > 0 && (
            <div className="suggestions-box mt-20">
              <h5>💡 Security Enhancement Recommendations</h5>
              <ul>
                {analysis.suggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
