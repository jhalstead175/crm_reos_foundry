import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-app flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner-lg"></div>
          <div className="text-subheadline text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
