import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Onboarding from "./Onboarding";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session) return null; // Router sends to /auth

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  return <>{children}</>;
}
