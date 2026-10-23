CREATE TABLE public.workmate_conversations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL UNIQUE,
 messages jsonb NOT NULL DEFAULT '[]'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workmate_conversations TO authenticated;
GRANT ALL ON public.workmate_conversations TO service_role;
ALTER TABLE public.workmate_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their conversation" ON public.workmate_conversations FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Owners create their conversation" ON public.workmate_conversations FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Owners update their conversation" ON public.workmate_conversations FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Owners delete their conversation" ON public.workmate_conversations FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
CREATE FUNCTION public.workmate_touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER workmate_conversation_updated BEFORE UPDATE ON public.workmate_conversations FOR EACH ROW EXECUTE FUNCTION public.workmate_touch_updated_at();
CREATE TABLE public.workmate_ai_access_blocks (
 id text PRIMARY KEY,
 status integer NOT NULL,
 reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.workmate_ai_access_blocks TO service_role;
ALTER TABLE public.workmate_ai_access_blocks ENABLE ROW LEVEL SECURITY;