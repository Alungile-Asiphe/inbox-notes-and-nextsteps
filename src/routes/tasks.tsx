import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { Card, DemoBadge, PageHeader } from "@/components/AppShell";
import { priorityOf, schedule, sortTasks, type Priority, type Task } from "@/lib/demo-ai";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner — WorkMate AI" },
      { name: "description", content: "Prioritise tasks by deadline and get a suggested daily schedule." },
      { property: "og:title", content: "Task Planner — WorkMate AI" },
      { property: "og:description", content: "A calm, prioritised plan for your day." },
    ],
  }),
  component: TasksPage,
});

const badge: Record<Priority, string> = {
  High: "bg-primary text-primary-foreground",
  Medium: "bg-rose text-primary-foreground",
  Low: "bg-blush text-primary",
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { setTasks(JSON.parse(localStorage.getItem("workmate-tasks") || "[]")); } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem("workmate-tasks", JSON.stringify(tasks)); }, [tasks, loaded]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setTasks((t) => [...t, { id: crypto.randomUUID(), title: title.trim(), deadline, minutes: Math.max(5, minutes), done: false }]);
    setTitle(""); setDeadline(""); setMinutes(30);
  };
  const toggle = (id: string) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id: string) => setTasks((t) => t.filter((x) => x.id !== id));

  const sorted = sortTasks(tasks);
  const plan = schedule(tasks);

  return (
    <>
      <PageHeader icon={ListChecks} title="Task Planner" subtitle="Add what's on your plate — we'll arrange it gently." />
      <Card>
        <form onSubmit={add} className="grid gap-3 md:grid-cols-[1fr_180px_140px_auto] md:items-end">
          <label className="text-sm font-semibold">Task<input required className="field mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finish Q3 report" /></label>
          <label className="text-sm font-semibold">Deadline<input type="date" className="field mt-1.5" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></label>
          <label className="text-sm font-semibold">Minutes<input type="number" min={5} step={5} className="field mt-1.5" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></label>
          <button className="btn-primary" type="submit"><Plus className="h-4 w-4" aria-hidden /> Add</button>
        </form>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">By priority</h2>
          {sorted.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No tasks yet — add your first one above.</p> : (
            <ul className="mt-3 space-y-2">
              {sorted.map((t) => {
                const p = priorityOf(t);
                return (
                  <li key={t.id} className="flex items-center gap-3 rounded-2xl border p-3">
                    <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} aria-label={`Mark ${t.title} complete`} className="h-4 w-4 accent-primary" />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.deadline || "No deadline"} · {t.minutes} min</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[p]}`}>{p}</span>
                    <button onClick={() => remove(t.id)} aria-label={`Delete ${t.title}`} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Suggested schedule</h2>
            <DemoBadge />
          </div>
          {plan.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Your day plan will appear here.</p> : (
            <ol className="mt-4 space-y-3 border-l-2 border-blush pl-4">
              {plan.map(({ task, start, end }) => (
                <li key={task.id}>
                  <p className="text-xs font-semibold text-rose">{start} – {end}</p>
                  <p className="text-sm font-medium">{task.title}</p>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Starts at 09:00 with short breaks and a lunch pause.</p>
        </Card>
      </div>
    </>
  );
}
