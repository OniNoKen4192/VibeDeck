# Play Store Closed-Test Release Plan (VibeDeck 1.1.0)

> **For agentic workers:** This plan is mostly human logistics (Google Play Console setup,
> tester recruitment) with a few small engineering tasks. Engineering tasks (2, 3) can be
> executed by an agent; Console/recruitment tasks are Ken's, with agent support for copy
> and assets. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get VibeDeck 1.1.0 through Google Play's 12-tester/14-day closed test and into production on the Play Store.

**Architecture:** Personal Play Console account (Redwolf Media LLC deferred — see whiteboard). Local AAB build signed with the existing release keystore via the `withReleaseSigning` config plugin. Closed-testing track → 14-day window → production access application → staged production rollout.

**Tech Stack:** Expo SDK 54 (prebuild/CNG), Gradle `bundleRelease`, Google Play Console, GitHub Pages (privacy policy hosting).

**Spec:** No formal spec — requirements are Google Play's published policies as of 2026-08. Key ones restated in Global Constraints.

## Global Constraints

- **Offline-only is non-negotiable** — the Data Safety form answers "no data collected, no data shared" and must stay truthful forever.
- Package id: `com.redwolfmedia.vibedeck` (immutable once uploaded — verify before first upload).
- Every AAB upload needs a strictly increasing `versionCode` (currently 2 → this release uses 3).
- Play accepts **.aab only**, signed with the existing release keystore (backed up to Backblaze).
- Closed test needs **12 testers continuously enrolled for 14 consecutive days** — recruit 15–20 for buffer; a dropout below 12 pauses/resets the clock.
- Personal accounts display the holder's **legal name** on the listing (it will say Ken Culver, not Redwolf Media).
- Privacy policy URL is mandatory even with zero data collection.

**Target timeline (assuming start ~2026-08-24):**

| Milestone | Date |
|---|---|
| Console account + identity verification | Aug 24–27 |
| AAB built, listing + declarations done | Aug 27–30 |
| Testers recruited, closed test live | ~Sep 1 |
| 14-day window complete | ~Sep 15 |
| Production access granted + review | ~Sep 16–20 |
| **VibeDeck live on Play Store** | **~late Sep 2026** |

---

### Task 1: Play Console account (Ken)

- [ ] **Step 1:** Sign up at https://play.google.com/console — choose **Personal** account type. Use the Google account you want to own this long-term. $25 one-time fee.
- [ ] **Step 2:** Complete identity verification (government ID + address). Google may take 1–3 days to verify. Note: the verified legal name becomes the public developer name.
- [ ] **Step 3:** In Console, create the app: name **VibeDeck**, default language English (US), type **App**, **Free**.

**Blocker note:** Nothing else in Console can proceed until verification clears. Tasks 2–4 can run in parallel with the wait.

### Task 2: Release build — ✅ DONE 2026-08-23

**Result:** `ReleaseFiles\VibeDeck-1.1.0-vc3.aab` (56 MB, versionCode 3), built via prebuild +
`gradlew bundleRelease` in 4m 25s. Signature verified: `CN=Red Wolf Media, OU=VibeDeck` release
cert (valid to 2056), not the debug key. Optional Step 5 smoke test skipped — the internal-testing
track (Task 6 Step 1) covers Play-delivered install verification. **This is the file to upload in Task 6.**

**Files:**
- Modify: `app.json` (`expo.android.versionCode` 2 → 3)

- [x] **Step 1:** Bump versionCode:

```json
"android": {
  "versionCode": 3,
```

- [x] **Step 2:** Commit: `git commit -am "chore(release): bump versionCode to 3 for Play Store upload"` (commit 1416558)
- [x] **Step 3:** Build the AAB (watch for N:-drive slowness; gradle doesn't use Metro's watcher, but if it crawls, consider the S:\ move first):

```powershell
npx expo prebuild --platform android
cd android
.\gradlew bundleRelease
```

- [x] **Step 4:** Verify output exists and is release-signed:

```powershell
# AAB present
Get-Item android\app\build\outputs\bundle\release\app-release.aab
# Signature check — should report the release keystore's cert, not the debug key
keytool -printcert -jarfile android\app\build\outputs\bundle\release\app-release.aab
```

Expected: cert CN matches the release keystore identity from the `withReleaseSigning` plugin config. If it shows `CN=Android Debug`, stop — signing config regression.

- [ ] **Step 5:** Smoke-test the exact bytes Play will serve (optional but cheap): `bundletool build-apks --bundle=app-release.aab --output=vd.apks --mode=universal`, install on the S948U, launch, play a track. (Skip if bundletool isn't installed; internal-testing track in Task 6 covers this too.)

### Task 3: Privacy policy page — ✅ DONE (via redwolfmedia.com relaunch)

**Resolved:** Ken relaunched https://redwolfmedia.com/ as its own project. Verified live:
- Privacy policy: **https://redwolfmedia.com/vibedeck/privacy/** ← use this URL in Console (Task 5)
- Developer website: **https://redwolfmedia.com/** (also for the signup/listing website field)
- VibeDeck pitch + "become a tester" page: https://redwolfmedia.com/vibedeck/ (opt-in link is a
  placeholder — update it after Task 6 Step 5)
- Contact email on site: **ken@redwolfmedia.com** (use consistently in Console contact fields)

Original steps below kept for reference; the GitHub Pages fallback is no longer needed.

**Files:**
- Create: `docs/privacy-policy.md` (source of truth, in-repo)
- Publish: GitHub Pages (public repo or repo Pages) → stable URL, e.g. `https://<user>.github.io/vibedeck-privacy/`

- [ ] **Step 1:** Write `docs/privacy-policy.md` with this content:

```markdown
# VibeDeck Privacy Policy

_Last updated: 2026-08-23_

VibeDeck is a fully offline audio player. **We do not collect, store,
transmit, or share any personal data. Period.**

- VibeDeck makes no network connections of any kind.
- All data (your audio files, tags, buttons, and settings) stays on your
  device, in the app's private storage.
- No analytics, telemetry, crash reporting, advertising, or third-party SDKs.
- Audio files you import are accessed only with your explicit selection via
  the Android file picker and are never transmitted anywhere.
- Uninstalling the app removes all app data (your original audio files are
  untouched).

Because no data leaves your device, there is nothing for us to sell, share,
or lose.

**Contact:** ken.culver@gmail.com
```

- [ ] **Step 2:** Publish it at a public URL (GitHub Pages is free and stable). Record the final URL — it goes in Task 4 store listing and the Console privacy-policy field.
- [ ] **Step 3:** Commit the in-repo copy: `git commit -am "docs: add privacy policy for Play Store listing"`

### Task 4: Store listing copy + graphics (agent drafts, Ken approves)

**Assets needed:**
- App icon **512×512 PNG** (derive from `assets/images/icon.png`)
- Feature graphic **1024×500 PNG**
- **2–8 phone screenshots** (portrait, ≥1080px long side) — capture on the S948U: `adb exec-out screencap -p > shot1.png`. Best candidates: button board mid-game, library with tags, track import, now-playing.

- [ ] **Step 1:** Short description (max 80 chars):

> Game-day soundboard for sports parents. Tag your music, tap a button, play.

- [ ] **Step 2:** Full description (max 4000 chars) — draft:

> **VibeDeck turns game-day music into a one-tap job.**
>
> Built by a sports parent, for sports parents. If you run the speaker at your
> kid's games, you know the scramble: finding the right song, not repeating
> the same three tracks, missing the moment because you were scrolling a
> playlist. VibeDeck replaces the scramble with a board of big, friendly
> buttons.
>
> **How it works**
> - Import your music and tag it: warm-up, goal, between innings, rain delay —
>   your tags, your call.
> - Tap a tag button and VibeDeck plays a random track with that tag that you
>   haven't used yet this session. No repeats until you say so.
> - Pin direct buttons for the tracks that have to be *that* song at *that*
>   moment.
> - Reset the played flags whenever a new game starts.
>
> **100% offline. Actually private.**
> VibeDeck never connects to the internet. No accounts, no ads, no analytics,
> no data collection — your music and your data never leave your phone.
>
> Works great over Bluetooth speakers and PA systems.

- [ ] **Step 3:** Capture screenshots on the S948U, produce the 512×512 icon and 1024×500 feature graphic. (Agent can draft the feature graphic via the design skill if wanted.)
- [ ] **Step 4:** Ken reviews all copy/assets before they go into Console.

### Task 5: Console declarations (Ken, ~30 min once verification clears)

All under **App content** in Play Console:

- [ ] Privacy policy: paste the URL from Task 3.
- [ ] Data safety: **No data collected, no data shared.** (Truthful because of the offline constraint.)
- [ ] Content rating questionnaire: category Utility/Music, no user-generated content, no violence etc. → expect "Everyone".
- [ ] Target audience: **13 and over** (do NOT tick under-13 — that triggers Families policy review; "built for parents" is the audience, not kids).
- [ ] Ads declaration: **No ads.**
- [ ] Foreground service declaration: `FOREGROUND_SERVICE_MEDIA_PLAYBACK` (from react-native-track-player) — justification: "Audio player; continues playback with screen off / app backgrounded." Have a short screen-recording of background playback ready if the form requests a video.
- [ ] Store settings: category **Music & Audio**, contact email.
- [ ] Main store listing: paste Task 4 copy + upload graphics.

### Task 6: Closed-testing track goes live (Ken)

- [ ] **Step 1 (optional but recommended):** Create an **Internal testing** release first, upload the AAB, add yourself, install via the opt-in link on the S948U — verifies Play-delivered build before burning the 14-day clock. (First Play install needs the sideloaded debug build uninstalled.)
- [ ] **Step 2:** On first AAB upload, enroll in **Play App Signing** (your keystore becomes the upload key — accept the default).
- [ ] **Step 3:** Create a **Closed testing** track (default "Alpha" is fine), promote/upload the AAB.
- [ ] **Step 4:** Create an email list of tester Gmail addresses (Task 7 feeds this — list can grow after launch; keep it ≥12 at all times).
- [ ] **Step 5:** Start rollout to the closed track. Save the **opt-in URL** — that's what testers get.

### Task 7: Recruit 15–20 testers (Ken; the risk item)

- [ ] **Step 1:** Post the Facebook recruitment message (already drafted in session 2026-08-23). Collect Gmail addresses via comments/DM.
- [ ] **Step 2:** Work the warm list in parallel — each source is worth 2–5 testers:
  - **The actual target users:** parents on your kid's team(s). They're the ideal testers *and* the future word-of-mouth. A team group-chat message mirroring the FB post.
  - Family Android phones (each distinct Google account counts).
  - Coworkers/friends outside Facebook.
- [ ] **Step 3 (fallback if short of 12):** reciprocal tester communities — r/AndroidClosedTesting and similar test-for-test groups. Free, reliable, but testers are strangers: they install and open, they don't give real feedback. Use only to top up.
- [ ] **Step 4:** As addresses arrive, add to the Console email list and send the opt-in URL + a one-liner: "Click the link, join, install, keep it for 2 weeks, open it a few times."
- [ ] **Step 5:** Confirm ≥12 show as enrolled in Console before counting day 1.

### Task 8: The 14-day window (Ken + agent, low effort)

- [ ] **Step 1:** Note the start date (all 12+ enrolled). Day 14 = start + 13.
- [ ] **Step 2:** Check Console every 2–3 days: tester count still ≥12? If someone drops, replace immediately from the buffer.
- [ ] **Step 3:** Collect feedback informally (FB thread / group chat). Log anything real to `whiteboard.md` → 1.2 candidates. **Do not ship a new build mid-test unless something is broken** — updates are fine and don't reset the clock, but stability is the goal.
- [ ] **Step 4:** Day 14+: the **Apply for production access** button appears on the Console dashboard.

### Task 9: Production (Ken)

- [ ] **Step 1:** Apply for production access — short written answers about who tested, feedback received, and how the app is ready. Draft answers from Task 8's feedback log (agent can help).
- [ ] **Step 2:** Once granted, create a **Production** release with the same AAB, roll out (100% is fine for a v1; staged rollout is available if preferred).
- [ ] **Step 3:** Google review: typically 1–7 days for a first production release.
- [ ] **Step 4:** When live: tag the moment in `triplog.md`, close this plan, and tell the team parents where to get it. 🎉

---

## Risk register

| Risk | Mitigation |
|---|---|
| Can't find 12 testers | Overshoot to 15–20; team parents + family devices; reciprocal tester communities as top-up (Task 7 Step 3) |
| Tester drops mid-window | Buffer + every-2–3-day Console check (Task 8) |
| Identity verification delays | Start Task 1 first; Tasks 2–4 proceed in parallel |
| Debug-signed build blocks Play install for existing sideloaders | Known (parked 2026-08-23): uninstall before installing from Play — put this in the tester instructions |
| FGS declaration needs a demo video | Record 30s of background playback preemptively during Task 4 screenshots |
| N: drive slow for prebuild/gradle | If build crawls, execute the parked S:\ move decision first |
