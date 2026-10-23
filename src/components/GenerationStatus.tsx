import { LoaderCircle, CheckCircle2 } from "lucide-react";

export function AiBadge() { return <span className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-xs font-semibold text-primary"><CheckCircle2 className="size-3.5" /> AI-generated</span>; }
export function GenerationError({ message }: { message: string | null }) { return message ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{message}</p> : null; }
export function GeneratingIcon() { return <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden />; }