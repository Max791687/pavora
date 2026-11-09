# PAVORA — India Edition 💜

PAVORA is a live social app, available as a website, installable mobile web app and Android app project.

**Live app:** https://max791687.github.io/pavora/

## Install on a phone (no coding required)

**Android Chrome:** Open the website → Chrome menu (⋮) → **Install app** or **Add to Home screen**.

**iPhone Safari:** Open the website → Share → **Add to Home Screen** → Add.

The app launches with its own icon and uses the same live PAVORA Supabase account. Internet is required for profiles, messages and uploads.

## PAVORA features

- Email sign-in and persistent login
- Home photos, likes, comments, uploads
- Search/Explore and creator profiles
- Reels, likes/comments/views and saving
- Primary/General/Requests direct messages
- Follow and activity notifications (in-app)
- 24-hour Stories, viewer counts
- Profile and Saved media
- Browser-supported voice/video calls (WebRTC; some networks need TURN)

Some modules need their corresponding SQL scripts to be run in Supabase SQL Editor; see `supabase/`.

## Advanced Chat + Realtime Messaging (phase 1)

Existing mobile Send-button keyboard behavior and Reels controllers are preserved.

Implemented: live message updates for authenticated senders and recipients via Supabase Realtime Postgres Changes, conversation updates without replacing the composer, last outgoing message Sent / Seen status based on read_at, and a Live / Syncing connection indicator. Polling is retained as a fallback.

**Required setup:** In the Supabase project, open SQL Editor and run [supabase/realtime-messaging.sql](supabase/realtime-messaging.sql). GitHub code changes alone cannot change the Supabase publication. Existing Row Level Security must remain enabled.

**Two-account test:** Open PAVORA on two authenticated devices/browsers, send a message from account A to B, verify it appears without refreshing, and open B's conversation to mark it read. The last outgoing message in A should display Seen. Without the SQL setup, the fallback checks continue instead of instant updates.

Typing indicators, reply threads, media attachments and reactions are not yet implemented; they are planned later.

## Branded Android push notifications

The service worker uses PNG PAVORA logo and a monochrome status-bar badge instead of SVG,
plus cleaner sender-specific titles and an "Open chat" / "View on PAVORA" action.
The notifications remain native Android OS cards: a webpage cannot override the
system notification shade with a custom neon-purple card or force custom sounds.

The client assets are deployed through GitHub Pages. To activate the improved
server-supplied notification titles, redeploy the latest
[supabase/functions/send-push/index.ts](supabase/functions/send-push/index.ts) via
Supabase Edge Functions > send-push > Code > Deploy. Do not change the existing
secrets or database webhook. Refresh/reopen installed PAVORA so the updated
service worker is installed. Test by sending a new DM.

## Lock-screen phone push notifications (setup required)

This is a **Web Push** implementation, not just in-app badges. Once deployed and opted in,
supported installed web apps can display notifications when PAVORA is closed or the screen is locked.
Push covers direct messages, post likes/comments, follows, Reel likes/comments and **story views**.
Notification sound/vibration/lock-screen display depend on Android or iOS settings (including
Do Not Disturb / Focus); the web app cannot force audible sound.

### Step 1 — Database

In Supabase Dashboard > SQL Editor, run prerequisite scripts first if not already present:
[supabase/activity-notifications.sql](supabase/activity-notifications.sql),
[supabase/social-suite.sql](supabase/social-suite.sql),
[supabase/messages.sql](supabase/messages.sql).
Then run [supabase/background-push.sql](supabase/background-push.sql). It creates
owner-only subscriptions, a private push event queue and server-side activity triggers.

### Step 2 — Generate VAPID keys and configure secrets

On a trusted developer computer with Node/npm installed run:

```bash
npx web-push generate-vapid-keys
```

In Supabase Dashboard > Edge Functions > Secrets set these **private server secrets**:
- `VAPID_PUBLIC_KEY` — generated public key (the app fetches it from the Edge Function).
- `VAPID_PRIVATE_KEY` — generated private key (NEVER put in GitHub or the browser).
- `PUSH_CONTACT_EMAIL` — your actual contact email in `mailto:you@example.com` form.
- `PUSH_WEBHOOK_SECRET` — a strong random secret (e.g. generated with `openssl rand -hex 32`).

Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to hosted Edge Functions;
verify they are present in the function runtime. Never expose the service-role key in browser code.

### Step 3 — Deploy the server function

Deploy [supabase/functions/send-push/index.ts](supabase/functions/send-push/index.ts)
to project `iyqmjaomslffqfwbsydr` as function `send-push`. With Supabase CLI:

```bash
supabase login
supabase link --project-ref iyqmjaomslffqfwbsydr
supabase functions deploy send-push --no-verify-jwt
```

`--no-verify-jwt` is intentional for Database Webhooks; incoming POSTs are authenticated
via the `x-pavora-webhook-secret` header instead. Never use an empty webhook secret.
A public GET only returns the **public** VAPID key. The Edge Function only sends
pushes for events written in the protected `push_jobs` table.

### Step 4 — Configure Database Webhook

In Supabase Dashboard > Database > Webhooks create an **INSERT** webhook:
- Name: `pavora-push`.
- Table: `public.push_jobs`.
- URL: `https://iyqmjaomslffqfwbsydr.supabase.co/functions/v1/send-push`.
- HTTP header: `x-pavora-webhook-secret` = same `PUSH_WEBHOOK_SECRET` value.
- Method: POST.

### Step 5 — Activate on the phone

**Android:** Open PAVORA in Chrome, install from the browser menu, sign in, and tap
**🔔 Enable alerts** in the app header, then grant notifications.
**iPhone:** iOS 16.4 or later; Safari > Share > Add to Home Screen, launch the installed
home-screen PAVORA app, tap **🔔 Enable alerts**, and grant permission.
Allow notifications (including lock-screen and sound) in the phone's Settings.
Android Chrome PWA supports Web Push. The separate Android Studio **WebView APK**
does not automatically support this system; native APK background alerts would require
separate Firebase Cloud Messaging (FCM) integration.

**Verification:** Close the installed PWA or lock the phone, then from a *second account*
send a DM, like a post or view a story. Check Edge Function logs, the Database Webhook
logs, the `push_jobs` row's `processed_at`, and phone notification settings.
Notifications are best-effort: offline delivery timing, battery restrictions and sounds
are controlled by the phone and push service. The system has **not yet been
deployed to Supabase or end-to-end tested on a locked phone**.

## Native Android project / APK

The full Android Studio project is in `android-app/`. It is a native WebView wrapper of the PAVORA website, with microphone/camera permissions, file uploads, persistent browser storage and full-screen app experience. It is not a separate offline-native rewrite.

**Android APK via GitHub Actions:**

1. Open [Build PAVORA Android APK](https://github.com/Max791687/pavora/actions/workflows/build-android.yml).
2. Choose a successful build and download its **PAVORA-Android-debug-APK** artifact ZIP.
3. Extract `app-debug.apk` and install on your Android phone (Android may ask permission to install from this source).

If no successful build appears, open the workflow, click **Run workflow**, and inspect its build logs.

**Android Studio:** Open the `android-app` folder, sync Gradle, then **Build → Build APK(s)**.

## Notes

- The Android debug APK is for testing; Play Store release requires signed release credentials.
- Web Push source code is included; lock-screen delivery requires the Supabase deployment and per-phone opt-in described above.
- WebRTC uses STUN only unless TURN is configured, so voice/video calls may fail on restricted mobile networks.
- App and website share the same Supabase data. Never use Reset demo.
- Current code has not been fully device-tested across all features.
