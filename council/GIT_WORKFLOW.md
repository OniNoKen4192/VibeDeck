# Git Workflow — [VibeDeck]


**Repository:** [Add your repository URL here]

---

## Branch Strategy

**Simple trunk-based development** — appropriate for a solo/small team project in early stages.

- `main` — stable, working code. Should always build and run.
- Feature branches — `feature/<short-description>` for non-trivial work
- Bugfix branches — `fix/<short-description>` for targeted fixes

### When to Branch

**Commit directly to `main`:**
- Small, self-contained changes (typo fixes, minor tweaks)
- Changes you're confident won't break anything
- Single-commit work

**Create a feature branch:**
- Multi-step features that might take multiple sessions
- Experimental work you might want to discard
- Anything you'd want to review before merging

---

## Commit Conventions

Format: `<type>: <short description> (<dragon>)`

### Types
- `feat:` — New functionality
- `fix:` — Bug fixes
- `refactor:` — Code restructuring without behavior change
- `style:` — Formatting, UI tweaks
- `docs:` — Documentation only
- `chore:` — Maintenance (deps, config, tooling)

### Examples
- `feat: add user authentication (Pyrrhaxis)`
- `fix: prevent crash on empty list (Pyrrhaxis)`
- `refactor: extract validation into utility (Pyrrhaxis)`
- `docs: update API documentation (Wrixle)`
- `chore: configure test runner (Kazzrath)`

---

## Protected Files

These files require extra care when modifying:

| File | Guardian | Notes |
|------|----------|-------|
| `CLAUDE.md` | Vaelthrix | Project spec. Changes = architectural decisions. |
| `council/COUNCIL.md` | Vaelthrix | Agent definitions. Changes affect all dragons. |
| `council/QuestBoard.md` | All | Shared state. Pull before editing to avoid conflicts. |
| `council/QuestLog.md` | All | Append-only history. Never delete entries. |
| `council/GIT_WORKFLOW.md` | Tarnoth | Process doc. Changes require Vaelthrix review. |

---

## Dragon Handoff Protocol

> For detailed handoff memo conventions, see [HANDOFF_PROTOCOL.md](HANDOFF_PROTOCOL.md).

### When a dragon completes work:
1. Ensure all changes are committed with dragon attribution
2. Update `council/QuestBoard.md` (move task to QuestLog)
3. Run `git status` to confirm clean working tree
4. If passing work to another dragon, create a handoff memo in `council/handoffs/`

### When a dragon begins work:
1. Run `git status` and `git log -3 --oneline` to orient
2. Pull latest if remote exists: `git pull origin main`
3. Check `council/handoffs/` for any memos addressed to you
4. Update `council/QuestBoard.md` (move task to In Progress)
5. Archive handoff memos when work is complete

---

## File Header Standard

All `.ts` and `.tsx` files in `src/` should have a JSDoc header at the top:

```typescript
/**
 * @file filename.ts
 * @description Brief explanation of the file's purpose
 */
```

**Guidelines:**
- Keep descriptions to one sentence when possible
- Focus on *what* the file does, not *how*
- New files must include the header
- Existing files should have headers added during documentation sweeps

---

## Pre-Push Checklist

Before pushing to remote:
- [ ] App builds without errors
- [ ] No console warnings in dev mode
- [ ] `council/QuestBoard.md` reflects current state
- [ ] Commit messages follow conventions (including dragon attribution)

---

*Approved by Vaelthrix the Astral — [Date]*
