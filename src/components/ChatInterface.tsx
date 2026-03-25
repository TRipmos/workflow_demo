import { useState, useEffect, useRef, useCallback } from "react";
import type {
  TripPlan,
  ChatMessage,
  MockResult,
  SelectedBookings,
  ResultCategory,
} from "../types";
import { getDestinationData } from "../data/mockData";

interface ConversationStep {
  field: keyof TripPlan;
  aiMessage: string;
  options: string[];
  type?: "options" | "date-range";
}

const CONVERSATION: ConversationStep[] = [
  {
    field: "destination",
    aiMessage:
      "Hi there! 👋 I’m Tripmos — here to help you plan your perfect trip.",
    options: [
      "🗼 Paris",
      "🗾 Tokyo",
      "🗽 New York",
      "🏖️ Barcelona",
      "🌴 Bali",
      "�️ Dubai",
      "🌸 Kyoto",
      "🗺️ Somewhere else?",
    ],
  },
  {
    field: "origin",
    aiMessage: "Great choice! ✨\n\nWhere will you be travelling from?",
    options: [
      "🇬🇧 London",
      "🇬🇧 Manchester",
      "🇬🇧 Edinburgh",
      "🇮🇪 Dublin",
      "🇳🇱 Amsterdam",
      "🇩🇪 Frankfurt",
      "🇺🇸 New York",
      "🌍 Other city?",
    ],
  },
  {
    field: "dates",
    aiMessage:
      "Perfect! 🗓️\n\nWhen are you planning to travel? Pick your exact dates — or go flexible if you're still deciding.",
    options: [],
    type: "date-range",
  },
  {
    field: "travellers",
    aiMessage: "Perfect! 🗓️\n\nHow many people will be travelling?",
    options: [
      "Just me",
      "2 adults",
      "2 adults + 1 child",
      "2 adults + 2 children",
      "Group of 4+",
    ],
  },
  {
    field: "budget",
    aiMessage: "Got it! Now, what's your approximate budget per person?",
    options: [
      "Budget (under £500)",
      "Mid-range (£500–£1,500)",
      "Premium (£1,500–£3,000)",
      "Luxury (£3,000+)",
    ],
  },
  {
    field: "accommodation",
    aiMessage: "Excellent! 💰\n\nWhat type of accommodation do you prefer?",
    options: [
      "Hotel (3–4 star)",
      "Boutique / Luxury hotel",
      "Apartment / Airbnb",
      "Hostel / Budget",
      "Flexible",
    ],
  },
  {
    field: "transport",
    aiMessage: "Almost there! 🏨\n\nHow do you prefer to get there?",
    options: [
      "✈️ Flight",
      "🚆 Train",
      "✈️🚆 Mix of both",
      "🚗 Drive",
      "⚡ Fastest option",
    ],
  },
];

const SUMMARY_FIELDS: Array<{
  key: keyof TripPlan;
  emoji: string;
  label: string;
}> = [
  { key: "destination", emoji: "📍", label: "Destination" },
  { key: "origin", emoji: "🛫", label: "Travelling from" },
  { key: "dates", emoji: "🗓️", label: "Travel dates" },
  { key: "travellers", emoji: "👥", label: "Travellers" },
  { key: "budget", emoji: "💰", label: "Budget" },
  { key: "accommodation", emoji: "🏨", label: "Accommodation" },
  { key: "transport", emoji: "✈️", label: "Transport" },
];

const SOMEWHERE_ELSE_OPTION = "🗺️ Somewhere else?";

const SOMEWHERE_ELSE_NUDGE =
  "That sounds exciting! 😊\n\nJust a heads-up — this is a simulated prototype to help us understand how you'd plan a trip. The full Tripmos experience will be a fully conversational AI that accepts any destination you type.\n\nFor now, please pick one of the listed cities so we can walk you through the demo and gather your feedback. We promise it's worth it! 👇";

const ORIGIN_OTHER_OPTION = "🌍 Other city?";
const ORIGIN_OTHER_NUDGE =
  "No worries! 😊 The full Tripmos experience will let you type any departure city. For this demo, please pick one of the listed cities so we can show you the full experience. 👇";

// Strip emoji prefix from option labels like "🗼 Paris" → "Paris"
function cleanOptionValue(option: string): string {
  return option.replace(/^[\p{Emoji}\u{FE0F}\u{200D}\s]+/u, "").trim();
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

const ACCOM_LABELS: Record<AccomFilter, string> = {
  hotel: "hotels (3–4 star)",
  boutique: "boutique & luxury hotels",
  apartment: "apartments & Airbnbs",
  hostel: "hostels & budget stays",
  all: "accommodation options",
};

interface Props {
  onComplete: (plan: TripPlan, preSelected: SelectedBookings) => void;
}

export function ChatInterface({ onComplete }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [plan, setPlan] = useState<TripPlan>({
    destination: "",
    origin: "",
    dates: "",
    travellers: "",
    budget: "",
    accommodation: "",
    transport: "",
  });
  const [showOptions, setShowOptions] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [inlinePick, setInlinePick] = useState<
    "accommodation" | "transport" | null
  >(null);
  const [preSelected, setPreSelected] = useState<SelectedBookings>({});
  const messageEndRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(1);

  const addMessage = useCallback(
    (role: ChatMessage["role"], content: string) => {
      const id = nextIdRef.current++;
      setMessages((prev) => [...prev, { id, role, content }]);
    },
    [],
  );

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }, []);

  // Kick off first AI message
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage("ai", CONVERSATION[0].aiMessage);
        setShowOptions(true);
        scrollToBottom();
      }, 1200);
    }, 400);
    return () => clearTimeout(timer);
  }, [addMessage, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleOptionSelect = useCallback(
    (option: string) => {
      if (isTyping || isComplete) return;

      // Intercept "Somewhere else?" — show a nudge without advancing the step
      if (option === SOMEWHERE_ELSE_OPTION) {
        addMessage("user", option);
        setShowOptions(false);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage("ai", SOMEWHERE_ELSE_NUDGE);
          setShowOptions(true);
          scrollToBottom();
        }, 1200);
        return;
      }

      // Intercept "Other city?" for origin — same nudge pattern
      if (option === ORIGIN_OTHER_OPTION) {
        addMessage("user", option);
        setShowOptions(false);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage("ai", ORIGIN_OTHER_NUDGE);
          setShowOptions(true);
          scrollToBottom();
        }, 1200);
        return;
      }

      const step = CONVERSATION[currentStep];
      const value = cleanOptionValue(option);

      // Add user message
      addMessage("user", option);
      setShowOptions(false);

      // Update plan
      const updatedPlan = { ...plan, [step.field]: value };
      setPlan(updatedPlan);

      // After accommodation type → show inline hotel options with prices
      if (step.field === "accommodation") {
        const accomType = getAccomFilter(value);
        const destData = getDestinationData(updatedPlan.destination);
        const hotels = filterHotels(destData.hotels, accomType);
        if (hotels.length > 0) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addMessage(
              "ai",
              `Here are some ${ACCOM_LABELS[accomType]} in ${updatedPlan.destination} — pick your favourite:`,
            );
            setInlinePick("accommodation");
            setShowOptions(true);
            scrollToBottom();
          }, 1400);
          return;
        }
      }

      // After transport type → show inline transport options (Flight or Train)
      if (step.field === "transport") {
        const t = value.toLowerCase();
        if (t === "flight" || t === "train") {
          const destData = getDestinationData(updatedPlan.destination);
          const results = t === "flight" ? destData.flights : destData.trains;
          const label = t === "flight" ? "flights" : "trains";
          if (results.length > 0) {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              addMessage(
                "ai",
                `Here are available ${label} to ${updatedPlan.destination} — pick your preferred option:`,
              );
              setInlinePick("transport");
              setShowOptions(true);
              scrollToBottom();
            }, 1400);
            return;
          }
        }
      }

      const nextStep = currentStep + 1;

      if (nextStep < CONVERSATION.length) {
        // Show typing then next AI message
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage("ai", CONVERSATION[nextStep].aiMessage);
          setCurrentStep(nextStep);
          setShowOptions(true);
          scrollToBottom();
        }, 1400);
      } else {
        // All questions answered — show summary
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setIsComplete(true);
          setCurrentStep(nextStep);
          scrollToBottom();

          setTimeout(() => {
            onComplete(updatedPlan, preSelected);
          }, 2800);
        }, 1400);
      }
    },
    [
      isTyping,
      isComplete,
      currentStep,
      plan,
      preSelected,
      addMessage,
      scrollToBottom,
      onComplete,
    ],
  );

  const handleDateConfirm = useCallback(
    (dep: string, ret: string) => {
      if (!dep || !ret || isTyping || isComplete) return;
      const fmt = (s: string) =>
        new Date(s + "T00:00:00").toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      const formatted = `${fmt(dep)} – ${fmt(ret)}`;
      setDeparture("");
      setReturnDate("");
      handleOptionSelect(formatted);
    },
    [isTyping, isComplete, handleOptionSelect],
  );

  const handleInlineResultPick = useCallback(
    (result: MockResult) => {
      if (isTyping || isComplete) return;

      const category: ResultCategory =
        inlinePick === "accommodation"
          ? "hotels"
          : plan.transport.toLowerCase() === "train"
            ? "trains"
            : "flights";

      const updatedPreSelected = { ...preSelected, [category]: result };
      setPreSelected(updatedPreSelected);

      addMessage("user", `✓ ${result.name} — ${result.price}`);
      setShowOptions(false);
      setInlinePick(null);

      const nextStep = currentStep + 1;
      if (nextStep < CONVERSATION.length) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage("ai", CONVERSATION[nextStep].aiMessage);
          setCurrentStep(nextStep);
          setShowOptions(true);
          scrollToBottom();
        }, 1400);
      } else {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setIsComplete(true);
          setCurrentStep(nextStep);
          scrollToBottom();

          setTimeout(() => {
            onComplete(plan, updatedPreSelected);
          }, 2800);
        }, 1400);
      }
    },
    [
      isTyping,
      isComplete,
      inlinePick,
      plan,
      preSelected,
      currentStep,
      addMessage,
      scrollToBottom,
      onComplete,
    ],
  );

  const inlinePickResults: MockResult[] = (() => {
    if (!inlinePick || !plan.destination) return [];
    const data = getDestinationData(plan.destination);
    if (inlinePick === "accommodation") {
      return filterHotels(data.hotels, getAccomFilter(plan.accommodation));
    }
    const t = plan.transport.toLowerCase();
    if (t === "flight") return data.flights;
    if (t === "train") return data.trains;
    return [];
  })();

  const destinationLabel = cleanOptionValue(plan.destination || "");

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <div className="chat-avatar" aria-hidden="true">
          🤖
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">Tripmos</div>
          <div className="chat-header-status">
            <span className="chat-status-dot" />
            Online
          </div>
        </div>
      </div>

      <div
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role === "ai" ? "chat-message-ai" : "chat-message-user"}`}
          >
            {msg.role === "ai" && (
              <div className="chat-message-avatar" aria-hidden="true">
                🤖
              </div>
            )}
            <div
              className={`chat-bubble ${msg.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"}`}
            >
              {msg.content.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.content.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator chat-message chat-message-ai">
            <div className="chat-message-avatar" aria-hidden="true">
              🤖
            </div>
            <div className="typing-dots" aria-label="AI is typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {isComplete && !isTyping && (
          <div className="chat-message chat-message-ai animate-fadeIn">
            <div className="chat-message-avatar" aria-hidden="true">
              🤖
            </div>
            <div className="chat-bubble-summary">
              <div className="chat-summary-title">
                ✅ Perfect! Here's your trip summary:
              </div>
              <div className="chat-summary-items">
                {SUMMARY_FIELDS.map(({ key, emoji, label }) => (
                  <div key={key} className="chat-summary-item">
                    <span className="chat-summary-item-icon">{emoji}</span>
                    <strong>{label}:</strong>
                    &nbsp;{plan[key] || "—"}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#047857",
                }}
              >
                🚀 Finding the best options for your trip to{" "}
                {destinationLabel || "your destination"}…
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {showOptions &&
        !isComplete &&
        (inlinePick || currentStep < CONVERSATION.length) && (
          <div className="chat-options">
            {inlinePick ? (
              <>
                <div className="chat-options-label">
                  {inlinePick === "accommodation"
                    ? "Pick your accommodation"
                    : "Pick your transport"}
                </div>
                <div className="chat-inline-results">
                  {inlinePickResults.map((result) => (
                    <div
                      key={result.id}
                      className="chat-inline-result"
                      onClick={() => handleInlineResultPick(result)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleInlineResultPick(result);
                      }}
                    >
                      <div className="chat-inline-result-info">
                        <div className="chat-inline-result-name">
                          {result.name}
                        </div>
                        <div className="chat-inline-result-sub">
                          {result.subtitle}
                        </div>
                        <div className="chat-inline-result-detail">
                          {result.detail1}
                        </div>
                      </div>
                      <div className="chat-inline-result-right">
                        <div className="chat-inline-result-price">
                          {result.price}
                        </div>
                        {result.badge && (
                          <span className="chat-inline-result-badge">
                            {result.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : CONVERSATION[currentStep].type === "date-range" ? (
              <>
                <div className="chat-options-label">
                  Select your travel dates
                </div>
                <div className="chat-datepicker">
                  <div className="chat-datepicker-row">
                    <div className="chat-datepicker-field">
                      <label className="chat-datepicker-label">Departure</label>
                      <input
                        type="date"
                        className="chat-datepicker-input"
                        min={new Date().toISOString().split("T")[0]}
                        value={departure}
                        onChange={(e) => {
                          setDeparture(e.target.value);
                          if (returnDate && returnDate < e.target.value)
                            setReturnDate("");
                        }}
                      />
                    </div>
                    <div className="chat-datepicker-field">
                      <label className="chat-datepicker-label">Return</label>
                      <input
                        type="date"
                        className="chat-datepicker-input"
                        min={
                          departure || new Date().toISOString().split("T")[0]
                        }
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        disabled={!departure}
                      />
                    </div>
                  </div>
                  <button
                    className="chat-datepicker-confirm"
                    disabled={!departure || !returnDate || isTyping}
                    onClick={() => handleDateConfirm(departure, returnDate)}
                  >
                    Confirm dates →
                  </button>
                  <button
                    className="chat-datepicker-flexible"
                    disabled={isTyping}
                    onClick={() => handleOptionSelect("Flexible dates")}
                  >
                    I'm flexible on dates
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="chat-options-label">Choose an option</div>
                <div className="chat-options-grid">
                  {CONVERSATION[currentStep].options.map((option) => (
                    <button
                      key={option}
                      className="chat-option-btn"
                      onClick={() => handleOptionSelect(option)}
                      disabled={isTyping}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
    </div>
  );
}
