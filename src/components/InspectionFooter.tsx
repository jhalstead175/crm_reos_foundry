import { useLocation } from "react-router-dom";

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
          <span className="text-gray-400">
            Chronos REOS CRM • Development Build
          </span>
        </div>
        <div className="text-gray-400">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </footer>
  );
}
