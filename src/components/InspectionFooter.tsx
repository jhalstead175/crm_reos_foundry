import { useLocation, Link } from "react-router-dom";

export function InspectionFooter() {
  const location = useLocation();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-xs py-2 px-4 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-mono">
            Route: <span className="text-blue-400">{location.pathname}</span>
          </span>
          <span className="text-gray-400">|</span>
          <nav className="flex items-center gap-2">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="text-gray-600">•</span>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
            <span className="text-gray-600">•</span>
            <Link to="/transactions" className="text-gray-400 hover:text-white transition-colors">Transactions</Link>
            <span className="text-gray-600">•</span>
            <Link to="/transactions/1" className="text-gray-400 hover:text-white transition-colors">Detail</Link>
            <span className="text-gray-600">•</span>
            <Link to="/tasks" className="text-gray-400 hover:text-white transition-colors">Tasks</Link>
            <span className="text-gray-600">•</span>
            <Link to="/contacts/1" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            <span className="text-gray-600">•</span>
            <Link to="/settings" className="text-gray-400 hover:text-white transition-colors">Settings</Link>
          </nav>
        </div>
        <div className="text-gray-400">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </footer>
  );
}
