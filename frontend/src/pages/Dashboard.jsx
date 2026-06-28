import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const API_URL = import.meta.env.VITE_API_URL
const DEMO_PRESETS = [
  {
    name: 'Stripe API Docs',
    logo: '💳',
    url: 'https://stripe.com/docs/api',
    color: 'rgba(99, 91, 255, 0.1)',
    borderColor: '#635bff',
    description: 'Payments, subscriptions, and invoicing suite.'
  },
  {
    name: 'GitHub REST API',
    logo: '🐙',
    url: 'https://docs.github.com/en/rest',
    color: 'rgba(255, 255, 255, 0.05)',
    borderColor: '#a1a1aa',
    description: 'Repositories, issues, and pull request controls.'
  },
  {
    name: 'Twilio SMS API',
    logo: '💬',
    color: 'rgba(242, 47, 70, 0.1)',
    borderColor: '#f22f46',
    description: 'Telephony, text messaging, and MFA relays.',
    disabled: true
  },
  {
    name: 'Slack Web API',
    logo: '💬',
    color: 'rgba(74, 21, 75, 0.1)',
    borderColor: '#e01e5a',
    description: 'Bots, interactive channels, and webhook alerts.',
    disabled: true
  }
]

const LOADING_STEPS = [
  "Scraping document trees with BeautifulSoup4...",
  "Formatting plaintext headers, code fragments & nodes...",
  "Consulting Gemini 1.5 API to extract schema patterns...",
  "Synthesizing readiness score and complexity vectors...",
  "Drafting custom integration roadmap checklists...",
  "Compiling helper Python SDK classes...",
  "Writing developer README markdown guide...",
  "Saving compiled database records to SQLite..."
]

export default function Dashboard() {
  const [url, setUrl] = useState('')
  const [intendedUseCase, setIntendedUseCase] = useState('')
  const [programmingLanguage, setProgrammingLanguage] = useState('Python')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStepIndex, setLoadingStepIndex] = useState(0)
  const navigate = useNavigate()

  // Rotate loading steps message to entertain user during deep generation
  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length)
      }, 3000)
    } else {
      setLoadingStepIndex(0)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  const handleAnalyze = async (targetUrl) => {
    const activeUrl = targetUrl || url.trim()
    if (!activeUrl) {
      setError('Please provide a valid API documentation web URL.')
      return
    }

    // Quick regex validation
    if (!/^https?:\/\//i.test(activeUrl)) {
      setError('URL must begin with http:// or https://')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: activeUrl, intended_use_case: intendedUseCase, programming_language: programmingLanguage })
      })

      const data = await response.json()
      if (response.ok) {
        // Redirect to results with the database ID
        navigate(`/results/${data.id}`)
      } else {
        setError(data.detail || 'Failed to analyze documentation. The page might be protected or too complex to parse.')
      }
    } catch (err) {
      setError('Cannot reach the analysis server. Please check your backend connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleAnalyze()
  }

  return (
    <div className="dashboard-page animate-fade-in">
      {!isLoading ? (
        <div className="dashboard-content">
          <div className="hero-section">
            <h1>Integrate any API <span className="highlight-text">in seconds</span></h1>
            <p>Paste an API documentation link. Our platform crawls the webpage, runs analysis with Gemini AI, and builds SDKs, README guides, and integration pathways instantly.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="analyzer-card glass-panel">
            <div className="input-column">
              <input
                type="text"
                className="glass-input doc-url-input"
                placeholder="Paste API documentation URL (e.g., https://docs.stripe.com/api)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <textarea
                className="glass-input usecase-input"
                placeholder="Intended Use Case (Optional)
                Example: Build an e-commerce payment system"
                rows={3}
                value={intendedUseCase}
                onChange={(e) => setIntendedUseCase(e.target.value)}
              />
              <select
                className="glass-input language-select"
                value={programmingLanguage}
                onChange={(e) => setProgrammingLanguage(e.target.value)}
              >
                <option>Python</option>
                <option>JavaScript</option>
                <option>TypeScript</option>
                <option>Java</option>
                <option>C#</option>
                <option>Go</option>
                <option>PHP</option>
              </select>
              <button type="submit" className="btn-primary analyze-btn">
                <span>🔍</span> Analyze API
              </button>
            </div>
            {error && <div className="error-banner">{error}</div>}
          </form>

          <div className="presets-section">
            <h2>Select a demo API configuration to try instantly:</h2>
            <div className="presets-grid">
              {DEMO_PRESETS.map((preset) => (
                <div
                  key={preset.name}
                  className={`preset-card glass-card-interactive ${preset.disabled ? 'disabled' : ''}`}
                  style={{
                    '--preset-hover-border': preset.borderColor,
                    backgroundColor: preset.color
                  }}
                  onClick={() => {
                    if (preset.disabled) return;
                    setUrl(preset.url)
                    handleAnalyze(preset.url)
                  }}
                >
                  <div className="preset-header">
                    <span className="preset-logo">{preset.logo}</span>
                    <h3>{preset.name}</h3>
                  </div>
                  <p>{preset.description}</p>
                  <span className={`preset-link ${preset.disabled ? 'coming-soon' : ''}`}>
                    {preset.disabled ? '🚧 Coming Soon' : 'Load Preset →'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="loader-container glass-panel">
          <div className="spinner"></div>
          <h2>Analyzing API Documentation</h2>
          <p className="loader-step-text animate-fade-in" key={loadingStepIndex}>
            {LOADING_STEPS[loadingStepIndex]}
          </p>
          <div className="loader-progress-bar">
            <div
              className="loader-progress-fill"
              style={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .dashboard-content {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .hero-section {
          text-align: center;
          margin-top: 20px;
        }

        .hero-section h1 {
          font-family: var(--font-display);
          font-size: 46px;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }

        .hero-section h1 .highlight-text {
          background: linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-section p {
          font-size: 17px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 700px;
          margin: 0 auto;
        }

        .analyzer-card {
          padding: 28px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }

        .input-column {
          display: flex;
          flex-direction:column;
          gap: 16px;
        }

        .doc-url-input {
          flex: 1;
        }
        .usecase-input{
            resize:vertical;
            min-height:90px;
        }

        .language-select{
            cursor:pointer;
        }

        .language-select option{
            background:#111827;
            color:white;
        }

        .analyze-btn {
          white-space: nowrap;
          padding: 0 28px;
        }

        .error-banner {
          margin-top: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger);
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
        }

        .presets-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .presets-section h2 {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .preset-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 160px;
          border-radius: 12px;
          border: 1px solid var(--card-border);
        }
        .preset-card.disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .preset-card.disabled:hover {
          border-color: var(--card-border) !important;
          transform: none;
        }

        .coming-soon {
          color: #fbbf24;
        }

        .preset-card:hover {
          border-color: var(--preset-hover-border) !important;
        }

        .preset-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .preset-logo {
          font-size: 22px;
        }

        .preset-card h3 {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .preset-card p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-top: 8px;
          flex: 1;
        }

        .preset-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--neon-blue);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 12px;
        }

        /* Loading View styling */
        .loader-container {
          width: 100%;
          max-width: 500px;
          text-align: center;
          padding: 50px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .loader-container h2 {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 600;
        }

        .loader-step-text {
          font-size: 14px;
          color: var(--neon-blue);
          font-family: var(--font-mono);
          min-height: 20px;
        }

        .loader-progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .loader-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple));
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        @media (max-width: 768px) {
          .presets-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
