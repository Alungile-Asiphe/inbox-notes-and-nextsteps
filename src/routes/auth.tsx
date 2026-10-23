import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/auth")({ head: () => ({ meta: [{ title: "Sign in — WorkMate AI" }, { name: "description", content: "Sign in to WorkMate AI and keep your workplace chatbot conversation safe." }, { property: "og:title", content: "Your WorkMate AI account" }, { property: "og:description", content: "Access your workplace assistant and saved conversation." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: AuthPage });

function AuthPage() {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  return <div className="mx-auto max-w-md"><PageHeader icon={LogIn} title={signup ? "Create your account" : "Welcome back"} subtitle="Your own little space to get things done." /><Card><div className="mb-5 flex gap-2"><Button variant={signup ? "ghost" : "secondary"} onClick={() => { setSignup(false); setMessage(""); }}>Sign in</Button><Button variant={signup ? "secondary" : "ghost"} onClick={() => { setSignup(true); setMessage(""); }}>Create account</Button></div><form className="space-y-4" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = signup ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } }) : await supabase.auth.signInWithPassword({ email, password });
      if (response.error) { setMessage(response.error.message); return; }
      if (response.data.session) await navigate({ to: "/" });
      else setMessage("Check your email to confirm your account, then sign in.");
    } catch { setMessage("The account service could not be reached. Please try again."); }
    finally { setBusy(false); }
  }}><label className="block text-sm font-semibold">Email<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-2" /></label><label className="block text-sm font-semibold">Password<input required type="password" minLength={6} autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="field mt-2" /></label>{message && <p role="status" className="text-sm text-foreground">{message}</p>}<Button type="submit" disabled={busy} className="w-full">{signup ? <UserPlus /> : <LogIn />}{busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</Button></form></Card></div>;
}