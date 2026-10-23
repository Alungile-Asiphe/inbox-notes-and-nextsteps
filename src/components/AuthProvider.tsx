import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const AuthContext = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });
export const useWorkmateAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => { if (alive) { setUser(data.session?.user ?? null); setReady(true); } });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUser(session?.user ?? null);
      setReady(true);
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
      else queryClient.removeQueries({ queryKey: ["conversation"] });
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, [router, queryClient]);
  return <AuthContext.Provider value={{ user, ready }}>{children}</AuthContext.Provider>;
}

export function SignInNotice({ action }: { action: string }) {
  const { user, ready } = useWorkmateAuth();
  if (user || !ready) return null;
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-secondary px-4 py-3 text-sm"><span>Sign in to {action}.</span><Button asChild size="sm"><Link to="/auth"><LogIn /> Sign in</Link></Button></div>;
}