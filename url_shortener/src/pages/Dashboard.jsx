import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import '../styles/dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)
  const email = localStorage.getItem('email')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) return
    api.getLinks()
      .then(setLinks)
      .catch(() => {}) // silently fail if not logged in
  }, [token])

  async function handleShorten(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const link = await api.shorten(url)
      setLinks((prev) => [link, ...prev])
      setUrl('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(code) {
    try {
      await api.deleteLink(code)
      setLinks((prev) => prev.filter((l) => l.code !== code))
    } catch (err) {
      setError(err.message)
    }
  }

  function handleCopy(shortUrl) {
    navigator.clipboard.writeText(shortUrl)
    setCopied(shortUrl)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    navigate('/login')
  }

  return (
    <div className="dash-page">
      <header className="dash-header">
        <span className="dash-logo">✂ Snip</span>
        <div className="dash-user">
          {email && <span>{email}</span>}
          {token
            ? <button className="btn-ghost" onClick={handleLogout}>Log out</button>
            : <button className="btn-ghost" onClick={() => navigate('/login')}>Log in</button>
          }
        </div>
      </header>

      <main className="dash-main">
        <h1>Shorten a link</h1>
        <form className="shorten-form" onSubmit={handleShorten}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Shortening…' : 'Shorten'}
          </button>
        </form>
        {error && <p className="dash-error">{error}</p>}

        {links.length > 0 && (
          <div className="links-list">
            {links.map((link) => (
              <div key={link.code} className="link-card">
                <div className="link-info">
                  <a href={link.shortUrl} target="_blank" rel="noreferrer" className="link-short">
                    {link.shortUrl}
                  </a>
                  <span className="link-original">{link.originalUrl}</span>
                </div>
                <div className="link-actions">
                  <span className="link-clicks">{link.clickCount} clicks</span>
                  <button className="btn-copy" onClick={() => handleCopy(link.shortUrl)}>
                    {copied === link.shortUrl ? 'Copied!' : 'Copy'}
                  </button>
                  {token && (
                    <button className="btn-delete" onClick={() => handleDelete(link.code)} aria-label="Delete link">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {links.length === 0 && (
          <p className="dash-empty">No links yet. Shorten your first one above.</p>
        )}
      </main>
    </div>
  )
}
