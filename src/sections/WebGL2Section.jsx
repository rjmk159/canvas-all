import { useEffect, useRef, useState } from 'react'
import ScreenNav from '../components/ScreenNav.jsx'

const SCREENS = [
  { id: 'cosine', label: 'Cosine field', desc: 'RGB cosine gradient' },
  { id: 'ripple', label: 'Ripple', desc: 'Radial sine waves' },
  { id: 'uv', label: 'UV map', desc: 'UV + pulse' },
]

// Section 6: WebGL2 context. Uses GLSL ES 3.00 shaders (#version 300 es,
// in/out, VAOs) which only compile under a real webgl2 context. An animated
// gradient confirms the context is live; clicks change the animation mode.

const VS = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`
const FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uTime;
uniform int uMode;
out vec4 fragColor;
void main() {
  vec3 col;
  if (uMode == 0) {
    col = 0.5 + 0.5 * cos(uTime + vUv.xyx + vec3(0.0, 2.0, 4.0));
  } else if (uMode == 1) {
    float d = distance(vUv, vec2(0.5));
    col = vec3(0.5 + 0.5 * sin(uTime - d * 20.0));
  } else {
    col = vec3(vUv, 0.5 + 0.5 * sin(uTime));
  }
  fragColor = vec4(col, 1.0);
}
`

export default function WebGL2Section() {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('init')
  const [mode, setMode] = useState(0)
  const modeRef = useRef(0)
  modeRef.current = mode

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl2')
    if (!gl) { setStatus('WebGL2 not supported'); return }

    const make = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s))
      return s
    }

    let raf
    try {
      const prog = gl.createProgram()
      gl.attachShader(prog, make(gl.VERTEX_SHADER, VS))
      gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FS))
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(prog))
      gl.useProgram(prog)

      // WebGL2 VAO
      const vao = gl.createVertexArray()
      gl.bindVertexArray(vao)
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1,
      ]), gl.STATIC_DRAW)
      const aPos = gl.getAttribLocation(prog, 'aPos')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

      const uTime = gl.getUniformLocation(prog, 'uTime')
      const uMode = gl.getUniformLocation(prog, 'uMode')
      gl.viewport(0, 0, canvas.width, canvas.height)
      const version = gl.getParameter(gl.VERSION)
      setStatus('ready · ' + version)

      const start = performance.now()
      const loop = () => {
        gl.uniform1f(uTime, (performance.now() - start) / 1000)
        gl.uniform1i(uMode, modeRef.current)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
        raf = requestAnimationFrame(loop)
      }
      loop()
    } catch (e) {
      setStatus('error: ' + e.message)
    }
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div>
      <h2 className="section-title">6 · WebGL2</h2>
      <p className="section-sub">
        A real WebGL2 context with GLSL ES 3.00 shaders and a VAO, animating every frame. Click to switch the shader mode.
      </p>
      <ScreenNav screens={SCREENS} active={mode} onChange={setMode} idBase="webgl2" />

      <div className="row" style={{ marginBottom: 12 }}>
        <span className="badge" data-testid="webgl2-status">{status}</span>
        <span className="badge" data-testid="webgl2-mode">mode: {mode}</span>
        <button className="secondary" data-testid="webgl2-mode-btn" onClick={() => setMode((m) => (m + 1) % 3)}>
          Next mode
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={640}
        height={400}
        data-testid="webgl2-canvas"
        onClick={() => setMode((m) => (m + 1) % 3)}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )
}
