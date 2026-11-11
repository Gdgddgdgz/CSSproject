export default function ProtocolComparison({ httpResult, httpsResult }) {
  return (
    <div className="demo-card">
      <div className="demo-header">
        <span className="demo-badge">⚖️ SECURITY COMPARISON</span>
        <h3>HTTP vs HTTPS Architectural Matrix</h3>
        <p className="demo-sub">
          Side-by-side analysis of plaintext web communication vs Transport Layer Security (TLS).
        </p>
      </div>

      <div className="table-responsive">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th className="insecure-cell">HTTP (Hypertext Transfer Protocol)</th>
              <th className="secure-cell">HTTPS (HTTP Secure / TLS)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Encryption</strong></td>
              <td className="insecure-cell">❌ None (Transmitted in plaintext)</td>
              <td className="secure-cell">✅ TLS 1.3 Encryption (AES-GCM / ChaCha20)</td>
            </tr>
            <tr>
              <td><strong>Default Port</strong></td>
              <td>Port 80 (TCP)</td>
              <td>Port 443 / 8443 (TCP)</td>
            </tr>
            <tr>
              <td><strong>Confidentiality</strong></td>
              <td className="insecure-cell">❌ Eavesdropping vulnerable (Wireshark reads data)</td>
              <td className="secure-cell">✅ Protected against packet sniffing</td>
            </tr>
            <tr>
              <td><strong>Integrity Protection</strong></td>
              <td className="insecure-cell">❌ No tamper detection (MitM can alter payload)</td>
              <td className="secure-cell">✅ Cryptographic Message Authentication (HMAC / AEAD)</td>
            </tr>
            <tr>
              <td><strong>Entity Authentication</strong></td>
              <td className="insecure-cell">❌ None (Vulnerable to DNS spoofing)</td>
              <td className="secure-cell">✅ X.509 Digital Certificate Verification (CA signed)</td>
            </tr>
            <tr>
              <td><strong>Data In Transit</strong></td>
              <td className="insecure-cell">Exposed headers, cookies, passwords & tokens</td>
              <td className="secure-cell">End-to-end encrypted channel between host and client</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="comparison-live-section mt-24">
        <h4>Live Transmitted State Comparison</h4>
        <div className="comparison-grid">
          <div className="comparison-box insecure-border">
            <h5>HTTP Wire View</h5>
            {httpResult ? (
              <pre className="small-code">{JSON.stringify(httpResult.received, null, 2)}</pre>
            ) : (
              <p className="text-muted">Run HTTP demo to inspect transmitted cleartext.</p>
            )}
          </div>
          <div className="comparison-box secure-border">
            <h5>HTTPS Wire View</h5>
            {httpsResult ? (
              <pre className="small-code">
{`[TLS 1.3 Ciphertext Record]
Key: X25519 Ephemeral
Cipher: AES_256_GCM
Encrypted bytes: 9d7a22ef... [Unreadable]`}
              </pre>
            ) : (
              <p className="text-muted">Run HTTPS demo to inspect encrypted record.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

