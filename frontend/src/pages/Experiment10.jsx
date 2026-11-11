import { useState } from 'react'
import PasswordStrengthChecker from './exp10/PasswordStrengthChecker'
import DictionaryAttackSimulator from './exp10/DictionaryAttackSimulator'
import BruteForceSimulator from './exp10/BruteForceSimulator'
import DefenseComparison from './exp10/DefenseComparison'

export default function Experiment10() {
  const [activeTab, setActiveTab] = useState('strength')

  return (
    <div className="experiment-container">
      <div className="experiment-header">
        <div className="badge-wrapper">
          <span className="exp-badge">Experiment 10</span>
          <span className="exp-subbadge">Cryptography & System Security</span>
        </div>
        <h2>Password Security Evaluation & Attack Simulation</h2>
        <p className="experiment-desc">
          Evaluate password information entropy, simulate controlled dictionary and brute-force cracking on local test credentials, 
          and measure the efficacy of modern cryptographic defenses (bcrypt, rate limiting, and lockout).
        </p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'strength' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('strength')}
        >
          📊 1. Password Strength
        </button>
        <button
          className={`tab-btn ${activeTab === 'dictionary' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('dictionary')}
        >
          📖 2. Dictionary Attack
        </button>
        <button
          className={`tab-btn ${activeTab === 'bruteforce' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('bruteforce')}
        >
          ⚙️ 3. Brute-Force Attack
        </button>
        <button
          className={`tab-btn ${activeTab === 'defense' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('defense')}
        >
          🛡️ 4. Attack vs Defense
        </button>
      </div>

      <div className="tab-content mt-20">
        {activeTab === 'strength' && <PasswordStrengthChecker />}
        {activeTab === 'dictionary' && <DictionaryAttackSimulator />}
        {activeTab === 'bruteforce' && <BruteForceSimulator />}
        {activeTab === 'defense' && <DefenseComparison />}
      </div>
    </div>
  )
}

