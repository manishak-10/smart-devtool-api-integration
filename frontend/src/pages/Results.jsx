import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
const API_URL = import.meta.env.VITE_API_URL
export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState('overview')
  // Sub-tabs state inside developer tools
  const [activeToolTab, setActiveToolTab] = useState('readme')
  // Language selection for snippets
  const [snippetLanguage, setSnippetLanguage] = useState('python')

  // Copy feedback states
  const [copiedText, setCopiedText] = useState('')

  // Filter for endpoints
  const [endpointSearch, setEndpointSearch] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/history/${id}`)
        if (!response.ok) {
          throw new Error('Analysis report not found')
        }
        const result = await response.json()
        setData(result)
        if (result.sdk_language) {
          setSnippetLanguage(result.sdk_language.toLowerCase())
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch the analysis report.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchResults()
  }, [id])

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(''), 2000)
  }

  const handleDownload = (filename, text) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="results-loading-viewport">
        <div className="spinner"></div>
        <p>Retrieving API insights...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="results-error-viewport animate-fade-in">
        <div className="glass-panel error-card">
          <h2>⚠️ Report Load Error</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Get complexity class
  const getComplexityBadge = (level) => {
    const lvl = (level || 'Medium').toLowerCase()
    if (lvl === 'easy') return <span className="badge badge-easy">🟢 Easy</span>
    if (lvl === 'hard') return <span className="badge badge-hard">🔴 Hard</span>
    return <span className="badge badge-medium">🟡 Medium</span>
  }

  // Filter endpoints
  const filteredEndpoints = (data.endpoints || []).filter(ep => {
    const query = endpointSearch.toLowerCase()
    return (
      (ep.path || '').toLowerCase().includes(query) ||
      (ep.description || '').toLowerCase().includes(query) ||
      (ep.method || '').toLowerCase().includes(query)
    )
  })

  // Get active snippet
  const activeSnippet = (data.snippets || []).find(
    s => (s.language || '').toLowerCase() === snippetLanguage.toLowerCase()
  ) || { code: '# No snippet available' }

  const displayValue = (val) => {
    if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
      return "Not Available";
    }
    if (Array.isArray(val)) {
      return val.join(", ");
    }
    return val;
  };

  const getLanguageEmoji = (lang) => {
    const l = (lang || '').toLowerCase();
    if (l.includes('python')) return '🐍';
    if (l.includes('javascript') || l.includes('js')) return '🟨';
    if (l.includes('typescript') || l.includes('ts')) return '🟦';
    if (l.includes('go')) return '🐹';
    if (l.includes('java')) return '☕';
    if (l.includes('php')) return '🐘';
    if (l.includes('c#') || l.includes('csharp')) return '🔷';
    return '📦';
  };

  return (
    <div className="results-page animate-fade-in">
      {/* Top Banner Header */}
      <div className="results-header-card glass-panel">
        <div className="header-meta">
          <button className="back-link" onClick={() => navigate('/history')}>
            &larr; Return to History
          </button>

          <div className="title-row">
            <h1>{data.api_name}</h1>
            {getComplexityBadge(data.complexity)}
          </div>

          <p className="source-url">
            <span>🔗 Source:</span>{' '}
            <a href={data.url} target="_blank" rel="noopener noreferrer">
              {data.url}
            </a>
          </p>
        </div>

        {/* Animated Circular Readiness Score */}
        <div className="readiness-gauge">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke="url(#neon-gradient)"
              strokeWidth="6"
              strokeDasharray="264"
              strokeDashoffset={264 - (264 * (data.readiness_score || 70)) / 100}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="100%" stopColor="#9d4edd" />
              </linearGradient>
            </defs>
          </svg>
          <div className="score-label">
            <span className="score-num">{data.readiness_score}</span>
            <span className="score-txt">Score</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Selection Controller */}
      <div className="results-tab-bar">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          🚀 Overview & Guide
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🛡️ Security & Quality
        </button>
        <button
          className={`tab-btn ${activeTab === 'endpoints' ? 'active' : ''}`}
          onClick={() => setActiveTab('endpoints')}
        >
          🔑 Endpoints ({data.endpoints ? data.endpoints.length : 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'devtools' ? 'active' : ''}`}
          onClick={() => setActiveTab('devtools')}
        >
          ⚙️ Developer SDK & Snippets
        </button>
      </div>

      {/* Tab Panels */}
      <div className="tab-viewport">

        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="panel-overview grid-layout animate-slide-up">
            <div className="left-column">
              <div className="glass-panel section-card">
                <h2>API Purpose & Summary</h2>
                <p className="description-text">{data.description || 'No description extracted.'}</p>
              </div>

              <div className="glass-panel section-card">
                <h2>Integration Roadmap</h2>
                <div className="roadmap-timeline">
                  {data.roadmap && data.roadmap.map((step, idx) => (
                    <div className="timeline-node" key={idx}>
                      <div className="node-number">{idx + 1}</div>
                      <p className="node-text">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="right-column">
              <div className="glass-panel section-card accent-card purple">
                <h2>🔐 Authentication</h2>

                <div className="auth-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p><strong>Authentication Type:</strong> {displayValue(data.authentication?.type || data.auth_method)}</p>

                  <p><strong>Required Headers:</strong> {displayValue(data.authentication?.required_headers)}</p>

                  <p><strong>Token/API Key Location:</strong> {displayValue(data.authentication?.token_location)}</p>

                  <p><strong>Example Authorization Header:</strong> {displayValue(data.authentication?.example_authorization_header)}</p>

                  <p><strong>Additional Authentication Notes:</strong> {displayValue(data.authentication?.notes)}</p>
                </div>
              </div>

              <div className="glass-panel section-card accent-card blue">
                <h2>🔌 Integration Recommendation</h2>
                <div className="recommendation-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p><strong>REST Integration Path:</strong> {displayValue(data.integration_recommendation?.rest_integration_path)}</p>
                  <p><strong>SDK Recommendation:</strong> {
                    data.integration_recommendation?.sdk_recommendation && data.integration_recommendation.sdk_recommendation.trim() !== ""
                      ? data.integration_recommendation.sdk_recommendation
                      : "No official SDK exists for this API. We clearly recommend integrating directly via the REST API using standard HTTP client libraries."
                  }</p>
                </div>
              </div>

              <div className="glass-panel section-card accent-card blue">
                <h2>🩺 API Health Summary</h2>
                <p className="health-text">{data.health_summary || 'No health data logged.'}</p>
              </div>

              <div className="glass-panel section-card">
                <h2>Suggested Next Steps</h2>
                <ul className="next-steps-checklist">
                  {data.suggested_steps && data.suggested_steps.map((step, idx) => (
                    <li key={idx}>
                      <input type="checkbox" defaultChecked={idx === 0} id={`step-${idx}`} />
                      <label htmlFor={`step-${idx}`}>{step}</label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY & QUALITY PANEL */}
        {activeTab === 'security' && (
          <div className="panel-security grid-three-col animate-slide-up">
            <div className="glass-panel section-card security-card">
              <h2>🔒 Security Recommendations</h2>
              <ul className="guidelines-list">
                {data.security_recommendations && data.security_recommendations.map((item, idx) => (
                  <li key={idx} className="sec-item">{item}</li>
                ))}
              </ul>
            </div>

            <div className="glass-panel section-card practices-card">
              <h2>💡 Integration Best Practices</h2>
              <ul className="guidelines-list">
                {data.best_practices && data.best_practices.map((item, idx) => (
                  <li key={idx} className="best-item">{item}</li>
                ))}
              </ul>
            </div>

            <div className="glass-panel section-card pitfalls-card">
              <h2>⚠️ Common Pitfalls</h2>
              <ul className="guidelines-list">
                {data.common_pitfalls && data.common_pitfalls.map((item, idx) => (
                  <li key={idx} className="pitfall-item">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ENDPOINTS INDEX PANEL */}
        {activeTab === 'endpoints' && (
          <div className="panel-endpoints glass-panel animate-slide-up">
            <div className="endpoints-header">
              <h2>Discovered Endpoints</h2>
              <input
                type="text"
                className="glass-input endpoints-search"
                placeholder="Search endpoints by path, description, method..."
                value={endpointSearch}
                onChange={(e) => setEndpointSearch(e.target.value)}
              />
            </div>

            <div className="endpoints-table-wrapper">
              {filteredEndpoints.length > 0 ? (
                <table className="endpoints-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Method</th>
                      <th style={{ width: '320px' }}>Path</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEndpoints.map((ep, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`method-badge method-${(ep.method || 'GET').toUpperCase()}`}>
                            {ep.method || 'GET'}
                          </span>
                        </td>
                        <td className="endpoint-path">{ep.path}</td>
                        <td className="endpoint-desc">{ep.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-endpoints">No endpoints match your query search.</div>
              )}
            </div>
          </div>
        )}

        {/* DEVELOPER TOOLS (SDK / SNIPPETS / README) PANEL */}
        {activeTab === 'devtools' && (
          <div className="panel-devtools grid-layout animate-slide-up">

            {/* Tool side selector */}
            <div className="tools-sidebar">
              <button
                className={`tool-selector-btn ${activeToolTab === 'readme' ? 'active' : ''}`}
                onClick={() => setActiveToolTab('readme')}
              >
                📝 Generated README.md
              </button>
              <button
                className={`tool-selector-btn ${activeToolTab === 'sdk' ? 'active' : ''}`}
                onClick={() => setActiveToolTab('sdk')}
              >
                {getLanguageEmoji(data.sdk_language)} {data.sdk_language || 'Python'} SDK Wrapper
              </button>
              <button
                className={`tool-selector-btn ${activeToolTab === 'snippets' ? 'active' : ''}`}
                onClick={() => setActiveToolTab('snippets')}
              >
                ⚡ Code Snippet Bank
              </button>
            </div>

            {/* Code pane contents */}
            <div className="tools-pane glass-panel">
              {activeToolTab === 'readme' && (
                <div className="tool-content-box">
                  <div className="tool-header">
                    <h3>Integration README.md</h3>
                    <div className="btn-row">
                      <button
                        className="copy-btn-inline"
                        onClick={() => handleCopy(data.readme_md, 'readme')}
                      >
                        {copiedText === 'readme' ? 'Copied! ✓' : 'Copy'}
                      </button>
                      <button
                        className="download-btn-inline"
                        onClick={() => handleDownload(`${data.api_name.toLowerCase().replace(/\s+/g, '_')}_readme.md`, data.readme_md)}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                  <pre className="code-block-pane">
                    <code>{data.readme_md}</code>
                  </pre>
                </div>
              )}

              {activeToolTab === 'sdk' && (
                <div className="tool-content-box">
                  <div className="tool-header">
                    <h3>Generated {data.sdk_language || 'Python'} SDK Code</h3>
                    <button
                      className="copy-btn-inline"
                      onClick={() => handleCopy(data.sdk_code, 'sdk')}
                    >
                      {copiedText === 'sdk' ? 'Copied! ✓' : 'Copy SDK Code'}
                    </button>
                  </div>
                  <pre className="code-block-pane">
                    <code>{data.sdk_code}</code>
                  </pre>
                </div>
              )}

              {activeToolTab === 'snippets' && (
                <div className="tool-content-box">
                  <div className="tool-header">
                    <div className="snippet-lang-tabs">
                      {(data.snippets || []).map((s, idx) => {
                        const langName = s.language || 'Code';
                        const langKey = langName.toLowerCase();
                        return (
                          <button
                            key={idx}
                            className={`lang-tab ${snippetLanguage === langKey ? 'active' : ''}`}
                            onClick={() => setSnippetLanguage(langKey)}
                          >
                            {langName}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      className="copy-btn-inline"
                      onClick={() => handleCopy(activeSnippet.code, 'snippet')}
                    >
                      {copiedText === 'snippet' ? 'Copied! ✓' : 'Copy Snippet'}
                    </button>
                  </div>
                  <pre className="code-block-pane">
                    <code>{activeSnippet.code}</code>
                  </pre>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <style>{`
        .results-page {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .results-loading-viewport, .results-error-viewport {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 20px;
          min-height: 400px;
        }

        .results-loading-viewport p {
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }

        .error-card {
          max-width: 450px;
          text-align: center;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .error-card h2 {
          color: #fca5a5;
        }

        .results-header-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 32px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        }

        .header-meta {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .back-link {
          background: transparent;
          border: none;
          color: var(--neon-blue);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          align-self: flex-start;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .title-row h1 {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 800;
        }

        .source-url {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .source-url a {
          color: var(--neon-blue);
          text-decoration: none;
        }

        .source-url a:hover {
          text-decoration: underline;
        }

        /* Gauge */
        .readiness-gauge {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .score-label {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score-num {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .score-txt {
          font-size: 9px;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 1px;
          margin-top: 2px;
        }

        /* Tabs selector styling */
        .results-tab-bar {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          gap: 12px;
          overflow-x: auto;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 16px 20px;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: var(--transition-smooth);
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--neon-purple);
          border-color: var(--neon-purple);
          text-shadow: 0 0 10px rgba(157, 78, 221, 0.2);
        }

        /* Grid structures */
        .grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: stretch;
        }

        .grid-three-col {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .left-column,
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .section-card {
          margin-bottom: 0;
          
        }

        .section-card h2 {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 10px;
        }

        .description-text {
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Timeline Roadmap styles */
        .roadmap-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          padding-left: 20px;
        }

        .roadmap-timeline::before {
          content: '';
          position: absolute;
          left: 31px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          background: linear-gradient(180deg, var(--neon-purple) 0%, var(--neon-blue) 100%);
        }

        .timeline-node {
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
        }

        .node-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 2px solid var(--neon-purple);
          color: var(--text-primary);
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 0 10px var(--neon-purple-glow);
        }

        .node-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Accent cards */
        .accent-card {
          border-left: 4px solid var(--border-color);
        }

        .accent-card.purple {
          --border-color: var(--neon-purple);
          background: rgba(157, 78, 221, 0.03);
        }

        .accent-card.blue {
          --border-color: var(--neon-blue);
          background: rgba(0, 242, 254, 0.02);
        }

        .auth-value {
          font-family: var(--font-mono);
          font-size: 15px;
          color: var(--neon-purple);
        }

        .health-text {
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        /* Next Steps Checklist */
        .next-steps-checklist {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .next-steps-checklist li {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .next-steps-checklist input[type="checkbox"] {
          accent-color: var(--neon-purple);
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .next-steps-checklist label {
          font-size: 14px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .next-steps-checklist input[type="checkbox"]:checked + label {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        /* Guidelines */
        .guidelines-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .guidelines-list li {
          position: relative;
          padding-left: 24px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .guidelines-list li::before {
          position: absolute;
          left: 0;
          font-weight: bold;
        }

        .sec-item::before { content: '🛡️'; }
        .best-item::before { content: '💡'; }
        .pitfall-item::before { content: '⚠️'; }

        /* Endpoints panel styling */
        .endpoints-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 20px;
        }

        .endpoints-header h2 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
        }

        .endpoints-search {
          max-width: 380px;
        }

        .endpoints-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--card-border);
          border-radius: 12px;
        }

        .endpoints-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        .endpoints-table th, .endpoints-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .endpoints-table th {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .endpoints-table tr:last-child td {
          border-bottom: none;
        }

        .method-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          font-family: var(--font-mono);
          display: inline-block;
        }

        .method-GET { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .method-POST { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .method-PUT { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .method-DELETE { background: rgba(239, 68, 68, 0.15); color: var(--danger); }

        .endpoint-path {
          font-family: var(--font-mono);
          color: var(--text-primary);
          font-weight: 500;
        }

        .endpoint-desc {
          color: var(--text-secondary);
        }

        .no-endpoints {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
        }

        /* Developer tools tab styles */
        .panel-devtools {
          grid-template-columns: 280px 1fr;
        }

        .tools-sidebar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tool-selector-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
          padding: 16px 20px;
          border-radius: 10px;
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .tool-selector-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .tool-selector-btn.active {
          background: rgba(157, 78, 221, 0.1);
          color: var(--text-primary);
          border-color: var(--neon-purple);
          box-shadow: 0 0 15px rgba(157, 78, 221, 0.15);
        }

        .tools-pane {
          padding: 28px;
          min-height: 480px;
          display: flex;
          flex-direction: column;
        }

        .tool-content-box {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 16px;
        }

        .tool-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tool-header h3 {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
        }

        .btn-row {
          display: flex;
          gap: 8px;
        }

        .copy-btn-inline, .download-btn-inline {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: var(--transition-smooth);
          font-weight: 500;
        }

        .copy-btn-inline:hover {
          background: var(--neon-purple);
          color: #fff;
          border-color: var(--neon-purple);
        }

        .download-btn-inline:hover {
          background: var(--neon-blue);
          color: var(--bg-primary);
          border-color: var(--neon-blue);
        }

        .snippet-lang-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid var(--card-border);
        }

        .lang-tab {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: var(--transition-smooth);
          font-weight: 500;
        }

        .lang-tab.active {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .code-block-pane {
          background: #060510;
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 20px;
          font-family: var(--font-mono);
          font-size: 13px;
          color: #e2e8f0;
          overflow: auto;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 480px;
          flex: 1;
        }

        @media (max-width: 992px) {
          .grid-layout, .panel-devtools {
            grid-template-columns: 1fr;
          }
          .grid-three-col {
            grid-template-columns: 1fr;
          }
          .results-header-card {
            flex-direction: column;
            gap: 24px;
            align-items: flex-start;
          }
          .readiness-gauge {
            align-self: center;
          }
        }
      `}</style>
    </div>
  )
}
