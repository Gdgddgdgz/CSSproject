import { useState } from 'react'
import HttpDemo from './exp8/HttpDemo'
import HttpsDemo from './exp8/HttpsDemo'
import ProtocolComparison from './exp8/ProtocolComparison'
import TLSInformation from './exp8/TLSInformation'

export default function Experiment8() {
  const [activeTab, setActiveTab] = useState('http')
  const [httpResult, setHttpResult] = useState(null)
  const [httpsResult, setHttpsResult] = useState(null)

  function handleResultUpdate(type, data) {
    if (type === 'http') setHttpResult(data)
    if (type === 'https') setHttpsResult(data)
  }

  return (
    <div className="experiment-container">
      <div className="experiment-header">
        <div className="badge-wrapper">
          <span className="exp-badge">Experiment 8</span>
          <span className="exp-subbadge">Cryptography & Network Security</span>
        </div>
        <h2>HTTP vs HTTPS Security Analysis using TLS</h2>
        <p className="experiment-desc">
          Demonstrate the vulnerability of cleartext transport protocols (HTTP) against network eavesdropping, 
          and evaluate the confidentiality, integrity, and authentication guarantees established by TLS 1.3.
        </p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'http' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('http')}
        >
          📡 1. HTTP Insecure Test
        </button>
        <button
          className={`tab-btn ${activeTab === 'https' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('https')}
        >
          🔒 2. HTTPS TLS Test
        </button>
        <button
          className={`tab-btn ${activeTab === 'comparison' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          ⚖️ 3. Protocol Comparison
        </button>
        <button
          className={`tab-btn ${activeTab === 'tls' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tls')}
        >
          🔍 4. TLS & Wireshark Specs
        </button>
      </div>

      <div className="tab-content mt-20">
        {activeTab === 'http' && <HttpDemo onResultUpdate={handleResultUpdate} />}
        {activeTab === 'https' && <HttpsDemo onResultUpdate={handleResultUpdate} />}
        {activeTab === 'comparison' && (
          <ProtocolComparison httpResult={httpResult} httpsResult={httpsResult} />
        )}
        {activeTab === 'tls' && <TLSInformation />}
      </div>
    </div>
  )
}

