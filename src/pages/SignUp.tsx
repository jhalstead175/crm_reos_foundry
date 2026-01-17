import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your account has been created successfully.
            </p>
            <p className="text-xs text-gray-500">
              Redirecting to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/about" className="inline-block">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">REOS</h1>
          </Link>
          <p className="text-sm text-gray-600">Create your account</p>
        </div>

        {/* Sign Up Form */}
        <div className="border border-gray-200 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="John Doe"
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/signin" className="text-gray-900 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to landing */}
        <div className="mt-4 text-center">
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to landing page
          </Link>
        </div>
      </div>
    </div>
  );
}
