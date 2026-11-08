# PAVORA — Supabase setup (Phase 2)

The existing GitHub Pages website is a **local browser demo**. These files prepare the real cloud backend; they do not turn it on until a Supabase project is connected.

1. Create a free project at https://supabase.com/dashboard.
2. Open SQL Editor and run [supabase/schema.sql](supabase/schema.sql) once. If a policy already exists, do not blindly rerun the script; review it first.
3. Under Authentication → Providers enable Email and choose whether email confirmation is required.
4. Under Authentication → URL Configuration set Site URL to `https://max791687.github.io/pavora/` and add the same redirect URL.
5. Under Project Settings → API copy **Project URL** and **publishable (anon) key**. Never share the service_role or secret key or database password.
6. The next frontend integration will add signup/login, cloud feed and uploads using those two public values. Until then, the live demo remains local-only.

Security: Row-level security is enabled on all application tables. Real deployment additionally needs reporting, rate limits, spam moderation, privacy policy and testing. Do not treat this schema alone as a production launch.
