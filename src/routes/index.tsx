import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, NotebookPen, ListChecks } from "lucide-react";
import { Card } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkMate AI — Make today a little easier" },
      { name: "description", content: "Your elegant workplace assistant for emails, meeting notes and task planning." },
      { property: "og:title", content: "WorkMate AI — Make today a little easier" },
      { property: "og:description", content: "Less stress, more getting things done." },
    ],
  }),
  component: Index,
});

const features = [
  { to: "/email", icon: Mail, title: "Email Magic", text: "Draft polished emails in a formal, friendly or persuasive tone." },
  { to: "/meetings", icon: NotebookPen, title: "Meeting Notes", text: "Turn messy notes into summaries, decisions and action items." },
  { to: "/tasks", icon: ListChecks, title: "Task Planner", text: "Prioritise your to-dos and get a calm, realistic daily schedule." },
] as const;

function Index() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-hero p-8 shadow-lift md:p-12">
        <span aria-hidden className="absolute right-10 top-8 text-3xl text-card">✦</span>
        <span aria-hidden className="absolute bottom-10 right-28 text-lg text-card/80">✦</span>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary/70">{greet}</p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-primary md:text-5xl">
          Make today a little <span className="sparkle italic">easier.</span>
        </h1>
        <p className="mt-4 text-lg text-primary/80">Less stress, more getting things done.</p>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="group rounded-3xl focus-visible:outline-2 focus-visible:outline-ring">
            <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-lift">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-primary">
                <f.icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-rose">
                Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8 bg-secondary">
        <h2 className="text-lg font-semibold">About AI generation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          WorkMate AI currently shows clearly labelled <strong>demo responses</strong> generated on your device. To enable real
          AI writing, the app needs a secure backend connection (Lovable Cloud with the built-in AI service) so requests are
          processed on the server — no API keys are ever placed in the browser.
        </p>
      </Card>
    </>
  );
}
