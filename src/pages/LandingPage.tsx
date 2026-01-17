import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Large watermark logo in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <div className="text-[40rem] font-bold text-gray-900 select-none">
          REOS
        </div>
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo - replace with <img src="/your-logo.svg" alt="REOS" /> when you add your logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-900">REOS</span>
          </div>

          {/* Sign in link */}
          <Link
            to="/signin"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="relative">
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
          <h1 className="text-6xl font-semibold text-gray-900 mb-6 tracking-tight">
            Always know where a deal stands — and why.
          </h1>

          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Most real estate systems track statuses.
          </p>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            REOS records what actually happens.
          </p>

          <p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto">
            A calm operating system for real estate transactions, built on events instead of guesswork.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start using REOS
            </Link>
            <Link
              to="/signin"
              className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Why REOS section */}
        <div className="max-w-4xl mx-auto px-6 py-24 border-t border-gray-100">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Why CRMs feel chaotic
          </h2>

          <p className="text-lg text-gray-600 mb-6">
            Statuses drift. Timelines fragment. Tasks linger without context. Responsibility becomes unclear.
          </p>

          <p className="text-lg text-gray-600 mb-6">
            Most CRMs ask you to keep the system updated. REOS does the opposite.
          </p>

          <p className="text-lg font-medium text-gray-900">
            It listens.
          </p>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto px-6 py-24 border-t border-gray-100">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Event-driven
              </h3>
              <p className="text-gray-600">
                Track what actually happens, not what you think might happen.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Contact management
              </h3>
              <p className="text-gray-600">
                Follow-ups, lead scoring, and relationship tracking that works.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Property intelligence
              </h3>
              <p className="text-gray-600">
                MLS data, valuations, and rental estimates in one place.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} REOS CRM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
