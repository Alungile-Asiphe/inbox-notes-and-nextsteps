import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Mail, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Card, DemoBadge, PageHeader } from "@/components/AppShell";
import { demoEmail, type Tone } from "@/lib/demo-ai";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Magic — WorkMate AI" },
      { name: "description", content: "Generate editable, well-toned work emails with a subject line." },
      { property: "og:title", content: "Email Magic — WorkMate AI" },
      { property: "og:description", content: "Formal, friendly or persuasive emails in seconds." },
    ],
  }),
  component: EmailPage,
});

const tones: Tone[] = ["Formal", "Friendly", "Persuasive"];

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<Tone>("Friendly");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const generate = (e: React.FormEvent) => {
    e.preventDefault();
    const r = demoEmail(purpose, recipient, details, tone);
    setSubject(r.subject);
    setBody(r.body);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    toast.success("Email copied to clipboard");
  };

  return (
    <>
      <PageHeader icon={Mail} title="Email Magic" subtitle="Tell me what you need — I'll help you say it beautifully." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <form onSubmit={generate} className="space-y-4">
            <label className="block text-sm font-semibold">
              Purpose
              <input required className="field mt-1.5" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Request project update" />
            </label>
            <label className="block text-sm font-semibold">
              Recipient
              <input required className="field mt-1.5" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Thandi" />
            </label>
            <label className="block text-sm font-semibold">
              Details
              <textarea required rows={5} className="field mt-1.5" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Key points to include…" />
            </label>
            <fieldset>
              <legend className="text-sm font-semibold">Tone</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    type="button"
                    key={t}
                    aria-pressed={tone === t}
                    onClick={() => setTone(t)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${tone === t ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <button className="btn-primary w-full" type="submit">
              <Wand2 className="h-4 w-4" aria-hidden /> Generate email
            </button>
          </form>
        </Card>

        <Card>
          {body ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <DemoBadge />
                <button onClick={copy} className="btn-soft"><Copy className="h-4 w-4" aria-hidden /> Copy</button>
              </div>
              <label className="block text-sm font-semibold">
                Subject
                <input className="field mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </label>
              <label className="block text-sm font-semibold">
                Email (editable)
                <textarea rows={14} className="field mt-1.5 leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />
              </label>
            </div>
          ) : (
            <Empty text="Your drafted email will appear here, ready to edit and copy." />
          )}
        </Card>
      </div>
    </>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="grid h-full min-h-60 place-items-center text-center text-sm text-muted-foreground">
      <div><div className="mb-2 text-2xl text-rose" aria-hidden>✦</div>{text}</div>
    </div>
  );
}
