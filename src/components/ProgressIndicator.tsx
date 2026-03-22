interface Props {
  currentStep: number;
  totalSteps: number;
  onRestart: () => void;
}

const STEP_LABELS = ["Chat", "Explore", "Review", "Done"];

export function ProgressIndicator({
  currentStep,
  totalSteps,
  onRestart,
}: Props) {
  return (
    <header className="progress-bar" role="banner">
      <div className="progress-logo" aria-label="Tripmos">
        Tripmos ✈️
      </div>

      <nav className="progress-steps" aria-label="Progress">
        {STEP_LABELS.slice(0, totalSteps).map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const status = isCompleted
            ? "completed"
            : isActive
              ? "active"
              : "upcoming";

          return (
            <div key={label} className="progress-step">
              {index > 0 && (
                <div
                  className={`progress-connector ${isCompleted ? "completed" : ""}`}
                  aria-hidden="true"
                />
              )}
              <div
                className={`progress-step-dot ${status}`}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${stepNum}: ${label}${isCompleted ? " (completed)" : isActive ? " (current)" : ""}`}
              >
                {isCompleted ? "✓" : stepNum}
              </div>
              <span
                className={`progress-step-label ${isActive ? "active" : ""}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </nav>

      <button
        className="restart-btn"
        onClick={onRestart}
        aria-label="Restart trip planning"
      >
        Restart
      </button>
    </header>
  );
}
