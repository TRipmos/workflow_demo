import { useState, useCallback } from "react";
import type {
  TripPlan,
  SelectedBookings,
  ResultCategory,
  MockResult,
} from "../types";
import { getDestinationData, CATEGORY_META } from "../data/mockData";

const OTHER_CATEGORIES: ResultCategory[] = [
  "hotels",
  "local",
  "carHire",
  "activities",
];

function getTransportCats(transport: string): ResultCategory[] {
  const t = transport.toLowerCase();
  if (t === "flight") return ["flights"];
  if (t === "train") return ["trains"];
  if (t === "mix of both" || t === "fastest option")
    return ["flights", "trains"];
  return []; // drive — no outbound transport category
}

type AccomFilter = "hotel" | "boutique" | "apartment" | "hostel" | "all";

function getAccomFilter(accommodation: string): AccomFilter {
  const a = accommodation.toLowerCase();
  if (a.includes("boutique") || a.includes("luxury")) return "boutique";
  if (a.includes("apartment") || a.includes("airbnb")) return "apartment";
  if (a.includes("hostel") || a.includes("budget")) return "hostel";
  if (a.includes("hotel")) return "hotel";
  return "all";
}

function filterHotels(hotels: MockResult[], filter: AccomFilter): MockResult[] {
  if (filter === "all") return hotels;
  return hotels.filter((h) => h.accomType === filter);
}

interface Props {
  tripPlan: TripPlan;
  initialBookings?: SelectedBookings;
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

export function ResultsExploration({
  tripPlan,
  initialBookings,
  onComplete,
}: Props) {
  const transportCats = getTransportCats(tripPlan.transport);
  const isDriving = tripPlan.transport.toLowerCase() === "drive";
  const accomFilter = getAccomFilter(tripPlan.accommodation);

  // Auto-open first category that doesn't already have a selection
  const [activeCategory, setActiveCategory] = useState<ResultCategory | null>(
    () => {
      if (!initialBookings?.hotels) return "hotels";
      const firstEmpty = OTHER_CATEGORIES.find(
        (c) => !(initialBookings as Record<string, unknown>)[c],
      );
      return firstEmpty ?? null;
    },
  );
  const [selectedBookings, setSelectedBookings] = useState<SelectedBookings>(
    initialBookings ?? {},
  );

  const data = getDestinationData(tripPlan.destination);

  const handleCategoryClick = useCallback((cat: ResultCategory) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  }, []);

  const handleResultSelect = useCallback(
    (category: ResultCategory, result: MockResult) => {
      setSelectedBookings((prev) => {
        const current = prev[category];
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

  const allCategories = [...transportCats, ...OTHER_CATEGORIES];
  const selectedCount = Object.keys(selectedBookings).length;
  const destinationDisplay = tripPlan.destination || "your destination";

  const ACCOM_LABEL: Record<AccomFilter, string> = {
    hotel: "Hotels (3–4 star)",
    boutique: "Boutique / Luxury hotels",
    apartment: "Apartments & Airbnbs",
    hostel: "Hostels & budget stays",
    all: "All accommodation types",
  };

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
          Tailored to your preferences · Select your favourites
        </p>
      </div>

      {/* ── Getting there ── */}
      <div className="results-section">
        <div className="results-section-label">Getting there</div>
        {isDriving ? (
          <div className="results-driving-note">
            🚗 You're driving to {destinationDisplay}. Need a hire car at the
            destination? Find options below.
          </div>
        ) : (
          transportCats.map((cat) => (
            <div key={cat} className="results-transport-block">
              {transportCats.length > 1 && (
                <div className="results-transport-sublabel">
                  {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
                </div>
              )}
              <div className="result-items">
                {data[cat].map((result) => (
                  <ResultItem
                    key={result.id}
                    result={result}
                    isSelected={selectedBookings[cat]?.id === result.id}
                    onSelect={(r) => handleResultSelect(cat, r)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── At your destination ── */}
      <div className="results-section">
        <div className="results-section-label">At your destination</div>
        <div className="results-accordion">
          {OTHER_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const isOpen = activeCategory === cat;
            const hasSelection = cat in selectedBookings;
            return (
              <div key={cat} className="results-accordion-item">
                <button
                  className={`results-accordion-trigger ${
                    isOpen ? "open" : ""
                  } ${hasSelection ? "has-selection" : ""}`}
                  onClick={() => handleCategoryClick(cat)}
                  aria-expanded={isOpen}
                  aria-label={`${
                    meta.label
                  }${hasSelection ? " — selection made" : ""}`}
                >
                  <span className="results-accordion-emoji" aria-hidden="true">
                    {meta.emoji}
                  </span>
                  <div className="results-accordion-info">
                    <div className="results-accordion-name">{meta.label}</div>
                    <div className="results-accordion-desc">
                      {hasSelection
                        ? `✓ ${selectedBookings[cat]!.name}`
                        : cat === "hotels"
                          ? ACCOM_LABEL[accomFilter]
                          : meta.description}
                    </div>
                  </div>
                  <span
                    className="results-accordion-chevron"
                    aria-hidden="true"
                  >
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>
                {isOpen && (
                  <div
                    className="results-accordion-body"
                    role="region"
                    aria-label={`${meta.label} options`}
                  >
                    {cat === "hotels" && (
                      <div className="results-accom-filter-note">
                        Showing: <strong>{ACCOM_LABEL[accomFilter]}</strong>
                      </div>
                    )}
                    <div className="result-items">
                      {(cat === "hotels"
                        ? filterHotels(data[cat], accomFilter)
                        : data[cat]
                      ).map((result) => (
                        <ResultItem
                          key={result.id}
                          result={result}
                          isSelected={selectedBookings[cat]?.id === result.id}
                          onSelect={(r) => handleResultSelect(cat, r)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="results-footer">
        {selectedCount > 0 && (
          <p className="results-selected-count">
            <strong>{selectedCount}</strong> of {allCategories.length}{" "}
            categories selected
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
            Pick your transport above, then choose hotels and activities
          </p>
        )}
      </div>
    </div>
  );
}
