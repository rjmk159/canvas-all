import { useEffect, useRef, useState } from 'react'
import ScreenNav from '../components/ScreenNav.jsx'

const SCREENS = [
  { id: 'bars', label: 'Bar chart', desc: 'Loads → bars' },
  { id: 'line', label: 'Line graph', desc: 'Loads → line' },
  { id: 'donut', label: 'Donut', desc: 'Loads → donut' },
]

// Section 8: A single canvas that renders its OWN loading state in-canvas
// (animated spinner + progress bar drawn with the 2D context), then transitions
// to the loaded content once "loading" completes. No DOM overlay — the loading
// UI is part of the canvas itself.
export default function CanvasLoading() {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('loading') // 'loading' | 'loaded'
  const [screen, setScreen] = useState(0)
  const phaseRef = useRef('loading')
  const progressRef = useRef(0)
  const screenRef = useRef(0)
  phaseRef.current = phase
  screenRef.current = screen

  const startLoad = () => {
    progressRef.current = 0
    setPhase('loading')
  }

  const pickScreen = (i) => {
    setScreen(i)
    startLoad()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    let raf
    let angle = 0

    const drawLoading = (p) => {
      ctx.fillStyle = '#11141b'
      ctx.fillRect(0, 0, W, H)
      const cx = W / 2, cy = H / 2 - 24
      // spinner
      ctx.lineWidth = 5
      ctx.strokeStyle = '#2c313c'
      ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = '#5b8cff'
      ctx.beginPath(); ctx.arc(cx, cy, 26, angle, angle + Math.PI * 1.2); ctx.stroke()
      // progress bar
      const bw = 280, bx = cx - bw / 2, by = cy + 60
      ctx.fillStyle = '#20242d'
      ctx.fillRect(bx, by, bw, 8)
      ctx.fillStyle = '#36d399'
      ctx.fillRect(bx, by, bw * p, 8)
      // text
      ctx.fillStyle = '#9aa3b2'
      ctx.font = '14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Loading… ' + Math.round(p * 100) + '%', cx, by + 34)
      ctx.textAlign = 'left'
    }

    const palette = ['#5b8cff', '#36d399', '#ff6b6b', '#d68cff', '#ffd166', '#36d399']
    const vals = [0.4, 0.7, 0.55, 0.9, 0.65, 0.8]

    const drawLoaded = (t) => {
      ctx.fillStyle = '#11141b'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#36d399'
      ctx.font = '600 22px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Content loaded ✓', W / 2, 60)
      ctx.textAlign = 'left'

      const kind = SCREENS[screenRef.current].id
      if (kind === 'line') {
        ctx.strokeStyle = '#5b8cff'; ctx.lineWidth = 3; ctx.beginPath()
        vals.forEach((v, i) => {
          const x = 60 + i * ((W - 120) / (vals.length - 1))
          const y = H - 70 - (v + 0.08 * Math.sin(t / 500 + i)) * 180
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.stroke()
        ctx.strokeStyle = '#2c313c'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(40, H - 60); ctx.lineTo(W - 40, H - 60); ctx.stroke()
      } else if (kind === 'donut') {
        const cx = W / 2, cy = H / 2 + 30, R = 120, r = 64
        let a0 = -Math.PI / 2
        const total = vals.reduce((s, v) => s + v, 0)
        vals.forEach((v, i) => {
          const a1 = a0 + (v / total) * Math.PI * 2 + 0.02 * Math.sin(t / 600 + i)
          ctx.beginPath(); ctx.moveTo(cx, cy)
          ctx.arc(cx, cy, R, a0, a1); ctx.closePath()
          ctx.fillStyle = palette[i]; ctx.fill()
          a0 = a1
        })
        ctx.fillStyle = '#11141b'
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      } else {
        const bw = 60, gap = 24, totalW = vals.length * bw + (vals.length - 1) * gap
        const startX = (W - totalW) / 2
        vals.forEach((v, i) => {
          const h = (v + 0.08 * Math.sin(t / 500 + i)) * 180
          const x = startX + i * (bw + gap)
          const y = H - 60 - h
          ctx.fillStyle = palette[i]
          ctx.fillRect(x, y, bw, h)
        })
        ctx.strokeStyle = '#2c313c'
        ctx.beginPath(); ctx.moveTo(40, H - 60); ctx.lineTo(W - 40, H - 60); ctx.stroke()
      }
    }

    const loop = () => {
      angle += 0.12
      if (phaseRef.current === 'loading') {
        progressRef.current = Math.min(1, progressRef.current + 0.008)
        drawLoading(progressRef.current)
        if (progressRef.current >= 1) setPhase('loaded')
      } else {
        drawLoaded(performance.now())
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div>
      <h2 className="section-title">8 · Canvas with in-canvas loading state</h2>
      <p className="section-sub">
        The loading spinner and progress bar are drawn inside the canvas itself. When progress reaches 100%, the canvas swaps to the loaded content.
      </p>
      <ScreenNav screens={SCREENS} active={screen} onChange={pickScreen} idBase="loading" />

      <div className="row" style={{ marginBottom: 12 }}>
        <span className="badge" data-testid="load-phase">phase: {phase}</span>
        {phase === 'loading' && <span className="spinner" aria-hidden />}
        <button data-testid="reload-canvas" onClick={startLoad}>Reload (replay loading)</button>
      </div>
      <canvas ref={canvasRef} width={600} height={400} data-testid="loading-canvas" />
    </div>
  )
}
