import { WaitingListForm } from "./WaitingListForm";

// Replace [INSERT GOOGLE FORM LINK HERE] with your actual Google Form URL
const GOOGLE_FORM_URL = "https://forms.gle/MMP9wDWhTFLgmX789";

interface Props {
  onRestart: () => void;
}

export function FeedbackScreen({ onRestart }: Props) {
  return (
    <div className="feedback-screen">
      <div className="feedback-icon" aria-hidden="true">
        🚀
      </div>

      <h2 className="feedback-title">How was the experience?</h2>

      <p className="feedback-description">
        We're building <span className="feedback-product-name">Tripmos</span> to
        simplify the way people plan travel. You just experienced a glimpse of
        the future — personalised, AI-powered trip planning in minutes.
        <br />
        <br />
        Your feedback would be <strong>incredibly valuable</strong> in shaping
        what we build next.
      </p>

      <div className="feedback-stats" aria-label="Impact stats">
        <div className="feedback-stat">
          <div className="feedback-stat-number">5 min</div>
          <div className="feedback-stat-label">vs hours of research</div>
        </div>
        <div className="feedback-stat">
          <div className="feedback-stat-number">1 place</div>
          <div className="feedback-stat-label">for everything</div>
        </div>
        <div className="feedback-stat">
          <div className="feedback-stat-number">AI</div>
          <div className="feedback-stat-label">personalised</div>
        </div>
      </div>

      <WaitingListForm variant="feedback" />

      <a
        href={GOOGLE_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="feedback-btn-primary"
      >
        Give Feedback 💬
      </a>

      <button className="feedback-restart" onClick={onRestart}>
        ↩ Start a new trip plan
      </button>
    </div>
  );
}
