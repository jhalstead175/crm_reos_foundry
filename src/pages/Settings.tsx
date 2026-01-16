export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-title-1 mb-6">Settings</h1>

        {/* Account Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-title-2 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-subheadline-emphasized text-primary">
                Email
              </label>
              <input
                id="email"
                type="email"
                defaultValue="user@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-subheadline-emphasized text-primary">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                defaultValue="(555) 123-4567"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-subheadline-emphasized motion-button">
            Save Changes
          </button>
        </div>

        {/* Password */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-title-2 mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-subheadline-emphasized text-primary">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-subheadline-emphasized text-primary">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-subheadline-emphasized text-primary">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-subheadline-emphasized motion-button">
            Update Password
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-title-2 mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-subheadline text-primary">Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-subheadline text-primary">SMS notifications</span>
            </label>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-subheadline-emphasized motion-button">
            Save Preferences
          </button>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-title-2 mb-4">Account Actions</h2>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-subheadline-emphasized motion-button">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
