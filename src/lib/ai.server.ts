import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText, type ModelMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id.server.ts";

export class WorkmateAiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function safeAiMessage(error: unknown) {
  return error instanceof WorkmateAiError ? error.message : "AI generation could not finish. Please try again.";
}

export async function createWorkmateProvider(request: Request) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new WorkmateAiError(401, "AI generation is not configured yet.");
  // Privileged access is limited to server-owned access-block state, never user content.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: block, error: readError } = await supabaseAdmin.from("workmate_ai_access_blocks").select("status,reason").eq("id", "gateway").maybeSingle();
  if (readError) throw new WorkmateAiError(503, "AI access could not be checked. Please try again later.");
  if (block) throw new WorkmateAiError(block.status, block.reason);
  const gateway = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    apiKey,
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const response = await gateway.fetch(input, init);
      if (!response.ok) {
        const body = await response.clone().json().catch(() => null);
        const message = body?.message ?? body?.error?.message ?? `AI service returned an error (${response.status}).`;
        if (response.status === 402 || response.status === 403) {
          const { error } = await supabaseAdmin.from("workmate_ai_access_blocks").upsert({ id: "gateway", status: response.status, reason: message });
          if (error) console.error("Could not persist AI access pause", error.code);
        }
        throw new WorkmateAiError(response.status, message);
      }
      return response;
    },
  });
  return { provider, gateway };
}

export const reasoningOptions = { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } };

export async function structuredAi<T extends z.ZodTypeAny>(request: Request, schema: T, system: string, input: unknown): Promise<z.infer<T>> {
  const { provider } = await createWorkmateProvider(request);
  let failure: unknown;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system,
    messages: [{ role: "user", content: JSON.stringify(input) }] as ModelMessage[],
    output: Output.object({ schema }),
    providerOptions: reasoningOptions,
    maxRetries: 0,
    abortSignal: request.signal,
    onError: ({ error }) => { failure = error; },
  });
  try {
    const output = await result.output;
    if (!output) throw failure ?? new Error("Empty AI response");
    return output;
  } catch (error) {
    throw failure ?? error;
  }
}