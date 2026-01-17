import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Overview" },
    { path: "/contacts", label: "Contacts" },
    { path: "/transactions", label: "Transactions" },
    { path: "/properties", label: "Properties" },
    { path: "/tasks", label: "Tasks" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-surface-app">
      {/* Top Header Bar */}
      <div className="bg-surface-panel border-b border-surface-subtle shadow-sm">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left side - Logo and Project Name */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <svg className="w-6 h-6" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 19h20L12 2z" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
              <span className="text-sm font-medium text-primary">REOS CRM</span>
              <span className="text-xs badge-neutral px-1.5 py-0.5 rounded">Pro</span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Find..."
                className="input-base w-64 h-8 pl-8 pr-10 text-sm"
              />
              <svg className="absolute left-2.5 top-2 w-4 h-4 text-secondary" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <kbd className="absolute right-2 top-1.5 text-xs text-secondary font-mono">F</kbd>
            </div>
            <button className="text-sm text-secondary hover:text-primary motion-text">Feedback</button>
            <button className="relative motion-text">
              <svg className="w-5 h-5 text-secondary hover:text-primary" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-info)' }}></span>
            </button>
            <button className="motion-text">
              <svg className="w-5 h-5 text-secondary hover:text-primary" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 cursor-pointer"></div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 px-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-3 text-sm border-b-2 motion-tab ${
                isActive(item.path)
                  ? "border-accent-primary text-accent-primary font-medium"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/settings"
            className={`py-3 text-sm border-b-2 motion-tab ${
              location.pathname === "/settings"
                ? "border-accent-primary text-accent-primary font-medium"
                : "border-transparent text-secondary hover:text-primary"
            }`}
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="bg-surface-app">{children}</main>
    </div>
  );
}
