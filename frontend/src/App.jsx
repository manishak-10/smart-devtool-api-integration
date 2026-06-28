import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'
import History from './pages/History'

// Header/Navbar component
function Navigation({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="nav-header">
      <div className="nav-logo" onClick={() => navigate('/')}>
        <span className="logo-icon">🤖</span>
        <span className="logo-text">Smart <span className="highlight">DevTool</span></span>
      </div>

      {user && (
        <>
          <nav className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              🔲 Dashboard
            </Link>
            <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>
              📜 History
            </Link>
          </nav>

          <div className="nav-actions">
            <div className="user-badge">
              <span className="user-icon">👤</span>
              <span className="username">{user}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </>
      )}
    </header>
  )
}

export default function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);
  const [user, setUser] = useState(() => {
    return localStorage.getItem('smart_devtool_user') || null;
  });

  const handleLogin = (username) => {
    localStorage.setItem('smart_devtool_user', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('smart_devtool_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Glow Effects */}
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>

        <div className="app-content-wrapper">
          <Navigation user={user} onLogout={handleLogout} />

          <main className="main-viewport">
            <Routes>
              <Route
                path="/login"
                element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
              />
              <Route
                path="/"
                element={user ? <Dashboard /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/results/:id"
                element={user ? <Results /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/history"
                element={user ? <History /> : <Navigate to="/login" replace />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

// Add navigation styles directly to head or app.css
const style = document.createElement('style');
style.textContent = `
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #030014;
}

.app-content-wrapper {
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 24px;
  z-index: 10;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  font-size: 24px;
  filter: drop-shadow(0 0 8px var(--neon-purple-glow));
}

.logo-text {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo-text .highlight {
  background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: var(--transition-smooth);
}

.nav-link:hover, .nav-link.active {
  color: var(--text-primary);
  text-shadow: 0 0 10px var(--neon-purple-glow);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}


.user-badge {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--card-border);
  padding: 8px 16px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--danger);
  padding: 8px 16px;
  border-radius: 99px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition-smooth);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
}

.main-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
}

@media (max-width: 768px) {
  .nav-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
  }
  .nav-links {
    gap: 20px;
  }
}
`;
document.head.appendChild(style);
