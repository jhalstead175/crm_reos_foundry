import { useState } from "react";
import "./styles/onboarding.css";

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("agent");

  return (
    <main className="onboarding">
      <h1>Let’s get oriented</h1>
      <p>
        Chronos works best when responsibility is clear.
      </p>

      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="agent">Agent</option>
        <option value="assistant">Assistant</option>
        <option value="manager">Team lead</option>
      </select>

      <button onClick={onComplete}>Continue</button>
    </main>
  );
}
