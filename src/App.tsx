import { useState, useCallback } from "react";
import type { AppStep, TripPlan, SelectedBookings } from "./types";
import { LandingScreen } from "./components/LandingScreen";
import { ChatInterface } from "./components/ChatInterface";
import { ResultsExploration } from "./components/ResultsExploration";
import { ItinerarySummary } from "./components/ItinerarySummary";
import { FeedbackScreen } from "./components/FeedbackScreen";
import { ProgressIndicator } from "./components/ProgressIndicator";

const EMPTY_TRIP_PLAN: TripPlan = {
  destination: "",
  dates: "",
  travellers: "",
  budget: "",
  accommodation: "",
  transport: "",
};

export default function App() {
  const [step, setStep] = useState<AppStep>("landing");
  const [tripPlan, setTripPlan] = useState<TripPlan>(EMPTY_TRIP_PLAN);
  const [selectedBookings, setSelectedBookings] = useState<SelectedBookings>(
    {},
  );

  const handleStart = useCallback(() => setStep("chat"), []);

  const handleChatComplete = useCallback((plan: TripPlan) => {
    setTripPlan(plan);
    setStep("results");
  }, []);

  const handleResultsDone = useCallback((bookings: SelectedBookings) => {
    setSelectedBookings(bookings);
    setStep("summary");
  }, []);

  const handleSummaryContinue = useCallback(() => setStep("feedback"), []);

  const handleRestart = useCallback(() => {
    setStep("landing");
    setTripPlan(EMPTY_TRIP_PLAN);
    setSelectedBookings({});
  }, []);

  const stepNumber = {
    landing: 0,
    chat: 1,
    results: 2,
    summary: 3,
    feedback: 4,
  }[step];

  return (
    <div className="app-container">
      {step !== "landing" && (
        <ProgressIndicator
          currentStep={stepNumber}
          totalSteps={4}
          onRestart={handleRestart}
        />
      )}

      <main className="app-main">
        {step === "landing" && <LandingScreen onStart={handleStart} />}
        {step === "chat" && <ChatInterface onComplete={handleChatComplete} />}
        {step === "results" && (
          <ResultsExploration
            tripPlan={tripPlan}
            onComplete={handleResultsDone}
          />
        )}
        {step === "summary" && (
          <ItinerarySummary
            tripPlan={tripPlan}
            selectedBookings={selectedBookings}
            onContinue={handleSummaryContinue}
            onRestart={handleRestart}
          />
        )}
        {step === "feedback" && <FeedbackScreen onRestart={handleRestart} />}
      </main>
    </div>
  );
}
