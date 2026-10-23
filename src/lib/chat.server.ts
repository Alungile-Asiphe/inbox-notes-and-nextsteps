import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, validateUIMessages, type UIMessage } from "ai";
import { z } from "zod";
import type { Database, Json } from "@/integrations/supabase/types";
import { createWorkmateProvider, reasoningOptions, safeAiMessage, WorkmateAiError } from "./ai.server";
import { withLovableAiGatewayRunIdHeader } from "./run-id.server.ts";

export async function handleChat(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
    if (!token) return Response.json({ message: "Please sign in to chat." }, { status: 401 });
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) return Response.json({ message: "Account connection is not configured." }, { status: 503 });
    const supabase = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set("apikey", key);
      if (headers.get("authorization") === `Bearer ${key}`) headers.delete("authorization");
      return fetch(input, { ...init, headers });
    } } });
    const { data: auth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !auth.user) return Response.json({ message: "Please sign in again to chat." }, { status: 401 });
    const body = z.object({ conversationId: z.string().uuid(), messages: z.array(z.unknown()) }).parse(await request.json());
    const incoming = await validateUIMessages({ messages: body.messages });
    const lastUser = incoming.at(-1);
    if (!lastUser || lastUser.role !== "user" || !lastUser.parts.some((part) => part.type === "text" && part.text.trim())) return Response.json({ message: "Please enter a question." }, { status: 400 });
    const { data: row, error: loadError } = await supabase.from("workmate_conversations").select("id,messages").eq("id", body.conversationId).eq("user_id", auth.user.id).single();
    if (loadError || !row) return Response.json({ message: "This conversation is not available." }, { status: 403 });
    const stored = row.messages as unknown as UIMessage[];
    const messages = [...stored.filter((message) => message.id !== lastUser.id), lastUser];
    const { provider, gateway } = await createWorkmateProvider(request);
    const { error: saveUserError } = await supabase.from("workmate_conversations").update({ messages: messages as unknown as Json }).eq("id", row.id).eq("user_id", auth.user.id);
    if (saveUserError) return Response.json({ message: "Your message could not be saved. Please try again." }, { status: 503 });
    let upstreamFailure: unknown;
    const result = streamText({ model: provider.responses("openai/gpt-6-astra"), system: "You are WorkMate AI, a warm, professional workplace productivity assistant. Help with writing, planning, research and practical questions. Be concise and useful, use readable markdown, and be honest about uncertainty. Do not claim you sent emails, changed calendars or browsed the web. Do not invent sources or workplace facts.", messages: await convertToModelMessages(messages), providerOptions: reasoningOptions, abortSignal: request.signal, maxRetries: 0, onError: ({ error }) => { upstreamFailure = error; } });
    const response = result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: true, onError: (error) => safeAiMessage(upstreamFailure ?? error), onFinish: async ({ messages: complete, isAborted }) => {
      const { error } = await supabase.from("workmate_conversations").update({ messages: complete as unknown as Json }).eq("id", row.id).eq("user_id", auth.user.id);
      if (error) throw new Error(isAborted ? "The partial conversation could not be saved." : "Your answer could not be saved. Please keep a copy.");
    } });
    const wrapped = await withLovableAiGatewayRunIdHeader(response, gateway, { "Cache-Control": "no-store" });
    if (upstreamFailure instanceof WorkmateAiError) return Response.json({ message: upstreamFailure.message }, { status: upstreamFailure.status });
    return wrapped;
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    return Response.json({ message: error instanceof z.ZodError ? "Please provide a valid question and conversation." : safeAiMessage(error) }, { status: error instanceof WorkmateAiError ? error.status : error instanceof z.ZodError ? 400 : 500 });
  }
}