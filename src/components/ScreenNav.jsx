// Reusable screen switcher: a grid of clickable cards + prev/next buttons.
// `screens` = [{ id, label, desc }]. Calls onChange(index).
export default function ScreenNav({ screens, active, onChange, idBase }) {
  const go = (i) => onChange((i + screens.length) % screens.length)
  return (
    <div className="screen-nav" data-testid={`${idBase}-screen-nav`}>
      <div className="screen-cards">
        {screens.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={'screen-card' + (active === i ? ' active' : '')}
            data-testid={`${idBase}-card-${s.id}`}
            aria-pressed={active === i}
            onClick={() => onChange(i)}
          >
            <span className="screen-card-title">{s.label}</span>
            {s.desc && <span className="screen-card-desc">{s.desc}</span>}
          </button>
        ))}
      </div>
      <div className="row screen-controls">
        <button className="secondary" data-testid={`${idBase}-prev`} onClick={() => go(active - 1)}>
          ← Prev
        </button>
        <span className="badge" data-testid={`${idBase}-screen`}>
          screen {active + 1}/{screens.length}: {screens[active].label}
        </span>
        <button className="secondary" data-testid={`${idBase}-next`} onClick={() => go(active + 1)}>
          Next →
        </button>
      </div>
    </div>
  )
}
