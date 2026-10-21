import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Mail, NotebookPen, ListChecks, Sparkles, Info } from "lucide-react";
import type { ReactNode } from "react";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Magic", icon: Mail },
  { to: "/meetings", label: "Meeting Notes", icon: NotebookPen },
  { to: "/tasks", label: "Task Planner", icon: ListChecks },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar p-5 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-display text-xl font-semibold">WorkMate AI</span>
        </Link>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-sidebar-accent shadow-soft text-primary" : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" aria-hidden />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Disclaimer className="mt-auto" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b bg-sidebar px-4 py-3 md:hidden">
          <Sparkles className="h-4 w-4 text-rose" aria-hidden />
          <span className="font-display text-lg font-semibold">WorkMate AI</span>
        </header>
        <main className="flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10">
          <div className="mx-auto max-w-5xl">{children}</div>
          <Disclaimer className="mx-auto mt-10 max-w-5xl md:hidden" />
        </main>
      </div>

      <nav aria-label="Main mobile" className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 rounded-2xl border bg-card p-1.5 shadow-lift md:hidden">
        {NAV.map((n) => {
          const active = path === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium ${active ? "bg-secondary text-primary" : "text-muted-foreground"}`}
            >
              <n.icon className="h-5 w-5" aria-hidden />
              {n.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p role="note" className={`flex gap-2 rounded-xl bg-card p-3 text-xs text-muted-foreground ${className}`}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose" aria-hidden />
      AI can make mistakes. Please review and verify all outputs before using them.
    </p>
  );
}

export function PageHeader({ icon: Icon, title, subtitle }: { icon: typeof Mail; title: string; subtitle: string }) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blush text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-primary">
      <Sparkles className="h-3 w-3" aria-hidden /> Demo response — real AI not connected
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border bg-card p-6 shadow-soft ${className}`}>{children}</section>;
}
