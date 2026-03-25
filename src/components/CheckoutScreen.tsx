interface Props {
  onProceed: () => void;
  onDecline: () => void;
}

export function CheckoutScreen({ onProceed, onDecline }: Props) {
  return (
    <div className="checkout-screen">
      <div className="checkout-icon" aria-hidden="true">
        💳
      </div>

      <h2 className="checkout-title">Ready to book?</h2>

      <p className="checkout-description">
        Your trip plan is ready! In the full <strong>Tripmos</strong>{" "}
        experience, this is where you'd review final prices and complete your
        booking in one place — no jumping between sites.
      </p>

      <div className="checkout-mock-card">
        <div className="checkout-mock-card-header">
          <span className="checkout-mock-lock" aria-hidden="true">
            🔒
          </span>
          Secure Checkout
        </div>
        <div className="checkout-mock-card-body">
          <div className="checkout-mock-field" />
          <div className="checkout-mock-row">
            <div className="checkout-mock-field checkout-mock-field-half" />
            <div className="checkout-mock-field checkout-mock-field-half" />
          </div>
          <div className="checkout-mock-field" />
        </div>
        <div className="checkout-mock-card-note">
          No payment details needed — this is a demo
        </div>
      </div>

      <p className="checkout-question">
        Would you be happy to book a trip like this through Tripmos?
      </p>

      <div className="checkout-actions">
        <button className="checkout-btn-yes" onClick={onProceed}>
          Yes, I'd book this! ✅
        </button>
        <button className="checkout-btn-no" onClick={onDecline}>
          Not quite — but I'll leave feedback
        </button>
      </div>
    </div>
  );
}
