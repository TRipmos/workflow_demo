import { useState, useCallback } from "react";
import type {
  TripPlan,
  SelectedBookings,
  ResultCategory,
  MockResult,
} from "../types";
import { getDestinationData, CATEGORY_META } from "../data/mockData";

interface Props {
  tripPlan: TripPlan;
  onComplete: (bookings: SelectedBookings) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="result-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= Math.round(rating) ? "star-filled" : "star-empty"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

interface ResultItemProps {
  result: MockResult;
  isSelected: boolean;
  onSelect: (result: MockResult) => void;
}

function ResultItem({ result, isSelected, onSelect }: ResultItemProps) {
  return (
    <div
      className={`result-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(result)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(result);
      }}
      aria-pressed={isSelected}
    >
      <div className="result-item-top">
        <div>
          <div className="result-item-name">{result.name}</div>
          <div className="result-item-subtitle">{result.subtitle}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="result-item-price">{result.price}</div>
          {result.isBest && (
            <span className="result-badge result-badge-best">
              {result.badge ?? "Best Pick"}
            </span>
          )}
        </div>
      </div>
      <div className="result-item-bottom">
        <div className="result-item-details">
          <span>{result.detail1}</span>
          <span>{result.detail2}</span>
        </div>
        <div className="result-item-right">
          <StarRating rating={result.rating} />
          {isSelected && (
            <span className="result-badge result-badge-selected">
              Selected ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const CATEGORY_ORDER: ResultCategory[] = [
  "flights",
  "trains",
  "hotels",
  "local",
  "carHire",
  "activities",
];

export function ResultsExploration({ tripPlan, onComplete }: Props) {
  const [activeCategory, setActiveCategory] = useState<ResultCategory | null>(
    null,
  );
  const [selectedBookings, setSelectedBookings] = useState<SelectedBookings>(
    {},
  );

  const data = getDestinationData(tripPlan.destination);

  const handleCategoryClick = useCallback((cat: ResultCategory) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  }, []);

  const handleResultSelect = useCallback(
    (category: ResultCategory, result: MockResult) => {
      setSelectedBookings((prev) => {
        const current = prev[category];
        // Toggle off if same item selected
        if (current?.id === result.id) {
          const next = { ...prev };
          delete next[category];
          return next;
        }
        return { ...prev, [category]: result };
      });
    },
    [],
  );

  const selectedCount = Object.keys(selectedBookings).length;

  const getCategoryResults = (cat: ResultCategory): MockResult[] => data[cat];

  const destinationDisplay = tripPlan.destination || "your destination";

  return (
    <div className="results-screen">
      <div className="results-header">
        <div className="results-destination-badge">
          <span>{data.emoji}</span>
          <span>
            {tripPlan.destination || "Your Trip"}, {data.country}
          </span>
        </div>
        <h2 className="results-title">Explore your options</h2>
        <p className="results-subtitle">
          Click a category to see options · Select your favourites
        </p>
      </div>

      <div className="results-grid" role="list">
        {CATEGORY_ORDER.map((cat) => {
          const meta = CATEGORY_META[cat];
          const isActive = activeCategory === cat;
          const hasSelection = cat in selectedBookings;
          return (
            <div
              key={cat}
              className={`category-card ${isActive ? "active" : ""} ${hasSelection ? "has-selection" : ""}`}
              onClick={() => handleCategoryClick(cat)}
              role="listitem button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleCategoryClick(cat);
              }}
              aria-expanded={isActive}
              aria-label={`${meta.label}${hasSelection ? " — selected" : ""}`}
            >
              <span className="category-emoji" aria-hidden="true">
                {meta.emoji}
              </span>
              <div className="category-name">{meta.label}</div>
              <div className="category-desc">{meta.description}</div>
            </div>
          );
        })}
      </div>

      {activeCategory && (
        <div
          className="results-panel"
          role="region"
          aria-label={`${CATEGORY_META[activeCategory].label} options`}
        >
          <div className="results-panel-header">
            <div className="results-panel-title">
              <span aria-hidden="true">
                {CATEGORY_META[activeCategory].emoji}
              </span>
              {CATEGORY_META[activeCategory].label} — {destinationDisplay}
            </div>
            <button
              className="results-panel-close"
              onClick={() => setActiveCategory(null)}
              aria-label="Close panel"
            >
              ×
            </button>
          </div>

          <div className="result-items">
            {getCategoryResults(activeCategory).map((result) => (
              <ResultItem
                key={result.id}
                result={result}
                isSelected={selectedBookings[activeCategory]?.id === result.id}
                onSelect={(r) => handleResultSelect(activeCategory, r)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="results-footer">
        {selectedCount > 0 && (
          <p className="results-selected-count">
            <strong>{selectedCount}</strong> of 6 categories selected
          </p>
        )}
        <button
          className="btn-primary"
          onClick={() => onComplete(selectedBookings)}
          disabled={selectedCount === 0}
          style={{ width: "100%", maxWidth: "320px" }}
        >
          {selectedCount === 0
            ? "Select at least one option"
            : `Review My Itinerary →`}
        </button>
        {selectedCount === 0 && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--color-text-muted)",
              textAlign: "center",
            }}
          >
            Explore the categories above and select your preferred options
          </p>
        )}
      </div>
    </div>
  );
}
