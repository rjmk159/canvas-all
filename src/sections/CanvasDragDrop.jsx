import { useEffect, useRef, useState } from 'react'

// Section 9: Drag and drop shapes inside a 2D canvas. All shapes are drawn
// with the 2D context; pointer events are hit-tested against the drawn rects
// and the dragged shape follows the cursor. Everything lives in the same
// canvas element — nothing is a DOM node.

const INITIAL = [
  { id: 'a', label: 'Alpha', x: 0, y: 330, w: 150, h: 90, color: '#1b2540' },
  { id: 'b', label: 'Beta', x: 280, y: 150, w: 150, h: 90, color: '#2a1840' },
  { id: 'c', label: 'Gamma', x: 500, y: 230, w: 150, h: 90, color: '#103326' },
]

export default function CanvasDragDrop() {
  const canvasRef = useRef(null)
  const shapesRef = useRef(INITIAL.map((s) => ({ ...s })))
  const dragRef = useRef(null) // { id, dx, dy }
  const [dragging, setDragging] = useState(null)
  const [dropCount, setDropCount] = useState(0)
  const [order, setOrder] = useState(INITIAL.map((s) => s.id).join(','))
  const W = 720
  const H = 420

  const draw = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#11141b'
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#9aa3b2'
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillText('Drag the boxes anywhere inside the canvas — pointer events are hit-tested against drawn rects.', 24, 28)

    shapesRef.current.forEach((s) => {
      const active = dragRef.current && dragRef.current.id === s.id
      ctx.fillStyle = s.color
      ctx.strokeStyle = active ? '#5b8cff' : '#2c313c'
      ctx.lineWidth = active ? 3 : 1
      roundRect(ctx, s.x, s.y, s.w, s.h, 12)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#e6e9ef'
      ctx.font = '600 16px system-ui, sans-serif'
      ctx.fillText(s.label, s.x + 16, s.y + 34)
      ctx.fillStyle = '#9aa3b2'
      ctx.font = '12px system-ui, sans-serif'
      ctx.fillText(`${Math.round(s.x)}, ${Math.round(s.y)}`, s.x + 16, s.y + 58)
    })
  }

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toCanvas = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    }
  }

  const hitTop = (x, y) => {
    // topmost first (last drawn is on top)
    const arr = shapesRef.current
    for (let i = arr.length - 1; i >= 0; i--) {
      const s = arr[i]
      if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s
    }
    return null
  }

  const onPointerDown = (e) => {
    const { x, y } = toCanvas(e)
    const s = hitTop(x, y)
    if (!s) return
    // bring to front so it renders above the others while dragging
    const arr = shapesRef.current.filter((o) => o.id !== s.id)
    arr.push(s)
    shapesRef.current = arr
    setOrder(arr.map((o) => o.id).join(','))
    dragRef.current = { id: s.id, dx: x - s.x, dy: y - s.y }
    setDragging(s.id)
    canvasRef.current.dataset.dragging = s.id
    canvasRef.current.setPointerCapture?.(e.pointerId)
    draw()
  }

  const onPointerMove = (e) => {
    const d = dragRef.current
    if (!d) return
    const { x, y } = toCanvas(e)
    const s = shapesRef.current.find((o) => o.id === d.id)
    s.x = clamp(x - d.dx, 0, W - s.w)
    s.y = clamp(y - d.dy, 0, H - s.h)
    canvasRef.current.dataset.lastPos = `${Math.round(s.x)},${Math.round(s.y)}`
    draw()
  }

  const endDrag = (e) => {
    if (!dragRef.current) return
    const id = dragRef.current.id
    dragRef.current = null
    setDragging(null)
    setDropCount((n) => n + 1)
    canvasRef.current.dataset.dragging = ''
    canvasRef.current.dataset.lastDrop = id
    canvasRef.current.releasePointerCapture?.(e.pointerId)
    draw()
  }

  const reset = () => {
    shapesRef.current = INITIAL.map((s) => ({ ...s }))
    dragRef.current = null
    setDragging(null)
    setDropCount(0)
    setOrder(INITIAL.map((s) => s.id).join(','))
    canvasRef.current.dataset.dragging = ''
    draw()
  }

  return (
    <div>
      <h2 className="section-title">9 · Canvas drag &amp; drop</h2>
      <p className="section-sub">
        Three boxes are drawn on a single 2D canvas. Pointer events are hit-tested against the
        drawn rectangles, and the picked box follows the cursor until you drop it. The dragged box
        is brought to the front.
      </p>

      <div className="row" style={{ marginBottom: 12 }}>
        <span className="badge" data-testid="dnd-dragging">dragging: {dragging || 'none'}</span>
        <span className="badge" data-testid="dnd-drops">drops: {dropCount}</span>
        <span className="badge" data-testid="dnd-order">order: {order}</span>
        <button className="secondary" data-testid="dnd-reset" onClick={reset}>Reset</button>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        data-testid="dnd-canvas"
        data-dragging=""
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        style={{
          width: '100%',
          maxWidth: W,
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      />
    </div>
  )
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
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
