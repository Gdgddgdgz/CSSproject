import { useState } from 'react'
import ExperimentsPortal from './pages/ExperimentsPortal'
import Experiment6 from './pages/Experiment6'
import Experiment8 from './pages/Experiment8'
import Experiment10 from './pages/Experiment10'
import './App.css'

function App() {
  const [currentExp, setCurrentExp] = useState('portal')

  const getExperimentMeta = () => {
    switch (currentExp) {
      case 'exp6':
        return {
          title: 'Experiment 6',
          name: 'Two-Factor Authentication (Real Gmail OTP)',
          badge: 'Mandatory 2FA',
        }
      case 'exp8':
        return {
          title: 'Experiment 8',
          name: 'HTTP vs HTTPS Security Analysis (TLS 1.3)',
          badge: 'Transport Security',
        }
      case 'exp10':
        return {
          title: 'Experiment 10',
          name: 'Password Strength & Attack Simulation',
          badge: 'Cryptanalysis & Defense',
        }
      default:
        return null
    }
  }

  const meta = getExperimentMeta()

  return (
    <div className="app-shell">
      {/* Dynamic Header */}
      <header className="main-navbar">
        <div className="nav-brand" onClick={() => setCurrentExp('portal')} style={{ cursor: 'pointer' }}>
          <span className="brand-icon">🔐</span>
          <div className="brand-text">
            <span className="brand-title">SecureAuth</span>
            <span className="brand-subtitle">Cryptography & System Security Suite</span>
          </div>
        </div>

        {currentExp !== 'portal' ? (
          <div className="nav-module-breadcrumb">
            <button
              className="btn btn-sm btn-outline back-portal-btn"
              onClick={() => setCurrentExp('portal')}
            >
              ← Back to Experiment Hub
            </button>
            <div className="active-exp-pill">
              <span className="pill-prefix">{meta.title}:</span>
              <span className="pill-name">{meta.name}</span>
            </div>
          </div>
        ) : (
          <div className="nav-status-badge">
            <span className="status-indicator"></span>
            <span>Local API Connected (Port 8000)</span>
          </div>
        )}
      </header>

      {/* Main Viewport */}
      <main className="main-viewport">
        {currentExp === 'portal' && (
          <ExperimentsPortal onSelectExperiment={(id) => setCurrentExp(id)} />
        )}
        {currentExp === 'exp6' && <Experiment6 />}
        {currentExp === 'exp8' && <Experiment8 />}
        {currentExp === 'exp10' && <Experiment10 />}
      </main>
    </div>
  )
}

export default App
