import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getConversation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("workmate_conversations").select("id,messages").eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error("Your conversation could not be loaded.");
  if (data) return { id: data.id, messages: data.messages as unknown as UIMessage[] };
  const { data: created, error: createError } = await context.supabase.from("workmate_conversations").upsert({ user_id: context.userId }, { onConflict: "user_id", ignoreDuplicates: true }).select("id,messages").maybeSingle();
  if (createError) throw new Error("Your conversation could not be created.");
  if (created) return { id: created.id, messages: created.messages as unknown as UIMessage[] };
  const { data: existing, error: existingError } = await context.supabase.from("workmate_conversations").select("id,messages").eq("user_id", context.userId).single();
  if (existingError || !existing) throw new Error("Your conversation could not be loaded.");
  return { id: existing.id, messages: existing.messages as unknown as UIMessage[] };
});

export const conversationQuery = (userId: string) => queryOptions({ queryKey: ["conversation", userId], queryFn: () => getConversation(), staleTime: Infinity });