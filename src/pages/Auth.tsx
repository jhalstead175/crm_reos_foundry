import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./styles/auth.css";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (mode: "signin" | "signup") => {
    setLoading(true);
    setError(null);

    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword
        : supabase.auth.signUp;

    const { error } = await fn({ email, password });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <main className="auth">
      <h1>Welcome to Chronos</h1>
      <p className="auth-subhead">
        Sign in or create an account to start.
      </p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="auth-error">{error}</p>}

      <div className="auth-actions">
        <button onClick={() => handleAuth("signin")} disabled={loading}>
          Sign in
        </button>
        <button onClick={() => handleAuth("signup")} disabled={loading}>
          Create account
        </button>
      </div>
    </main>
  );
}
