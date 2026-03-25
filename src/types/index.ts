export type AppStep = "landing" | "chat" | "results" | "summary" | "feedback";

export interface TripPlan {
  destination: string;
  origin: string;
  dates: string;
  travellers: string;
  budget: string;
  accommodation: string;
  transport: string;
}

export type ResultCategory =
  | "flights"
  | "trains"
  | "hotels"
  | "local"
  | "carHire"
  | "activities";

export interface MockResult {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  detail1: string;
  detail2: string;
  rating: number;
  isBest: boolean;
  badge?: string;
  accomType?: "hotel" | "boutique" | "apartment" | "hostel";
}

export interface SelectedBookings {
  flights?: MockResult;
  trains?: MockResult;
  hotels?: MockResult;
  local?: MockResult;
  carHire?: MockResult;
  activities?: MockResult;
}

export interface ChatMessage {
  id: number;
  role: "ai" | "user";
  content: string;
}
