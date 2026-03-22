interface Props {
  onStart: () => void;
}

export function LandingScreen({ onStart }: Props) {
  return (
    <div className="landing-screen">
      <div className="landing-bg-shapes" aria-hidden="true">
        <div className="landing-shape landing-shape-1" />
        <div className="landing-shape landing-shape-2" />
        <div className="landing-shape landing-shape-3" />
      </div>

      <div className="landing-content">
        <div className="landing-badge">
          <span className="landing-badge-dot" />
          AI-Powered Travel Planning
        </div>

        <div className="landing-logo">
          Trip<span>mos</span>
        </div>

        <h1 className="landing-headline">
          Plan your entire trip
          <br />
          in <span className="landing-headline-highlight">minutes</span>
        </h1>

        <p className="landing-sub">
          Tell our AI travelling assistant where you want to go, and we'll
          handle everything — flights, hotels, local transport, activities and
          more. Personalised just for you.
        </p>

        <button className="landing-cta" onClick={onStart}>
          Start Planning
          <span className="landing-cta-arrow" aria-hidden="true">
            →
          </span>
        </button>

        <div className="landing-features" aria-label="Feature highlights">
          <span className="landing-feature-chip">✈️ Flights</span>
          <span className="landing-feature-chip">🏨 Hotels</span>
          <span className="landing-feature-chip">🎟️ Activities</span>
          <span className="landing-feature-chip">🚗 Transport</span>
          <span className="landing-feature-chip">🤖 AI-curated</span>
        </div>
      </div>
    </div>
  );
}
