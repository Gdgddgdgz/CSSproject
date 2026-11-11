export default function TLSInformation() {
  return (
    <div className="demo-card">
      <div className="demo-header">
        <span className="demo-badge">🔐 CRYPTOGRAPHIC SPECIFICATION</span>
        <h3>Transport Layer Security (TLS 1.3) Architecture</h3>
        <p className="demo-sub">
          Detailed cryptographic handshake, cipher suites, and local Wireshark inspection guidelines.
        </p>
      </div>

      <div className="tls-details-grid">
        <div className="tls-card">
          <h4>1. The 1-RTT TLS 1.3 Handshake</h4>
          <ol className="step-list">
            <li><strong>ClientHello:</strong> Supported ciphers + key share (Diffie-Hellman public key).</li>
            <li><strong>ServerHello:</strong> Server selects cipher suite + returns its key share.</li>
            <li><strong>Certificate & Verify:</strong> Server transmits its X.509 certificate and digital signature.</li>
            <li><strong>Finished:</strong> Both parties derive shared symmetric encryption keys and commence encrypted communication.</li>
          </ol>
        </div>

        <div className="tls-card">
          <h4>2. Active Cipher Suite Breakdown</h4>
          <div className="cipher-pill-container">
            <span className="cipher-pill">TLS_AES_256_GCM_SHA384</span>
          </div>
          <ul className="spec-list mt-12">
            <li><strong>Key Exchange:</strong> Ephemeral Diffie-Hellman (ECDHE / X25519) providing Perfect Forward Secrecy (PFS).</li>
            <li><strong>Bulk Encryption:</strong> AES in Galois/Counter Mode (256-bit key).</li>
            <li><strong>Integrity:</strong> Authenticated Encryption with Associated Data (AEAD).</li>
            <li><strong>Hash Function:</strong> SHA-384 cryptographic digest.</li>
          </ul>
        </div>
      </div>

      <div className="wireshark-guide mt-24">
        <h4>🦈 Wireshark Traffic Inspection Guide</h4>
        <p className="text-secondary mb-12">
          Verify the security difference between HTTP and HTTPS on your local adapter (Npcap / Loopback):
        </p>
        
        <div className="guide-steps">
          <div className="guide-step">
            <span className="guide-num">Step 1</span>
            <div>
              <strong>Open Wireshark & Select Adapter:</strong>
              <p>Choose <code>Adapter for loopback traffic capture</code> or your active local network interface.</p>
            </div>
          </div>
          <div className="guide-step">
            <span className="guide-num">Step 2</span>
            <div>
              <strong>Filter HTTP Plaintext Traffic:</strong>
              <p>Apply filter: <code>http && tcp.port == 8000</code>. Right-click any packet &rarr; <em>Follow &rarr; TCP Stream</em>. Notice username and password fields are fully visible in red ASCII.</p>
            </div>
          </div>
          <div className="guide-step">
            <span className="guide-num">Step 3</span>
            <div>
              <strong>Filter HTTPS TLS Encrypted Traffic:</strong>
              <p>Apply filter: <code>tls && tcp.port == 8443</code>. You will see <code>Client Hello</code>, <code>Server Hello</code>, and subsequently only opaque <code>Application Data</code> records.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

