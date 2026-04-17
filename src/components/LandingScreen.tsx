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
          Tripmos - Your Travel Companion
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
          Tell Tripmos where you want to go, and get a complete, personalised
          trip plan in minutes — without jumping between multiple sites.
        </p>

        <div className="landing-sim-notice">
          <span aria-hidden="true">🧪</span>
          <span>
            This is a <strong>simulated prototype</strong> — prices and options
            are illustrative. We'd love your feedback on the experience!
          </span>
        </div>

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

        <div className="landing-partners" aria-label="Supported by">
          <p className="landing-partners-label">Supported by</p>
          <div className="landing-partners-logos">
            <a
              href="https://www.gov.scot"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-partner-link"
            >
              <img
                className="landing-partner-logo"
                src="/logos/scottish-government.png"
                alt="Scottish Government"
              />
            </a>
            <a
              href="https://www.techscaler.co.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-partner-link"
            >
              <img
                className="landing-partner-logo"
                src="/logos/techscaler.png"
                alt="TechScaler"
              />
            </a>
            <a
              href="https://www.bgateway.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-partner-link"
            >
              <img
                className="landing-partner-logo"
                src="/logos/businessgateway.png"
                alt="Business Gateway"
              />
            </a>
            <a
              href="https://thisiscodebase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-partner-link"
            >
              <img
                className="landing-partner-logo"
                src="/logos/codebase.png"
                alt="CodeBase"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
