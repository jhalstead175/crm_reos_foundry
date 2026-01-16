export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-app px-6">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h1 className="text-display text-center">Login</h1>
          <p className="mt-2 text-center text-subheadline text-secondary">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-subheadline-emphasized text-primary">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-primary focus:border-blue-500 motion-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-subheadline-emphasized text-primary">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-primary focus:border-blue-500 motion-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-subheadline-emphasized text-white bg-accent-primary hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary motion-button"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
