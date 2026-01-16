import { useLocation, Link } from "react-router-dom";

export function InspectionFooter() {
  const location = useLocation();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-xs py-3 px-4 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-2">
          <span className="font-mono text-gray-400">
            Route: <span className="text-blue-400">{location.pathname}</span>
          </span>
          <span className="text-gray-400">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <nav className="flex gap-8">
          <div>
            <div className="text-gray-500 font-semibold mb-1">Main</div>
            <div className="flex items-center gap-3">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              <span className="text-gray-600">|</span>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <span className="text-gray-600">|</span>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
            </div>
          </div>
          <div>
            <div className="text-gray-500 font-semibold mb-1">Transactions</div>
            <div className="flex items-center gap-3">
              <Link to="/transactions" className="text-gray-400 hover:text-white transition-colors">List</Link>
              <span className="text-gray-600">|</span>
              <Link to="/transactions/1" className="text-gray-400 hover:text-white transition-colors">Detail</Link>
            </div>
          </div>
          <div>
            <div className="text-gray-500 font-semibold mb-1">Tools</div>
            <div className="flex items-center gap-3">
              <Link to="/tasks" className="text-gray-400 hover:text-white transition-colors">Tasks</Link>
              <span className="text-gray-600">|</span>
              <Link to="/contacts" className="text-gray-400 hover:text-white transition-colors">Contacts</Link>
              <span className="text-gray-600">|</span>
              <Link to="/contacts/1" className="text-gray-400 hover:text-white transition-colors">Contact Detail</Link>
            </div>
          </div>
          <div>
            <div className="text-gray-500 font-semibold mb-1">Account</div>
            <div className="flex items-center gap-3">
              <Link to="/settings" className="text-gray-400 hover:text-white transition-colors">Settings</Link>
            </div>
          </div>
        </nav>
      </div>
    </footer>
  );
}
