export default function ExperimentsPortal({ onSelectExperiment }) {
  const experiments = [
    {
      id: 'exp6',
      number: 'Experiment 6',
      tag: 'Mandatory 2FA',
      tagType: 'badge-blue',
      title: 'Two-Factor Authentication',
      subtitle: 'Username/Password + Real Gmail OTP Delivery',
      icon: '🔐',
      description:
        'Dual-stage identity verification. Stores bcrypt salted password hashes, issues cryptographically secure 6-digit one-time tokens, and dispatches them via Gmail SMTP with automated expiration and brute-force mitigation.',
      highlights: ['bcrypt Hashing', 'Real Gmail SMTP', '2-Min Expiration', '5-Attempt Lockout'],
      actionText: 'Launch 2FA Authentication Portal →',
    },
    {
      id: 'exp8',
      number: 'Experiment 8',
      tag: 'TLS 1.3 Transport Security',
      tagType: 'badge-cyan',
      title: 'HTTP vs HTTPS Security Analysis',
      subtitle: 'Plaintext Vulnerability vs TLS Cryptographic Protection',
      icon: '🌐',
      description:
        'Demonstrates cleartext network eavesdropping on standard HTTP communication versus end-to-end encryption, data integrity, and X.509 certificate authentication using modern TLS 1.3 tunnels.',
      highlights: ['Wire Inspection', 'AES-256-GCM AEAD', 'Localhost X.509 Cert', 'Wireshark Guide'],
      actionText: 'Launch Network Security Lab →',
    },
    {
      id: 'exp10',
      number: 'Experiment 10',
      tag: 'Cryptanalysis & Defense',
      tagType: 'badge-purple',
      title: 'Password Attacks & Mitigations',
      subtitle: 'Entropy Assessment, Cracking Simulation & Throttling',
      icon: '🛡️',
      description:
        'Evaluates candidate password information entropy, simulates controlled offline dictionary attacks and bounded combinatorial brute-force searches, and measures enterprise rate limiting and lockout defenses.',
      highlights: ['Live Entropy Bits', 'Offline Wordlist Crack', 'Brute-Force (|Σ|^L)', 'Account Lockout'],
      actionText: 'Launch Password Security Lab →',
    },
  ]

  return (
    <div className="portal-container">
      {/* Central Hero Header */}
      <div className="portal-hero">
        <div className="hero-pill">
          <span className="pulse-dot"></span>
          <span>Cryptography & System Security Laboratory</span>
        </div>
        <h1 className="hero-title">
          SecureAuth <span className="hero-title-accent">Cybersecurity Suite</span>
        </h1>
        <p className="hero-subtitle">
          An interactive, enterprise-grade practical platform demonstrating multi-factor authentication, 
          transport layer cryptographic channels, and cryptanalytic attack simulation with modern defensive controls.
        </p>

        <div className="hero-meta-bar">
          <div className="meta-item">
            <span className="meta-label">Environment</span>
            <span className="meta-val">Localhost Isolated</span>
          </div>
          <div className="meta-divider"></div>
          <div className="meta-item">
            <span className="meta-label">Backend Engine</span>
            <span className="meta-val">FastAPI + Python 3.13</span>
          </div>
          <div className="meta-divider"></div>
          <div className="meta-item">
            <span className="meta-label">Cipher Primitives</span>
            <span className="meta-val">bcrypt · AES-GCM · TLS 1.3</span>
          </div>
          <div className="meta-divider"></div>
          <div className="meta-item">
            <span className="meta-label">Active Modules</span>
            <span className="meta-val">Exp 6 · Exp 8 · Exp 10</span>
          </div>
        </div>
      </div>

      {/* Central Interactive Experiment Cards */}
      <div className="portal-cards-grid">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            className="portal-card"
            onClick={() => onSelectExperiment(exp.id)}
          >
            <div className="card-top">
              <div className="card-icon-box">{exp.icon}</div>
              <div className="card-badges">
                <span className="card-exp-num">{exp.number}</span>
                <span className={`card-tag ${exp.tagType}`}>{exp.tag}</span>
              </div>
            </div>

            <h3 className="card-title">{exp.title}</h3>
            <p className="card-subtitle">{exp.subtitle}</p>
            <p className="card-desc">{exp.description}</p>

            <div className="card-highlights">
              {exp.highlights.map((h, i) => (
                <span key={i} className="highlight-pill">
                  ✓ {h}
                </span>
              ))}
            </div>

            <div className="card-action">
              <span>{exp.actionText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="portal-footer">
        <p>
          SecureAuth Laboratory Platform · Designed for Cryptography & System Security Practicals
        </p>
      </div>
    </div>
  )
}

