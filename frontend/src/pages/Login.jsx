import React, { useState } from 'react'
const API_URL = import.meta.env.VITE_API_URL
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Please enter a username to continue')
      return
    }
    setError('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed })
      })
      
      const data = await response.json()
      if (response.ok) {
        onLogin(data.username)
      } else {
        setError(data.detail || 'Authentication failed. Please try again.')
      }
    } catch (err) {
      setError('Cannot connect to the server. Please verify the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuest = () => {
    onLogin('Guest')
  }

  return (
    <div className="login-page animate-fade-in">
      <div className="login-glass-card glass-panel animate-slide-up">
        <div className="login-header">
          <span className="login-icon">🔮</span>
          <h1>Smart DevTool</h1>
          <p>AI-Powered API Documentation Analyzer</p>
        </div>

        {error && <div className="login-error-toast">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username-input">Developer Username</label>
            <input 
              id="username-input"
              type="text" 
              className="glass-input" 
              placeholder="e.g. dev_jane" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Secure Login'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button 
          onClick={handleGuest} 
          className="btn-secondary guest-btn"
          disabled={isLoading}
        >
          Continue as Guest
        </button>
      </div>

      <style>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 20px 0;
        }

        .login-glass-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(157, 78, 221, 0.05);
        }

        .login-header {
          margin-bottom: 32px;
        }

        .login-icon {
          font-size: 48px;
          display: inline-block;
          margin-bottom: 12px;
          animation: pulse-glow 3s infinite alternate;
        }

        .login-header h1 {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .login-error-toast {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger);
          color: #fca5a5;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
          text-align: left;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .login-btn {
          width: 100%;
          margin-top: 8px;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--text-muted);
          font-size: 14px;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .divider::before {
          margin-right: .5em;
        }

        .divider::after {
          margin-left: .5em;
        }

        .guest-btn {
          width: 100%;
        }

        @keyframes pulse-glow {
          0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(0, 242, 254, 0.3)); }
          100% { transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(157, 78, 221, 0.6)); }
        }
      `}</style>
    </div>
  )
}
