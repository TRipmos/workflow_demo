import { useState, useEffect, useRef, useCallback } from "react";
import type { TripPlan, ChatMessage } from "../types";

interface ConversationStep {
  field: keyof TripPlan;
  aiMessage: string;
  options: string[];
}

const CONVERSATION: ConversationStep[] = [
  {
    field: "destination",
    aiMessage:
      "Hi there! 👋 I'm Tripmos, your travel planning companion. Let's plan your perfect trip!\n\nWhere are you dreaming of going?",
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
    field: "dates",
    aiMessage: "Great choice! ✨\n\nWhen are you planning to travel?",
    options: [
      "This month",
      "Next month",
      "In 2–3 months",
      "In 6 months",
      "Flexible / TBD",
    ],
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
  { key: "dates", emoji: "🗓️", label: "Travel dates" },
  { key: "travellers", emoji: "👥", label: "Travellers" },
  { key: "budget", emoji: "💰", label: "Budget" },
  { key: "accommodation", emoji: "🏨", label: "Accommodation" },
  { key: "transport", emoji: "✈️", label: "Transport" },
];

const SOMEWHERE_ELSE_OPTION = "🗺️ Somewhere else?";

const SOMEWHERE_ELSE_NUDGE =
  "That sounds exciting! 😊\n\nJust a heads-up — this is a simulated prototype to help us understand how you'd plan a trip. The full Tripmos experience will be a fully conversational AI that accepts any destination you type.\n\nFor now, please pick one of the listed cities so we can walk you through the demo and gather your feedback. We promise it's worth it! 👇";

// Strip emoji prefix from option labels like "🗼 Paris" → "Paris"
function cleanOptionValue(option: string): string {
  return option.replace(/^[\p{Emoji}\s]+/u, "").trim();
}

interface Props {
  onComplete: (plan: TripPlan) => void;
}

export function ChatInterface({ onComplete }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [plan, setPlan] = useState<TripPlan>({
    destination: "",
    dates: "",
    travellers: "",
    budget: "",
    accommodation: "",
    transport: "",
  });
  const [showOptions, setShowOptions] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
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

      const step = CONVERSATION[currentStep];
      const value = cleanOptionValue(option);

      // Add user message
      addMessage("user", option);
      setShowOptions(false);

      // Update plan
      const updatedPlan = { ...plan, [step.field]: value };
      setPlan(updatedPlan);

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
            onComplete(updatedPlan);
          }, 2800);
        }, 1400);
      }
    },
    [
      isTyping,
      isComplete,
      currentStep,
      plan,
      addMessage,
      scrollToBottom,
      onComplete,
    ],
  );

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

      {showOptions && !isComplete && currentStep < CONVERSATION.length && (
        <div className="chat-options">
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
        </div>
      )}
    </div>
  );
}
