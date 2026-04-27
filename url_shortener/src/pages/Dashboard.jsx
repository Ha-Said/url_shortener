import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'

function generateCode() {
  return Math.random().toString(36).slice(2, 8)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(null)
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null')

  useEffect(() => {
    if (!user) return
    const saved = JSON.parse(localStorage.getItem(`links_${user.email}`) || '[]')
    setLinks(saved)
  }, [])

  function saveLinks(updated) {
    localStorage.setItem(`links_${user.email}`, JSON.stringify(updated))
    setLinks(updated)
  }

  function handleShorten(e) {
    e.preventDefault()
    setError('')
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL (include https://).')
      return
    }
    const code = generateCode()
    const short = `${window.location.origin}/s/${code}`
    const updated = [{ original: url, short, code, createdAt: Date.now() }, ...links]
    saveLinks(updated)
    setUrl('')
  }

  function handleCopy(short) {
    navigator.clipboard.writeText(short)
    setCopied(short)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleDelete(code) {
    saveLinks(links.filter((l) => l.code !== code))
  }

  function handleLogout() {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  return (
    <div className="dash-page">
      <header className="dash-header">
        <span className="dash-logo">✂ Snip</span>
        <div className="dash-user">
          <span>{user?.email}</span>
          <button className="btn-ghost" onClick={handleLogout}>Log out</button>
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
          <button type="submit" className="btn-primary">Shorten</button>
        </form>
        {error && <p className="dash-error">{error}</p>}

        {links.length > 0 && (
          <div className="links-list">
            {links.map((link) => (
              <div key={link.code} className="link-card">
                <div className="link-info">
                  <a href={link.short} target="_blank" rel="noreferrer" className="link-short">
                    {link.short}
                  </a>
                  <span className="link-original">{link.original}</span>
                </div>
                <div className="link-actions">
                  <button
                    className="btn-copy"
                    onClick={() => handleCopy(link.short)}
                  >
                    {copied === link.short ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(link.code)}
                    aria-label="Delete link"
                  >
                    ✕
                  </button>
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
