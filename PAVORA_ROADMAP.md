# PAVORA — Instagram-class feature and quality roadmap

Goal: An original PAVORA social app with reliable, familiar UX, not a clone of Instagram's branding, assets, or proprietary code. Budget: keep core functionality on free tiers where possible. Every release must be tested on Chrome PWA/mobile and desktop.

## Existing features — verify regression on every release
- Email/password signup, sign-in and profile editing
- Posts, images, Likes, comments, saved items
- Reels, basic likes/comments/views
- 24-hour stories with real unique viewer tracking
- Followers/following, private accounts and follow requests
- Blocking/unblocking (backend RLS enforcement)
- Direct messages, unread notifications, voice/video calling (require device-permission and two-user testing)
- Settings, privacy, activity and accessibility basics

Existing code does **not** imply that every feature has passed end-to-end browser tests. Older public storage URLs may bypass intended privacy. Phone SMS signup is **not** live without an SMS provider.

## Phase 1 — Stability and speed (in progress)
- [x] Remove legacy demo script and duplicate feed/navigation handlers
- [x] Prevent race-condition stale feed responses
- [x] Fix stale Like button state after realtime updates
- [x] Add background new-post updates without sudden feed redraw
- [x] Set up GitHub Actions static smoke checks
- [ ] Browser smoke test: signup, logout, profiles, posts, Reels, Stories, chat, calls
- [ ] Installed Android Chrome PWA cold-start test and cache upgrade test
- [ ] Capture load time, image decode, console errors and failed requests
- [ ] Paginate feed, reels, comments and explore to keep memory under control
- [ ] Virtualize long Reels feed and suspend offscreen videos

## Phase 2 — Privacy, safety and integrity
- [ ] Move private media to protected storage with signed URLs and migration
- [ ] Audit ALL tables and storage RLS for blocks, private accounts and deleted media
- [ ] Report account/post/reel/story, moderation and appeals
- [ ] Restrict / mute accounts, comment controls and mentions
- [ ] Account recovery, verified email, anti-spam and rate limits
- [ ] Data export, account deletion and privacy policy

## Phase 3 — Creator and social functionality
- [ ] Story viewer polish, pause/skip/progress, replies and highlights
- [ ] Reel search/discovery and playback optimization
- [ ] Comment replies, mentions, pin/delete and moderation
- [ ] Better search, suggested creators and hashtag discovery
- [ ] Close Friends, favorites and story audience controls
- [ ] Drafts, post editing, carousel albums, archives and scheduled posts
- [ ] Image cropping and compression tools before upload

## Phase 4 — Messaging and notifications
- [ ] End-to-end two-account tests for instant DMs and calls
- [ ] Typing, reply, reactions, message deletion and shared media
- [ ] Push notifications: foreground, background, installed PWA, deep links
- [ ] Calls: ringing, reconnect, missed calls, cancellation, declined permissions
- [ ] Delivery/seen receipts and unread counts across devices

## Release gates (required for every feature)
1. Appropriate database RLS: unauthorized users cannot read/write protected rows.
2. Signed-in owner + second account + blocked account tested.
3. Mobile narrow-screen and desktop responsive testing.
4. Loading, error, empty and offline states.
5. JS static checks pass; no obvious uncaught errors or UI overlap.
6. PWA cache version and HTML script version updated together.
7. No promise of zero bugs without actual device testing and ongoing monitoring.

See `scripts/smoke-check.mjs` and `.github/workflows/pavora-smoke.yml`.
