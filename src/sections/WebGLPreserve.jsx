import { useEffect, useRef, useState } from 'react'
import { program } from '../lib/glUtils.js'
import ScreenNav from '../components/ScreenNav.jsx'

const SCREENS = [
  { id: 'scatter', label: 'Scatter', desc: 'Random placement' },
  { id: 'grid', label: 'Grid', desc: 'Snap to a 5×5 grid' },
]

// Section 5: WebGL with preserveDrawingBuffer: true.
// Because the buffer is preserved, each click draws a NEW small quad without
// clearing — the canvas accumulates marks. This is the classic context option
// that makes the canvas reliably readable via toDataURL / screenshots.

const VS = `
attribute vec2 aPos;
uniform vec2 uOffset;
uniform float uScale;
void main() { gl_Position = vec4(aPos * uScale + uOffset, 0.0, 1.0); }
`
const FS = `
precision mediump float;
uniform vec3 uColor;
void main() { gl_FragColor = vec4(uColor, 1.0); }
`

export default function WebGLPreserve() {
  const canvasRef = useRef(null)
  const glRef = useRef(null)
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState('init')
  const [snapshot, setSnapshot] = useState(null)
  const [screen, setScreen] = useState(0)
  const gridRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    // KEY: preserveDrawingBuffer keeps prior draws around.
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
    if (!gl) { setStatus('WebGL not supported'); return }
    glRef.current = gl
    try {
      gl.prog = program(gl, VS, FS)
      gl.useProgram(gl.prog)
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1,
      ]), gl.STATIC_DRAW)
      const aPos = gl.getAttribLocation(gl.prog, 'aPos')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
      gl.uOffset = gl.getUniformLocation(gl.prog, 'uOffset')
      gl.uScale = gl.getUniformLocation(gl.prog, 'uScale')
      gl.uColor = gl.getUniformLocation(gl.prog, 'uColor')
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0.06, 0.07, 0.09, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      const attrs = gl.getContextAttributes()
      setStatus('ready · preserveDrawingBuffer=' + attrs.preserveDrawingBuffer)
    } catch (e) {
      setStatus('error: ' + e.message)
    }
  }, [])

  const stamp = () => {
    const gl = glRef.current
    if (!gl || !gl.prog) return
    // No clear: draw accumulates on top of the preserved buffer.
    let ox, oy
    if (screen === 1) {
      // grid: snap successive stamps to a 5x5 grid in clip space
      const n = 5
      const idx = gridRef.current % (n * n)
      gridRef.current += 1
      const col = idx % n, rowi = Math.floor(idx / n)
      ox = -0.8 + (col / (n - 1)) * 1.6
      oy = -0.8 + (rowi / (n - 1)) * 1.6
    } else {
      ox = Math.random() * 1.6 - 0.8
      oy = Math.random() * 1.6 - 0.8
    }
    gl.uniform2f(gl.uOffset, ox, oy)
    gl.uniform1f(gl.uScale, 0.12)
    gl.uniform3f(gl.uColor, Math.random(), Math.random(), Math.random())
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    setCount((c) => c + 1)
  }

  const clearAll = () => {
    const gl = glRef.current
    if (!gl) return
    gl.clear(gl.COLOR_BUFFER_BIT)
    gridRef.current = 0
    setCount(0)
  }

  // Proves the buffer is preserved: read it back to a PNG even after paint.
  const capture = () => {
    setSnapshot(canvasRef.current.toDataURL('image/png'))
  }

  return (
    <div>
      <h2 className="section-title">5 · WebGL · preserveDrawingBuffer: true</h2>
      <p className="section-sub">
        Each click stamps a new quad without clearing, so marks accumulate. The preserved buffer can be read back to a PNG at any time.
      </p>
      <ScreenNav screens={SCREENS} active={screen} onChange={setScreen} idBase="preserve" />

      <div className="row" style={{ marginBottom: 12 }}>
        <span className="badge" data-testid="preserve-status">{status}</span>
        <span className="badge">stamps: <span className="counter" data-testid="stamp-count">{count}</span></span>
        <button data-testid="stamp-btn" onClick={stamp}>Stamp quad</button>
        <button className="secondary" data-testid="capture-btn" onClick={capture}>Capture PNG</button>
        <button className="secondary" data-testid="clear-btn" onClick={clearAll}>Clear</button>
      </div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          data-testid="preserve-canvas"
          onClick={stamp}
          style={{ cursor: 'crosshair' }}
        />
        {snapshot && (
          <div className="card">
            <div className="muted" style={{ marginBottom: 8, fontSize: 12 }}>Read-back snapshot</div>
            <img src={snapshot} alt="snapshot" data-testid="snapshot-img" width={240} height={180}
                 style={{ borderRadius: 8, border: '1px solid var(--border)' }} />
          </div>
        )}
      </div>
    </div>
  )
}
