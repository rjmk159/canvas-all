import { useEffect, useState } from 'react'
import ScreenNav from '../components/ScreenNav.jsx'

const SCREENS = [
  { id: 'orbit', label: 'Orbit', desc: 'Orbiting circles' },
  { id: 'bars', label: 'Bars', desc: 'Animated bars' },
  { id: 'spiral', label: 'Spiral', desc: 'Rotating spiral' },
]

// Section 7: A canvas living inside an <iframe> (same-origin page in /public).
// The parent listens for postMessage clicks coming from inside the frame.
export default function CanvasIframe() {
  const [counts, setCounts] = useState({ clicks: 0, dbls: 0, longs: 0 })
  const [lastGesture, setLastGesture] = useState('none')
  const [reloadKey, setReloadKey] = useState(0)
  const [screen, setScreen] = useState(0)

  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data) return
      if (e.data.type === 'iframe-canvas-gesture') {
        setCounts({
          clicks: e.data.clicks || 0,
          dbls: e.data.dbls || 0,
          longs: e.data.longs || 0,
        })
        setLastGesture(e.data.gesture || 'none')
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  return (
    <div>
      <h2 className="section-title">7 · Canvas inside an iframe</h2>
      <p className="section-sub">
        An animated 2D canvas runs in a same-origin <span className="kbd">/iframe-canvas.html</span> page
        (which sets its own Content-Security-Policy). Gestures inside the frame — <strong>click</strong>,
        <strong> double-click</strong> and <strong>long-press</strong> — are reported back to the parent via postMessage.
      </p>
      <ScreenNav
        screens={SCREENS}
        active={screen}
        onChange={(i) => { setScreen(i); setReloadKey((k) => k + 1) }}
        idBase="iframe"
      />

      <div className="row" style={{ marginBottom: 12 }}>
        <span className="badge" data-testid="iframe-click-count">clicks: {counts.clicks}</span>
        <span className="badge" data-testid="iframe-dbl-count">double: {counts.dbls}</span>
        <span className="badge" data-testid="iframe-long-count">long: {counts.longs}</span>
        <span className="badge" data-testid="iframe-last-gesture">gesture: {lastGesture}</span>
        <button className="secondary" data-testid="iframe-reload" onClick={() => setReloadKey((k) => k + 1)}>
          Reload iframe
        </button>
      </div>
      <iframe
        key={reloadKey}
        src={`/iframe-canvas.html?scene=${SCREENS[screen].id}`}
        title="canvas-iframe"
        data-testid="canvas-iframe"
        data-last-gesture={lastGesture}
        sandbox="allow-scripts allow-same-origin"
        width={600}
        height={380}
        style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--panel)' }}
      />
    </div>
  )
}
