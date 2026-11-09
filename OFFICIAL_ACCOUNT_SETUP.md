# PAVORA official account setup

Desired public identity:
- Display name: PAVORA Official
- Username: pavora
- Owner email: max791687@gmail.com
- Bio: Official PAVORA updates 💜 | New features, tools, releases and announcements.

## Required one-time database step
In your own Supabase dashboard (project configured in cloud.js), open **SQL Editor**.
Open [supabase/official-account.sql](./supabase/official-account.sql), copy the contents and run it.
The migration protects @pavora at the database layer and adds the server-verified `is_official` flag.
It must be run by a dashboard administrator. It is NOT run by GitHub Pages.

## Secure signup
1. Open https://max791687.github.io/pavora/ and **Create new account** (or log out first if necessary).
2. Enter name **PAVORA Official**, username **pavora**, and email **max791687@gmail.com**.
3. Choose a new, private password **inside PAVORA**. Never send the password in chat or commit it to GitHub.
4. Confirm the email if Supabase sends a verification link, then log in.
5. If an account already exists on this email, log into that account and change the username to `pavora` in Edit profile after SQL setup; do not create duplicates.
6. Publish announcements with the standard Home post composer. Posts appear in the main feed, and the official badge appears after SQL setup and the verified profile is ready.

## Troubleshooting
If `@pavora` is already used, inspect the current profile in Supabase before reclaiming it. Never delete a user or profile to free the handle without verifying ownership.
If the official badge does not appear, verify that SQL ran successfully and the Auth user email has been confirmed. The app deliberately does not assign an official badge based only on a username.
