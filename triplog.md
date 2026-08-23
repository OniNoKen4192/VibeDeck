# Triplog

Session-by-session project memory, newest first: what shipped, what
was decided and why, what was left loose. Written by /lanes-rest-stop;
the dated specs remain the deep record each entry links to.

## 2026-08-23 — VibeDeck 1.1.0 ships: QA campaign, polish round, release ceremony

**Shipped:** `44df37e..45b41f0` (12 commits) — Fixed the last open 1.1.0 bug (HT-025: tag rename/recolor now cascades to board buttons via derived display) plus a latent fresh-install crash found during that work (HT-034: migrations ran against freshly created tables). Ran the full 1.1.0 QA pass on a fresh emulator install — 64 pass / 0 fail — surfacing and same-day fixing HT-035 (bottom-sheet safe-area insets), HT-036 (duplicate-import messaging), HT-037 (Tags screen top inset + systemic sweep), HT-038 (library play-state glyph). Physical-device smoke on the new Samsung S948U revealed the ghost-library migration scenario (HT-039) and drove the ape-friendly failure-message pass (HT-040) and the SAF permission pre-flight fix (HT-041, wiring in the `hasPermission()` API built in 1.0). New app icon and splash (neon card deck on black), version 1.1.0/versionCode 2, real package id `com.redwolfmedia.vibedeck`, prebuild-proof release signing. Merged to master, tagged **v1.1.0** — first public release. Test suite grew from 1 to 30 tests.

**Decisions:**
- HT-025 fix approach: derive tag-button display from the linked tag (option 2/3 hybrid from the QA log) rather than cascading updates — single source of truth; explicit button colors remain user overrides; v4 migration clears creation-copied colors only where they still match the tag.
- HT-039 (device migration restores DB but not files/SAF grants): ship 1.1.0 as-is with honest messaging; ghost-track detection/cleanup promoted to the 1.2 Utilities screen. `allowBackup=false` rejected — same-device restore is the only backup an offline-only app has.
- Failure-message voice: plain + actionable ("what happened + what to do"), not playful — chosen over the on-brand-fun option for stressed users mid-game. Copy-only pass; missing-file badges deferred to 1.2.
- HT-041 fix: pre-flight `hasPermission()` check on content:// URIs instead of classifying async ExoPlayer error strings — deterministic, and makes failures synchronous so both Board and Library surface them. Fails open on native-check errors.
- Package id `com.redwolfmedia.vibedeck` (Ken's domain), decided and applied before any external installs exist; iOS bundleIdentifier set to match.
- Release signing via local Expo config plugin (`plugins/withReleaseSigning.js`) injecting into generated build.gradle — because `android/` is gitignored and prebuild-regenerated, hand edits would silently revert releases to debug signing. Credentials in gitignored `credentials/`, backed up to Backblaze; machines without it fall back to debug signing.
- Metro on N:\ can fail watch-mode startup under drive load; session workaround was `CI=1` (no watcher) and release builds. Permanent answer (move to S:\ vs Watchman) parked on the whiteboard.

**Loose ends:** Phone and emulator still run debug-signed builds — first release-signed install requires an uninstall (data loss on those devices, acceptable). "Duration unknown" UX (StretchGoals UX #4) and the safe-area wrapper components are 1.2 candidates on the whiteboard. N:\music holds 13,351 swept mp3s awaiting Ken's curation.
