import { useEffect, useRef, useState } from 'react'
import ScreenNav from '../components/ScreenNav.jsx'

// Section 3: A 2D canvas that draws "form cards". Clicking a card on the
// canvas changes the layout of the form rendered within the canvas.
// Everything (cards, fields, buttons) is drawn with the 2D context; clicks
// are hit-tested against drawn rects.

const LAYOUTS = {
  cards: 'Card picker',
  single: 'Single column form',
  twoCol: 'Two column form',
  review: 'Review & submit',
}
const SCREEN_IDS = ['cards', 'single', 'twoCol', 'review']
const SCREENS = [
  { id: 'cards', label: 'Card picker', desc: 'Choose a form' },
  { id: 'single', label: 'Single column', desc: 'Stacked fields' },
  { id: 'twoCol', label: 'Two column', desc: 'Side-by-side' },
  { id: 'review', label: 'Review', desc: 'Confirm & submit' },
]

export default function CanvasForm() {
  const canvasRef = useRef(null)
  const hitRef = useRef([]) // [{x,y,w,h,name,action}]
  const [layout, setLayout] = useState('cards')
  const [selected, setSelected] = useState(null)
  const [lastAction, setLastAction] = useState('none')
  const W = 720
  const H = 420

  const draw = (ctx) => {
    const hits = []
    ctx.clearRect(0, 0, W, H)
    // background
    ctx.fillStyle = '#11141b'
    ctx.fillRect(0, 0, W, H)

    const text = (s, x, y, { size = 16, color = '#e6e9ef', weight = '400' } = {}) => {
      ctx.fillStyle = color
      ctx.font = `${weight} ${size}px system-ui, sans-serif`
      ctx.fillText(s, x, y)
    }
    const box = (x, y, w, h, fill, stroke = '#2c313c') => {
      ctx.fillStyle = fill
      ctx.strokeStyle = stroke
      roundRect(ctx, x, y, w, h, 10)
      ctx.fill()
      ctx.stroke()
    }

    text(`Layout: ${LAYOUTS[layout]}`, 24, 34, { size: 18, weight: '600' })
    text('Click an element drawn on the canvas to change the form layout', 24, 56, { size: 12, color: '#9aa3b2' })

    if (layout === 'cards') {
      const cards = [
        { label: 'Single column', go: 'single', color: '#1b2540' },
        { label: 'Two column', go: 'twoCol', color: '#2a1840' },
        { label: 'Review & submit', go: 'review', color: '#103326' },
      ]
      cards.forEach((c, i) => {
        const x = 24 + i * 230
        const y = 90
        box(x, y, 210, 260, c.color)
        text(c.label, x + 18, y + 40, { size: 16, weight: '600' })
        text('Click to open', x + 18, y + 66, { size: 12, color: '#9aa3b2' })
        // draw a faux button
        box(x + 18, y + 200, 120, 40, '#5b8cff', '#5b8cff')
        text('Choose', x + 44, y + 226, { color: '#fff', weight: '600' })
        hits.push({ x, y, w: 210, h: 260, name: `card-${c.go}`, action: () => setLayout(c.go) })
      })
    } else if (layout === 'single') {
      drawFieldStack(ctx, box, text, [
        ['Full name', 24, 96],
        ['Email', 24, 168],
        ['Message', 24, 240],
      ], 672)
      drawSubmit(ctx, box, text, hits, () => setLayout('review'))
      drawBack(ctx, box, text, hits, () => setLayout('cards'))
    } else if (layout === 'twoCol') {
      drawField(box, text, 'First name', 24, 96, 320)
      drawField(box, text, 'Last name', 376, 96, 320)
      drawField(box, text, 'Email', 24, 168, 320)
      drawField(box, text, 'Phone', 376, 168, 320)
      drawField(box, text, 'Company', 24, 240, 672)
      drawSubmit(ctx, box, text, hits, () => setLayout('review'))
      drawBack(ctx, box, text, hits, () => setLayout('cards'))
    } else if (layout === 'review') {
      box(24, 90, 672, 230, '#181b22')
      text('Review your details', 44, 124, { size: 16, weight: '600' })
      text('Name:  Ada Lovelace', 44, 158, { color: '#9aa3b2' })
      text('Email: ada@analytical.engine', 44, 184, { color: '#9aa3b2' })
      text('Plan:  Pro (annual)', 44, 210, { color: '#9aa3b2' })
      text('Click "Submit" to confirm — it returns you to the card picker.', 44, 256, { size: 12, color: '#9aa3b2' })
      drawSubmit(ctx, box, text, hits, () => setLayout('cards'), 'Submit')
      drawBack(ctx, box, text, hits, () => setLayout('twoCol'))
    }

    hitRef.current = hits
  }

  // helpers that also register hit-targets where relevant
  function drawField(box, text, label, x, y, w) {
    text(label, x, y - 8, { size: 12, color: '#9aa3b2' })
    box(x, y, w, 44, '#20242d')
  }
  function drawFieldStack(ctx, box, text, fields, w) {
    fields.forEach(([label, x, y]) => drawField(box, text, label, x, y, w))
  }
  function drawSubmit(ctx, box, text, hits, action, label = 'Continue') {
    const x = 556, y = 350, w = 140, h = 48
    box(x, y, w, h, '#36d399', '#36d399')
    text(label, x + 36, y + 30, { color: '#04231a', weight: '700' })
    hits.push({ x, y, w, h, name: `submit-${label.toLowerCase()}`, action })
  }
  function drawBack(ctx, box, text, hits, action) {
    const x = 24, y = 350, w = 120, h = 48
    box(x, y, w, h, '#20242d')
    text('← Back', x + 30, y + 30, { color: '#e6e9ef' })
    hits.push({ x, y, w, h, name: 'back', action })
  }

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    draw(ctx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout])

  // One handler on the canonical `click` event. A real or synthetic click
  // fires this exactly once per interaction (mouse, touch and automation
  // .click() all resolve to a single click), so the layout never redraws
  // twice for one tap — which is what was causing the flicker on replay.
  const onClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (W / rect.width)
    const y = (e.clientY - rect.top) * (H / rect.height)
    setSelected({ x: Math.round(x), y: Math.round(y) })

    const hit = hitRef.current.find(
      (h) => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h
    )
    const name = hit ? hit.name : 'miss'
    setLastAction(name)
    // expose for automation assertions even before React re-renders the badge
    const el = canvasRef.current
    if (el) {
      el.dataset.lastHit = name
      el.dataset.lastClick = `${Math.round(x)},${Math.round(y)}`
    }
    if (hit) hit.action()
  }

  return (
    <div>
      <h2 className="section-title">3 · Canvas 2D form cards</h2>
      <p className="section-sub">
        The form is drawn entirely on a 2D canvas. Clicking a drawn card or button re-renders a new layout inside the same canvas.
      </p>
      <ScreenNav
        screens={SCREENS}
        active={SCREEN_IDS.indexOf(layout)}
        onChange={(i) => setLayout(SCREEN_IDS[i])}
        idBase="canvasform"
      />

      <div className="row" style={{ marginBottom: 12 }}>
        <span className="badge" data-testid="canvas-layout">layout: {layout}</span>
        <span className="badge" data-testid="last-action">last action: {lastAction}</span>
        {selected && <span className="badge" data-testid="last-click">last click: {selected.x},{selected.y}</span>}
        <button className="secondary" data-testid="reset-canvas" onClick={() => setLayout('cards')}>Reset</button>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        data-testid="form-canvas"
        data-layout={layout}
        data-last-action={lastAction}
        onClick={onClick}
        style={{ width: '100%', maxWidth: W, cursor: 'pointer', touchAction: 'manipulation' }}
      />
    </div>
  )
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
