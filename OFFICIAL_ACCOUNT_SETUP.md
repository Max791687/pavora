# PAVORA Official Account — Existing Profile

The existing verified PAVORA profile is the official publisher.

- Username: @PAVORA
- Existing sign-in email: hackerwhitehat08@gmail.com
- Separate account, unchanged: max791687@gmail.com
- Official badge status is stored in the database and is enforced by a trigger.

## Activation

1. Open the PAVORA Supabase project's SQL Editor.
2. Open [supabase/official-account.sql](./supabase/official-account.sql) and use the **latest complete SQL**.
3. Run it. It checks the existing verified profile's UUID and email before changing the badge rule. It does not delete any user or change an email.
4. Confirm the last SELECT returns one row with `is_official=true`, `owner_email_matches=true`, and `email_verified=true`.
5. Sign in to the **existing @PAVORA account**, open Home, and publish posts about new tools, releases or announcements. The feed and own profile will display the official badge when cloud data is refreshed.

Important: Do not create another @PAVORA account or transfer usernames. Both existing email accounts stay separate. The name and bio can be changed in Edit profile after verification.
