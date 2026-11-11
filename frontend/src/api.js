/**
 * Centralised API client.
 * All requests go through here – the base URL can be changed in one place.
 */

const BASE_URL = 'http://localhost:8000'

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    // FastAPI validation errors return detail as an array of objects
    let msg
    if (Array.isArray(data?.detail)) {
      msg = data.detail.map((e) => e.msg?.replace('Value error, ', '') || JSON.stringify(e)).join(' · ')
    } else {
      msg = data?.detail || `HTTP ${res.status}`
    }
    throw new Error(msg)
  }
  return data
}

export const api = {
  // Experiment 6 (Preserved)
  register: (body) => request('POST', '/register', body),
  login: (body) => request('POST', '/login', body),
  verifyOTP: (body) => request('POST', '/verify-otp', body),
  resendOTP: (body) => request('POST', '/resend-otp', body),
  dashboard: (token) => request('GET', '/dashboard', null, token),
  logout: (token) => request('POST', '/logout', null, token),

  // Experiment 8 – HTTP vs HTTPS
  exp8HttpDemo: (body) => request('POST', '/exp8/http-demo', body),
  exp8HttpsDemo: async (body) => {
    // Try genuine HTTPS endpoint on 8443 first; if self-signed cert is rejected or server is not on 8443,
    // fallback gracefully to HTTP backend demo route which returns TLS structure
    try {
      const res = await fetch('https://localhost:8443/exp8/https-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) return await res.json()
    } catch {
      // Fallback through local HTTP backend route (which demonstrates TLS parameters)
    }
    return request('POST', '/exp8/https-demo', body)
  },

  // Experiment 10 – Password Evaluation & Attack Simulations
  exp10CheckStrength: (password) => request('POST', '/exp10/check-strength', { password }),
  exp10GetWordlist: () => request('GET', '/exp10/wordlist'),
  exp10DictionaryAttack: (body) => request('POST', '/exp10/dictionary-attack', body),
  exp10GetCharsets: () => request('GET', '/exp10/charsets'),
  exp10BruteForce: (body) => request('POST', '/exp10/brute-force', body),
  exp10DefenseTest: (body) => request('POST', '/exp10/defense-test', body),
  exp10DefenseReset: () => request('POST', '/exp10/defense-reset'),
}

