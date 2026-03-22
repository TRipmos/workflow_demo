import type {
  TripPlan,
  SelectedBookings,
  ResultCategory,
  MockResult,
} from "../types";
import { getDestinationData, CATEGORY_META } from "../data/mockData";

interface Props {
  tripPlan: TripPlan;
  selectedBookings: SelectedBookings;
  onContinue: () => void;
  onRestart: () => void;
}

function parsePriceGBP(price: string): number {
  const match = price.match(/£(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function calculateTotal(
  bookings: SelectedBookings,
  travellers: string,
): { breakdown: Array<{ label: string; amount: number }>; total: number } {
  let adults = 2;
  if (travellers.includes("Just me")) adults = 1;
  else if (travellers.includes("4+")) adults = 4;

  const breakdown: Array<{ label: string; amount: number }> = [];

  const addLine = (
    booking: MockResult | undefined,
    label: string,
    multiply: number,
  ) => {
    if (!booking) return;
    const base = parsePriceGBP(booking.price);
    const amount = Math.round(base * multiply);
    if (amount > 0) breakdown.push({ label, amount });
  };

  addLine(bookings.flights, `Flights (×${adults})`, adults);
  addLine(bookings.trains, `Trains (×${adults})`, adults);
  addLine(bookings.hotels, "Hotel (7 nights)", 7);
  addLine(bookings.local, "Local transport", 1);
  addLine(bookings.carHire, "Car hire (7 days)", 7);
  addLine(bookings.activities, `Activities (×${adults})`, adults);

  const total = breakdown.reduce((sum, line) => sum + line.amount, 0);
  return { breakdown, total };
}

const SECTION_CONFIG: Array<{ key: ResultCategory; emoji: string }> = [
  { key: "flights", emoji: "✈️" },
  { key: "trains", emoji: "🚆" },
  { key: "hotels", emoji: "🏨" },
  { key: "local", emoji: "🚕" },
  { key: "carHire", emoji: "🚗" },
  { key: "activities", emoji: "🎟️" },
];

export function ItinerarySummary({
  tripPlan,
  selectedBookings,
  onContinue,
  onRestart,
}: Props) {
  const destData = getDestinationData(tripPlan.destination);
  const { breakdown, total } = calculateTotal(
    selectedBookings,
    tripPlan.travellers,
  );

  const metaItems: Array<{ emoji: string; label: string }> = [
    { emoji: "🗓️", label: tripPlan.dates || "Dates TBD" },
    { emoji: "👥", label: tripPlan.travellers || "Travellers TBD" },
    { emoji: "💰", label: tripPlan.budget || "Budget TBD" },
  ];

  return (
    <div className="summary-screen">
      {/* Hero card */}
      <div className="summary-hero-card">
        <span className="summary-destination-emoji" aria-hidden="true">
          {destData.emoji}
        </span>
        <div className="summary-destination-name">
          {tripPlan.destination || "Your Trip"}
        </div>
        <div style={{ fontSize: "14px", opacity: 0.75 }}>
          {destData.country}
        </div>
        <div className="summary-meta">
          {metaItems.map(({ emoji, label }) => (
            <div key={label} className="summary-meta-item">
              <span aria-hidden="true">{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected bookings */}
      <div className="summary-sections">
        {SECTION_CONFIG.map(({ key, emoji }) => {
          const booking = selectedBookings[key];
          if (!booking) return null;
          const meta = CATEGORY_META[key];
          return (
            <div key={key} className="summary-section">
              <div className="summary-section-header">
                <div className="summary-section-title">
                  <span aria-hidden="true">{emoji}</span>
                  {meta.label}
                </div>
                <span className="summary-section-badge">Selected ✓</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div>
                  <div className="summary-item-name">{booking.name}</div>
                  <div className="summary-item-detail">{booking.subtitle}</div>
                  <div className="summary-item-detail">{booking.detail1}</div>
                </div>
                <div className="summary-item-price" style={{ flexShrink: 0 }}>
                  {booking.price}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total cost */}
      {breakdown.length > 0 && (
        <div className="summary-total-card">
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Estimated total
          </div>
          {breakdown.map(({ label, amount }) => (
            <div key={label} className="summary-total-row">
              <span>{label}</span>
              <span>£{amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="summary-total-divider" />
          <div className="summary-total-final">
            <span>Total estimate</span>
            <span className="summary-total-amount">
              £{total.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Preview notice */}
      <div className="summary-preview-notice">
        <span aria-hidden="true">⚠️</span>
        <span>
          <strong>This is a preview of your trip plan.</strong> Prices are
          indicative. Final booking would be confirmed with live rates.
        </span>
      </div>

      {/* Actions */}
      <div className="summary-actions">
        <button className="btn-primary" onClick={onContinue}>
          Looks great — what's next? →
        </button>
        <button className="btn-secondary" onClick={onRestart}>
          ↩ Start over
        </button>
      </div>
    </div>
  );
}
