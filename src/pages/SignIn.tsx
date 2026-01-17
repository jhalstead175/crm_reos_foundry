import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-app flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
            <h1 className="text-title-1">REOS CRM</h1>
          </div>
          <p className="text-subheadline text-secondary">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md badge-error">
                <p className="text-footnote">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-subheadline-emphasized text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base w-full px-4 py-2.5"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-subheadline-emphasized text-primary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base w-full px-4 py-2.5"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary px-4 py-2.5"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-subheadline text-secondary">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="mt-6 p-4 bg-surface-muted rounded-lg border border-surface-subtle">
          <p className="text-footnote text-secondary text-center">
            <strong>Demo Mode:</strong> Create an account or sign in to access your personalized CRM.
          </p>
        </div>
      </div>
    </div>
  );
}
