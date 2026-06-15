import { useState } from 'react'
import ScreenNav from '../components/ScreenNav.jsx'

// Section 2: DOM hero. Various interactions (clicks, double-click, typing)
// drive a counter that, past thresholds, swaps the hero to a new layout/variant.
const VARIANTS = ['v-default', 'v-split', 'v-minimal']
const SCREENS = [
  { id: 'default', label: 'Default', desc: 'Headline + form' },
  { id: 'split', label: 'Split', desc: 'Two-pane + demo form' },
  { id: 'minimal', label: 'Minimal', desc: 'Centered, compact' },
]

export default function Hero() {
  const [variant, setVariant] = useState(0)
  const [clicks, setClicks] = useState(0)
  const [dblClicks, setDblClicks] = useState(0)
  const [headline, setHeadline] = useState('Ship faster with confidence')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const cycle = () => setVariant((v) => (v + 1) % VARIANTS.length)

  const onPrimaryClick = () => {
    const next = clicks + 1
    setClicks(next)
    // Every 3 clicks, morph to the next layout.
    if (next % 3 === 0) cycle()
  }

  const onDoubleClick = () => {
    setDblClicks((d) => d + 1)
    // Double-click jumps straight to the minimal variant.
    setVariant(2)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    // A valid submit advances the layout too.
    cycle()
  }

  const v = VARIANTS[variant]

  return (
    <div>
      <h2 className="section-title">2 · Hero (morphing layout)</h2>
      <p className="section-sub">
        Single click ×3 cycles the layout · double-click jumps to minimal · form submit also morphs it.
      </p>

      <ScreenNav screens={SCREENS} active={variant} onChange={setVariant} idBase="hero" />

      <div className="row" style={{ marginBottom: 12 }}>
        <span className="badge" data-testid="variant-badge">layout: {v}</span>
        <span className="badge">clicks: <span className="counter" data-testid="click-count">{clicks}</span></span>
        <span className="badge">dblclicks: <span className="counter" data-testid="dbl-count">{dblClicks}</span></span>
        <button className="secondary" data-testid="cycle-layout" onClick={cycle}>Cycle layout</button>
      </div>

      <section
        className={`hero ${v}`}
        data-testid="hero"
        data-variant={v}
        onDoubleClick={onDoubleClick}
      >
        {v === 'v-split' ? (
          <>
            <div style={{ flex: 1 }}>
              <h2>{headline}</h2>
              <p>Split layout. Double-click anywhere on the hero to collapse to the minimal variant.</p>
              <div className="row">
                <button data-testid="hero-primary" onClick={onPrimaryClick}>Get started</button>
                <button className="secondary" data-testid="hero-secondary">Learn more</button>
              </div>
            </div>
            <div style={{ flex: 1 }} className="card">
              <form onSubmit={onSubmit} data-testid="hero-form">
                <div className="field">
                  <label htmlFor="email-split">Work email</label>
                  <input
                    id="email-split"
                    data-testid="hero-email"
                    type="email"
                    value={email}
                    placeholder="you@company.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" data-testid="hero-submit">Request demo</button>
                {submitted && <p data-testid="hero-submitted" style={{ color: 'var(--accent-2)' }}>Submitted ✓</p>}
              </form>
            </div>
          </>
        ) : (
          <>
            <h2>{headline}</h2>
            <p>
              {v === 'v-minimal'
                ? 'Minimal variant — fewer elements, centered. Keep clicking to cycle back.'
                : 'Default variant. Click "Get started" three times to morph the layout.'}
            </p>

            <div className="field" style={{ maxWidth: 420, margin: v === 'v-minimal' ? '14px auto' : '14px 0' }}>
              <label htmlFor="headline-input">Edit headline (type to change hero text)</label>
              <input
                id="headline-input"
                data-testid="headline-input"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="row" style={{ justifyContent: v === 'v-minimal' ? 'center' : 'flex-start' }}>
              <button data-testid="hero-primary" onClick={onPrimaryClick}>Get started</button>
              <button className="secondary" data-testid="hero-secondary" onClick={() => setClicks(0)}>
                Reset clicks
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
