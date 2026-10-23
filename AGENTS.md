<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep AI calls and prompts in server-only helpers exposed through authenticated server functions for structured tools and a streaming server route for chat; private keys must never enter the browser.
- Persist the single account-owned chatbot transcript as AI SDK UIMessage JSON in Supabase with owner-scoped reads and writes; the database enforces uniqueness per account.
- Use the root AuthProvider for the sole auth-state subscription and bearer function middleware for protected RPC calls; public tool pages show inline sign-in prompts.
- Compose chat with installed AI Elements primitives and the project Button; schema types and pure normalization belong in shared client-safe modules.
- Store terminal AI access blocks durably in a server-owned Supabase table; no automatic retries or provider substitutions after denial.
