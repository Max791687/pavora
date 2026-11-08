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
- In-app notification sounds/badges work while the app runs; true background push notifications are not yet implemented.
- WebRTC uses STUN only unless TURN is configured, so voice/video calls may fail on restricted mobile networks.
- App and website share the same Supabase data. Never use Reset demo.
- Current code has not been fully device-tested across all features.
