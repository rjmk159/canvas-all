import { useState } from 'react'
import ScreenNav from '../components/ScreenNav.jsx'

const SCREENS = [
  { id: 'default', label: 'Default', desc: 'Logo · nav · actions' },
  { id: 'compact', label: 'Compact', desc: 'Condensed bar' },
  { id: 'mega', label: 'Mega menu', desc: 'Expanded panel' },
]

export default function Header() {
  const [theme, setTheme] = useState('light')
  const [menuOpen, setMenuOpen] = useState(false)
  const [screen, setScreen] = useState(0)
  const view = SCREENS[screen].id

  return (
    <div>
      <h2 className="section-title">1 · DOM-based Header</h2>
      <p className="section-sub">Pick a header screen via the cards or Prev/Next buttons.</p>

      <ScreenNav screens={SCREENS} active={screen} onChange={setScreen} idBase="header" />

      {view === 'compact' ? (
        <header className="site-header" data-testid="site-header" style={{ padding: '8px 14px' }}>
          <div className="logo" style={{ fontSize: 14 }}><span className="dot" />Acme</div>
          <button data-testid="menu-toggle" onClick={() => setMenuOpen((o) => !o)}>{menuOpen ? '✕' : '☰'}</button>
        </header>
      ) : (
        <header className="site-header" data-testid="site-header">
          <div className="logo">
            <span className="dot" />
            <span>Acme<span style={{ color: 'var(--accent)' }}>Labs</span></span>
          </div>
          <nav className="top" data-testid="header-nav">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="row">
            <span className="badge" data-testid="theme-badge">theme: {theme}</span>
            <button className="secondary" data-testid="theme-toggle" onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
              Toggle theme
            </button>
            <button data-testid="menu-toggle" onClick={() => setMenuOpen((o) => !o)}>{menuOpen ? 'Close' : 'Menu'}</button>
          </div>
        </header>
      )}

      {view === 'mega' && (
        <div className="card" style={{ marginTop: 12 }} data-testid="mega-menu">
          <div className="grid-3">
            <div className="stack"><strong>Products</strong><a href="#a">Overview</a><a href="#b">Integrations</a><a href="#c">Changelog</a></div>
            <div className="stack"><strong>Resources</strong><a href="#d">Docs</a><a href="#e">Guides</a><a href="#f">API</a></div>
            <div className="stack"><strong>Company</strong><a href="#g">About</a><a href="#h">Careers</a><a href="#i">Contact</a></div>
          </div>
        </div>
      )}

      {menuOpen && view !== 'mega' && (
        <div className="card" style={{ marginTop: 12 }} data-testid="dropdown-menu">
          <div className="stack"><a href="#profile">Profile</a><a href="#settings">Settings</a><a href="#logout">Log out</a></div>
        </div>
      )}
    </div>
  )
}
