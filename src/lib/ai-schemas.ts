import { z } from "zod";

export const emailInput = z.object({ purpose: z.string().trim().min(1), recipient: z.string().trim().min(1), details: z.string().trim().min(1), tone: z.enum(["Formal", "Friendly", "Persuasive"]) });
export const emailOutput = z.object({ subject: z.string(), body: z.string() }).strict();
export const meetingOutput = z.object({ summary: z.string(), decisions: z.array(z.string()), actions: z.array(z.object({ task: z.string(), owner: z.string(), deadline: z.string() }).strict()) }).strict();
export const researchOutput = z.object({ summary: z.string(), keyPoints: z.array(z.string()), insights: z.array(z.string()), limitations: z.array(z.string()) }).strict();
export const planOutput = z.object({ overview: z.string(), blocks: z.array(z.object({ taskId: z.string(), start: z.string(), end: z.string(), reason: z.string() }).strict()), advice: z.array(z.string()) }).strict();
export const taskInput = z.object({ id: z.string(), title: z.string().trim().min(1), deadline: z.string(), minutes: z.number().finite().positive(), done: z.boolean() });
export type ResearchResult = z.infer<typeof researchOutput>;
export type PlanResult = z.infer<typeof planOutput>;

export function normalizePlan(result: PlanResult, tasks: z.infer<typeof taskInput>[]) {
  const pending = new Set(tasks.filter((task) => !task.done).map((task) => task.id));
  const seen = new Set<string>();
  return { ...result, blocks: result.blocks.filter((block) => {
    if (!pending.has(block.taskId) || seen.has(block.taskId)) return false;
    seen.add(block.taskId);
    return true;
  }) };
}