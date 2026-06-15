# Canvas Test App

A Vite + React app with 8 routed sections covering DOM, Canvas 2D, WebGL, WebGL2, iframes and in-canvas loading. Every interactive element carries a `data-testid` for automation.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## Sections

1. **DOM Header** — logo, nav links, theme toggle, dropdown menu.
2. **Hero (morphing)** — 3 clicks cycles the layout, double-click jumps to minimal, form submit also morphs; live click/dblclick counters and editable headline.
3. **Canvas 2D form cards** — form is drawn entirely on a 2D canvas; clicking a drawn card/button hit-tests and re-renders a new layout inside the same canvas.
4. **WebGL** — basic `webgl` context; clicks recolor and swap the shape (quad ↔ triangle).
5. **WebGL preserveDrawingBuffer: true** — clicks stamp quads without clearing so marks accumulate; buffer is read back to a PNG via `toDataURL`.
6. **WebGL2** — real `webgl2` context with GLSL ES 3.00 shaders and a VAO, animating each frame; click switches shader mode.
7. **Canvas in iframe** — animated 2D canvas in a same-origin `/iframe-canvas.html`; inner clicks reported to the parent via `postMessage`.
8. **Canvas loading state** — spinner + progress bar drawn inside the canvas itself, then swaps to loaded content at 100%.
