// Local demo generators used while real AI is not connected. No network, no keys.

export type Tone = "Formal" | "Friendly" | "Persuasive";

export function demoEmail(purpose: string, recipient: string, details: string, tone: Tone) {
  const name = recipient.trim() || "there";
  const subject = `${tone === "Persuasive" ? "Opportunity: " : ""}${purpose.trim() || "Quick note"}`;
  const open = { Formal: `Dear ${name},`, Friendly: `Hi ${name},`, Persuasive: `Hi ${name},` }[tone];
  const intro = {
    Formal: `I am writing regarding ${purpose.trim() || "the matter below"}.`,
    Friendly: `Hope you're having a lovely week! I wanted to reach out about ${purpose.trim() || "something"}.`,
    Persuasive: `I'd love to share something I believe could make a real difference: ${purpose.trim() || "the idea below"}.`,
  }[tone];
  const close = {
    Formal: "I look forward to your response.\n\nKind regards,\n[Your name]",
    Friendly: "Let me know what you think!\n\nWarm wishes,\n[Your name]",
    Persuasive: "Could we find 15 minutes this week to discuss? I'm confident it'll be worth it.\n\nBest,\n[Your name]",
  }[tone];
  const body = `${open}\n\n${intro}\n\n${details.trim()}\n\n${close}`;
  return { subject, body };
}

export type MeetingResult = {
  summary: string;
  decisions: string[];
  actions: { task: string; owner: string; deadline: string }[];
};

const NS = "Not specified";

export function demoMeeting(notes: string): MeetingResult {
  const lines = notes
    .split(/\n|(?<=[.!?])\s+/)
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);
  const decisions = lines.filter((l) => /\b(decided|agreed|approved|confirmed|decision)\b/i.test(l));
  const actionLines = lines.filter(
    (l) => !decisions.includes(l) && /\b(will|to do|todo|action|needs? to|must|should|follow up|send|prepare)\b/i.test(l),
  );
  const actions = actionLines.map((l) => {
    const m = l.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:will|to|needs?|must|should)\b/)?.[1];
    const owner = m && !/^(We|I|You|They|He|She|It|Everyone|Team|The)$/.test(m.split(" ")[0] ?? "") ? m : NS;
    const deadline =
      l.match(/\b(?:by|before|due|until)\s+([A-Za-z0-9 ,/-]+?)(?:[.,;]|$)/i)?.[1]?.trim() ??
      l.match(/\b(today|tomorrow|next week|end of (?:day|week|month)|monday|tuesday|wednesday|thursday|friday)\b/i)?.[0] ??
      NS;
    return { task: l, owner, deadline };
  });
  const summary = lines.slice(0, 2).join(" ") || NS;
  return { summary, decisions, actions };
}

export type Task = { id: string; title: string; deadline: string; minutes: number; done: boolean };
export type Priority = "High" | "Medium" | "Low";

export function priorityOf(t: Task, now = new Date()): Priority {
  if (!t.deadline) return "Low";
  const days = (new Date(t.deadline).getTime() - now.getTime()) / 86400000;
  if (days <= 1) return "High";
  if (days <= 3) return "Medium";
  return "Low";
}

const rank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export function sortTasks(tasks: Task[], now = new Date()) {
  return [...tasks].sort(
    (a, b) =>
      rank[priorityOf(a, now)] - rank[priorityOf(b, now)] ||
      (a.deadline || "9999").localeCompare(b.deadline || "9999"),
  );
}

export function schedule(tasks: Task[], startHour = 9, now = new Date()) {
  let t = startHour * 60;
  const fmt = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const out: { task: Task; start: string; end: string }[] = [];
  for (const task of sortTasks(tasks.filter((x) => !x.done), now)) {
    if (t === 12 * 60 + 30 || (t < 12 * 60 + 30 && t + task.minutes > 12 * 60 + 30 && out.length)) t = Math.max(t, 13 * 60);
    out.push({ task, start: fmt(t), end: fmt(t + task.minutes) });
    t += task.minutes + 10;
  }
  return out;
}
