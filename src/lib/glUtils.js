// Minimal WebGL helpers shared by the WebGL sections.

export function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error('Shader compile error: ' + log)
  }
  return sh
}

export function program(gl, vsSrc, fsSrc) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc)
  const p = gl.createProgram()
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error('Program link error: ' + gl.getProgramInfoLog(p))
  }
  return p
}

// A fullscreen-ish triangle fan (quad) with positions in clip space.
export function makeQuad(gl) {
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  const verts = new Float32Array([
    -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,
    -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
  ])
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
  return { buf, count: 6 }
}

export function makeTriangle(gl) {
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  const verts = new Float32Array([0.0, 0.85, -0.85, -0.7, 0.85, -0.7])
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
  return { buf, count: 3 }
}
