import { useEffect, useRef, useState } from 'react'
import { program, makeQuad, makeTriangle } from '../lib/glUtils.js'
import ScreenNav from '../components/ScreenNav.jsx'

const SCREENS = [
  { id: 'quad', label: 'Quad', desc: 'Filled square' },
  { id: 'triangle', label: 'Triangle', desc: 'Single triangle' },
]

// Section 4: Basic WebGL. Clicks change the "layout": which shape is drawn,
// the clear color, and the fill color — re-rendered on each interaction.
const SHAPES = ['quad', 'triangle']
const PALETTE = [
  [0.36, 0.55, 1.0],
  [0.21, 0.83, 0.6],
  [1.0, 0.42, 0.42],
  [0.86, 0.55, 1.0],
]

const VS = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`
const FS = `
precision mediump float;
uniform vec3 uColor;
void main() { gl_FragColor = vec4(uColor, 1.0); }
`

export default function WebGLBasic() {
  const canvasRef = useRef(null)
  const glRef = useRef(null)
  const [shapeIdx, setShapeIdx] = useState(0)
  const [colorIdx, setColorIdx] = useState(0)
  const [clicks, setClicks] = useState(0)
  const [status, setStatus] = useState('init')

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl')
    if (!gl) { setStatus('WebGL not supported'); return }
    glRef.current = gl
    try {
      gl.prog = program(gl, VS, FS)
      gl.useProgram(gl.prog)
      gl.aPos = gl.getAttribLocation(gl.prog, 'aPos')
      gl.uColor = gl.getUniformLocation(gl.prog, 'uColor')
      gl.shapes = { quad: makeQuad(gl), triangle: makeTriangle(gl) }
      setStatus('ready')
    } catch (e) {
      setStatus('error: ' + e.message)
    }
  }, [])

  useEffect(() => {
    const gl = glRef.current
    if (!gl || !gl.prog) return
    const [r, g, b] = PALETTE[colorIdx]
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0.06, 0.07, 0.09, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const shape = gl.shapes[SHAPES[shapeIdx]]
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.buf)
    gl.enableVertexAttribArray(gl.aPos)
    gl.vertexAttribPointer(gl.aPos, 2, gl.FLOAT, false, 0, 0)
    gl.uniform3f(gl.uColor, r, g, b)
    gl.drawArrays(gl.TRIANGLES, 0, shape.count)
  }, [shapeIdx, colorIdx])

  const onCanvasClick = () => {
    const n = clicks + 1
    setClicks(n)
    setColorIdx((c) => (c + 1) % PALETTE.length)
    // Every 2 clicks also swaps the shape -> layout change.
    if (n % 2 === 0) setShapeIdx((s) => (s + 1) % SHAPES.length)
  }

  return (
    <div>
      <h2 className="section-title">4 · WebGL</h2>
      <p className="section-sub">
        Click the canvas to recolor; every second click also swaps the shape, changing the rendered layout.
      </p>
      <ScreenNav screens={SCREENS} active={shapeIdx} onChange={setShapeIdx} idBase="webgl" />

      <div className="row" style={{ marginBottom: 12 }}>
        <span className="badge" data-testid="gl-status">status: {status}</span>
        <span className="badge" data-testid="gl-shape">shape: {SHAPES[shapeIdx]}</span>
        <span className="badge">clicks: <span className="counter" data-testid="gl-clicks">{clicks}</span></span>
        <button className="secondary" data-testid="gl-shape-btn" onClick={() => setShapeIdx((s) => (s + 1) % SHAPES.length)}>
          Swap shape
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={640}
        height={400}
        data-testid="webgl-canvas"
        onClick={onCanvasClick}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )
}
