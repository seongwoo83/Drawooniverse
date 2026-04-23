const features = [
  {
    title: 'Fast shape sketching',
    description: 'Switch between line, rectangle, ellipse, polygon, and freehand tools without leaving the canvas flow.',
  },
  {
    title: 'Visual history control',
    description: 'Move through revisions with undo, redo, and direct history selection while keeping orientation intact.',
  },
  {
    title: 'Export-ready output',
    description: 'Download transparent PNGs directly from the browser and keep iterating without leaving the page.',
  },
]

const LandingPage = () => {
  return (
    <div className="landing_shell">
      <section className="landing_hero">
        <div className="hero_copy">
          <p className="hero_kicker">Visual Canvas Playground</p>
          <h1>Drawooniverse turns quick ideas into clean shapes in a single board.</h1>
          <p className="hero_text">
            Sketch diagrams, block out interfaces, or test visual thoughts with a responsive canvas that runs directly in the browser.
          </p>
          <div className="hero_actions">
            <a className="hero_primary_cta" href="#/app">
              Use the app
            </a>
            <a className="hero_secondary_cta" href="https://github.com/seongwoo83/Drawooniverse" target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </div>
        </div>
        <div className="hero_panel" aria-hidden="true">
          <div className="hero_panel_frame">
            <div className="hero_panel_badge">Browser demo included</div>
            <div className="hero_panel_grid">
              <span className="hero_chip">Shapes</span>
              <span className="hero_chip">Undo / Redo</span>
              <span className="hero_chip">Zoom</span>
              <span className="hero_chip">PNG Export</span>
            </div>
            <div className="hero_orbit hero_orbit_one" />
            <div className="hero_orbit hero_orbit_two" />
          </div>
        </div>
      </section>

      <section className="landing_features" aria-label="Key features">
        {features.map((feature, index) => (
          <article className="feature_card" key={feature.title}>
            <p className="feature_index">0{index + 1}</p>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="delivery_note" aria-label="Platform notes">
        <div>
          <p className="note_label">Runs on GitHub Pages</p>
          <p className="note_text">Open the app from the landing page and use the full drawing workspace directly in your browser.</p>
        </div>
        <div>
          <p className="note_label">Made for quick access</p>
          <p className="note_text">No installer is required for the main experience. Your canvas history and viewport stay available in the browser.</p>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
