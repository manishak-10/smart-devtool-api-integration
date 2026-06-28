import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function History() {
  const [history, setHistory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Fetch history list, triggered on search query modifications
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const url = searchQuery 
          ? `/api/history?search=${encodeURIComponent(searchQuery)}`
          : '/api/history'
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to retrieve history logs.')
        }
        const data = await response.json()
        setHistory(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    // Bounce queries slightly to prevent typing storm
    const delayDebounceFn = setTimeout(() => {
      fetchHistory()
    }, 250)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Delete handler
  const handleDelete = async (e, id) => {
    e.stopPropagation() // Prevent card click navigation trigger
    if (!window.confirm('Are you sure you want to delete this analysis report from your history?')) {
      return
    }

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id))
      } else {
        alert('Failed to delete report. Please try again.')
      }
    } catch (err) {
      alert('Network error. Could not delete report.')
    }
  }

  const getComplexityClass = (level) => {
    const lvl = (level || 'Medium').toLowerCase()
    if (lvl === 'easy') return 'badge-easy'
    if (lvl === 'hard') return 'badge-hard'
    return 'badge-medium'
  }

  return (
    <div className="history-page animate-fade-in">
      <div className="history-header">
        <div className="title-block">
          <h1>Analysis History</h1>
          <p>Browse, query and manage your parsed API documentation libraries.</p>
        </div>
        
        <input 
          type="text" 
          className="glass-input history-search" 
          placeholder="Search by API name or URL link..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="history-loading">
          <div className="spinner"></div>
          <p>Querying SQLite database logs...</p>
        </div>
      ) : error ? (
        <div className="history-error glass-panel">
          <p>⚠️ {error}</p>
        </div>
      ) : history.length > 0 ? (
        <div className="history-list animate-slide-up">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="history-card glass-panel"
              onClick={() => navigate(`/results/${item.id}`)}
            >
              <div className="card-top">
                <div className="meta-left">
                  <h3>{item.api_name}</h3>
                  <span className={`badge ${getComplexityClass(item.complexity)}`}>
                    {item.complexity}
                  </span>
                </div>
                
                <div className="meta-right">
                  <div className="small-score">
                    <span className="num">{item.readiness_score}</span>
                    <span className="lbl">Readiness</span>
                  </div>
                  <button 
                    className="delete-card-btn"
                    onClick={(e) => handleDelete(e, item.id)}
                    title="Delete record"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <p className="card-url">{item.url}</p>
              
              <div className="card-footer">
                <span className="timestamp">
                  📅 {new Date(item.created_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                <span className="open-report-text">Open Insights &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-history glass-panel animate-slide-up">
          <span className="empty-icon">📜</span>
          <h2>No API analysis logs found</h2>
          <p>
            {searchQuery 
              ? 'No matching results found for your query. Try searching for other terms.' 
              : 'You haven\'t analyzed any APIs yet. Enter an API URL on the dashboard to begin.'}
          </p>
          {!searchQuery && (
            <button className="btn-primary" onClick={() => navigate('/')}>
              Analyze First API
            </button>
          )}
        </div>
      )}

      <style>{`
        .history-page {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .title-block h1 {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
        }

        .title-block p {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 4px;
        }

        .history-search {
          max-width: 380px;
        }

        .history-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          min-height: 250px;
        }

        .history-loading p {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-secondary);
        }

        .history-error {
          padding: 24px;
          color: var(--danger);
          text-align: center;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-card {
          padding: 20px 24px;
          cursor: pointer;
          transition: var(--transition-smooth);
          border: 1px solid var(--card-border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .history-card:hover {
          border-color: var(--neon-purple);
          box-shadow: 0 8px 24px -10px var(--neon-purple-glow);
          transform: translateX(4px);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .meta-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .meta-left h3 {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 600;
        }

        .meta-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .small-score {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .small-score .num {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--neon-blue);
        }

        .small-score .lbl {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .delete-card-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 6px;
          border-radius: 6px;
          transition: var(--transition-smooth);
        }

        .delete-card-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .card-url {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          padding-top: 12px;
          font-size: 12px;
        }

        .timestamp {
          color: var(--text-muted);
        }

        .open-report-text {
          color: var(--neon-blue);
          font-weight: 600;
          transition: var(--transition-smooth);
        }

        .history-card:hover .open-report-text {
          text-shadow: 0 0 8px var(--neon-blue-glow);
        }

        /* Empty states */
        .empty-history {
          text-align: center;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          max-width: 480px;
          margin: 40px auto 0;
        }

        .empty-icon {
          font-size: 48px;
        }

        .empty-history h2 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
        }

        .empty-history p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .history-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .history-search {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
