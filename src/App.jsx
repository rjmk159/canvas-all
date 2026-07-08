import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import Header from './sections/Header.jsx'
import Hero from './sections/Hero.jsx'
import CanvasForm from './sections/CanvasForm.jsx'
import WebGLBasic from './sections/WebGLBasic.jsx'
import WebGLPreserve from './sections/WebGLPreserve.jsx'
import WebGL2Section from './sections/WebGL2Section.jsx'
import CanvasIframe from './sections/CanvasIframe.jsx'
import CanvasLoading from './sections/CanvasLoading.jsx'
import CanvasDragDrop from './sections/CanvasDragDrop.jsx'

const NAV = [
  { to: '/header', label: '1 · Header', el: <Header /> },
  { to: '/hero', label: '2 · Hero (morphing)', el: <Hero /> },
  { to: '/canvas-form', label: '3 · Canvas Form', el: <CanvasForm /> },
  { to: '/webgl', label: '4 · WebGL', el: <WebGLBasic /> },
  { to: '/webgl-preserve', label: '5 · WebGL preserve', el: <WebGLPreserve /> },
  { to: '/webgl2', label: '6 · WebGL2', el: <WebGL2Section /> },
  { to: '/canvas-iframe', label: '7 · Canvas in iframe', el: <CanvasIframe /> },
  { to: '/canvas-loading', label: '8 · Canvas loading', el: <CanvasLoading /> },
  { to: '/canvas-dnd', label: '9 · Canvas drag & drop', el: <CanvasDragDrop /> },
]

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar" data-testid="sidebar">
        <h1 className="brand">Canvas Test App</h1>
        <nav>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.to.slice(1)}`}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/header" replace />} />
          {NAV.map((n) => (
            <Route key={n.to} path={n.to} element={n.el} />
          ))}
        </Routes>
      </main>
    </div>
  )
}
