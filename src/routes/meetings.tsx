import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, NotebookPen, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Card, DemoBadge, PageHeader } from "@/components/AppShell";
import { demoMeeting, type MeetingResult } from "@/lib/demo-ai";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes — WorkMate AI" },
      { name: "description", content: "Organise meeting notes into summaries, decisions, action items, owners and deadlines." },
      { property: "og:title", content: "Meeting Notes — WorkMate AI" },
      { property: "og:description", content: "Clear outcomes from messy meeting notes." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [res, setRes] = useState<MeetingResult | null>(null);

  const copy = async () => {
    if (!res) return;
    const txt = `Summary:\n${res.summary}\n\nKey decisions:\n${res.decisions.map((d) => `- ${d}`).join("\n") || "- Not specified"}\n\nAction items:\n${res.actions.map((a) => `- ${a.task} (Owner: ${a.owner}; Deadline: ${a.deadline})`).join("\n") || "- Not specified"}`;
    await navigator.clipboard.writeText(txt);
    toast.success("Notes copied");
  };

  return (
    <>
      <PageHeader icon={NotebookPen} title="Meeting Notes" subtitle="Paste your notes and get a tidy, shareable overview." />
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); setRes(demoMeeting(notes)); }} className="space-y-4">
          <label className="block text-sm font-semibold">
            Meeting notes
            <textarea required rows={8} className="field mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={"We agreed to launch the campaign in March.\nSipho will send the budget by Friday.\nLerato to prepare the slides."} />
          </label>
          <button className="btn-primary" type="submit"><Wand2 className="h-4 w-4" aria-hidden /> Organise notes</button>
        </form>
      </Card>

      {res && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DemoBadge />
            <button onClick={copy} className="btn-soft"><Copy className="h-4 w-4" aria-hidden /> Copy all</button>
          </div>
          <p className="text-xs text-muted-foreground">Anything not found in your notes is marked "Not specified" — nothing is invented.</p>
          <Card>
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="mt-2 text-sm leading-relaxed">{res.summary}</p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Key decisions</h2>
            {res.decisions.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{res.decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
            ) : <p className="mt-2 text-sm text-muted-foreground">Not specified</p>}
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Action items</h2>
            {res.actions.length ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground"><tr><th className="py-2 pr-4 font-semibold">Action</th><th className="py-2 pr-4 font-semibold">Responsible</th><th className="py-2 font-semibold">Deadline</th></tr></thead>
                  <tbody>
                    {res.actions.map((a, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 pr-4">{a.task}</td>
                        <td className="py-2 pr-4">{a.owner}</td>
                        <td className="py-2">{a.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="mt-2 text-sm text-muted-foreground">Not specified</p>}
          </Card>
        </div>
      )}
    </>
  );
}
