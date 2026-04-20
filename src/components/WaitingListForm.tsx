import { useState, type FormEvent } from "react";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwguD0U_htLia0mLwVHuLJyzOor9x6FiDXvwEAMolh6_dw5qlaDgMHVRQ0GXP_hYSJq/exec";

const TRAVEL_INTERESTS = [
  "Beach & Relaxation",
  "City Break",
  "Adventure & Outdoors",
  "Cultural & Historical",
  "Family Holiday",
  "Road Trip",
];

interface Props {
  variant: "landing" | "feedback";
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export function WaitingListForm({ variant }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<FormStatus>("idle");

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    setStatus("submitting");

    try {
      const formData = new FormData();
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("email", email.trim());
      formData.append("interests", interests.join(", "));
      formData.append("source", variant);

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={`waitlist-form waitlist-form--${variant}`}>
        <div className="waitlist-success">
          <span className="waitlist-success-icon" aria-hidden="true">
            🎉
          </span>
          <p className="waitlist-success-title">You're on the list!</p>
          <p className="waitlist-success-text">
            We'll be in touch when Tripmos is ready to launch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      className={`waitlist-form waitlist-form--${variant}`}
      onSubmit={handleSubmit}
    >
      <h3 className="waitlist-title">Join the Waiting List</h3>
      <p className="waitlist-subtitle">
        Be the first to know when Tripmos launches.
      </p>

      <div className="waitlist-fields">
        <div className="waitlist-name-row">
          <input
            className="waitlist-input"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={status === "submitting"}
          />
          <input
            className="waitlist-input"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={status === "submitting"}
          />
        </div>
        <input
          className="waitlist-input"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "submitting"}
        />
      </div>

      <fieldset
        className="waitlist-interests"
        disabled={status === "submitting"}
      >
        <legend className="waitlist-interests-label">
          What kind of trips interest you?
        </legend>
        <div className="waitlist-interests-grid">
          {TRAVEL_INTERESTS.map((interest) => (
            <label
              key={interest}
              className={`waitlist-interest-chip${interests.includes(interest) ? " selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={interests.includes(interest)}
                onChange={() => toggleInterest(interest)}
                className="visually-hidden"
              />
              {interest}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        className="waitlist-submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <span className="waitlist-spinner" aria-hidden="true" />
            Joining…
          </>
        ) : (
          "Join the Waiting List →"
        )}
      </button>

      {status === "error" && (
        <p className="waitlist-error">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
