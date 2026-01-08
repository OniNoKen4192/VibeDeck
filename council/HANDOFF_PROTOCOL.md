# Handoff Protocol — [VibeDeck]

> How dragons pass work between sessions without dropping anything into the void.

---

## Purpose

Handoff memos capture context that would otherwise be lost between sessions. They're not commit messages (too short) or documentation (too permanent)—they're working notes for the next dragon picking up the thread.

---

## Naming Convention

```
HANDOFF_[From]_to_[To]_[YYYY-MM-DD]_[topic-slug].md
```

**Examples:**
- `HANDOFF_Pyrrhaxis_to_Kazzrath_2026-01-08_HT-fixes.md`
- `HANDOFF_Vaelthrix_to_Seraphelle_2026-01-07_library-design.md`
- `HANDOFF_Kazzrath_to_Pyrrhaxis_2026-01-08_QA-findings.md`

**Guidelines:**
- Use full dragon names (readability over brevity)
- Topic slug should be 1-3 words, lowercase, hyphenated
- Date is when the handoff was created

---

## File Locations

```
council/
├── handoffs/                    ← active handoffs live here
│   └── HANDOFF_*.md
├── archive/
│   └── handoffs/
│       └── 2026-01/             ← completed handoffs, grouped by month
│           └── HANDOFF_*.md
└── ...
```

---

## Lifecycle

### 1. Creating a Handoff

When completing work that another dragon will continue:

1. Create the handoff file in `council/handoffs/`
2. Use the template below
3. Commit with: `docs: handoff to [Dragon] for [topic] (Wrixle)`

### 2. Receiving a Handoff

When starting work from a handoff:

1. Read the handoff memo in `council/handoffs/`
2. Do the work
3. Archive when complete (see below)

### 3. Archiving a Handoff

**The recipient archives.** They know when the work is truly done.

1. Move the file to `council/archive/handoffs/YYYY-MM/`
2. Create the month folder if it doesn't exist
3. Commit with: `docs: archive handoff [topic] (Wrixle)`

---

## Handoff Template

```markdown
# Handoff: [Topic]

**From:** [Dragon Name]
**To:** [Dragon Name]
**Date:** [YYYY-MM-DD]
**Related Quest:** [Link to QuestBoard task if applicable]

---

## Context

[Why this handoff exists. What was being worked on. 1-3 sentences.]

## What Was Done

- [Bullet points of completed work]
- [Include relevant commit hashes if helpful]

## What's Next

- [Bullet points of remaining work]
- [Be specific about entry points]

## Key Files

- `path/to/relevant/file.ts` — [why it matters]
- `path/to/another/file.ts` — [why it matters]

## Gotchas / Notes

[Anything the recipient needs to know that isn't obvious from the code.
Edge cases discovered, decisions made, things that almost worked but didn't.]

---

*Handed off by [Dragon] the [Color]*
```

---

## When to Create a Handoff

**Do create a handoff when:**
- Passing incomplete work to another dragon
- QA findings that need implementation work
- Architectural decisions that need to be built
- Any cross-dragon task dependency

**Don't create a handoff when:**
- Work is complete and just needs QuestLog entry
- Simple bug fix with obvious commit message
- Same dragon continuing in next session (just use QuestBoard)

---

## Quick Reference

| Action | Location | Commit Message |
|--------|----------|----------------|
| Create handoff | `council/handoffs/` | `docs: handoff to [Dragon] for [topic]` |
| Archive handoff | `council/archive/handoffs/YYYY-MM/` | `docs: archive handoff [topic]` |

---

*Approved by Wrixle the Copper — 2026-01-08*
