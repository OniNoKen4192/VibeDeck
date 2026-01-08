# The Council of Dragons
## A Framework for Agentic Coding with Claude Code

*A presentation brief for developers interested in structured AI-assisted development*

---

## The Problem

Without explicit constraints, Claude is every expert at once—which means it's none of them reliably.

Ask Claude to "add user authentication." It might write a 400-line file with a custom JWT implementation, UI components, and database migrations—all in one response, none of it matching your existing patterns. Or it might ask clarifying questions. Or it might give you an architecture diagram. You don't know which Claude you're getting.

The symptoms:
- The AI switches between giving architectural advice and writing implementation code
- Context is lost between sessions
- No clear ownership of decisions
- "Just do the thing" leads to scope creep or wrong-level solutions
- Hard to maintain consistent code style and patterns across a project

**What if Claude could wear different hats—and know which hat it's wearing?**

---

## The Solution: Persona-Based Agents

The Council of Dragons is a **prompt engineering framework** that creates specialized agent personas within Claude Code. Each "dragon" has:

- **A distinct voice** — Personality that reinforces their role
- **Clear responsibilities** — What they do and don't do
- **Defined authority** — Who has final say on what
- **Explicit boundaries** — When to escalate vs. execute

This isn't role-play for fun (though it is fun). It's **separation of concerns applied to AI assistance**.

---

## The Council

| Dragon | Color | Domain | One-liner |
|--------|-------|--------|-----------|
| **Vaelthrix** | Astral | Architecture | "What are we building?" |
| **Pyrrhaxis** | Red | Implementation | "Make it work." |
| **Seraphelle** | Silver | UI/UX | "Make it usable." |
| **Kazzrath** | Blue | QA/Testing | "What if it breaks?" |
| **Chatterwind** | Brass | Security | "What if it's exploited?" |
| **Bahamut** | Platinum | Code Review | "Why did you do it that way?" |
| **Wrixle** | Copper | Documentation | "What does it mean?" |
| **Tarnoth** | Bronze | DevOps | "How does it connect?" |

---

## How It Works

### 1. Define Personas in a Council File

Create `council/COUNCIL.md` with detailed persona definitions:

```markdown
### Pyrrhaxis the Red — Code

**Voice:** Direct, impatient, proud of craft. Wants to build.
Doesn't tolerate vague requirements—will demand clarity,
then execute with precision.

**Responsibility:** Writing implementation code. Translating
specs into working software. Refactoring. Performance.

**Authority:** Owns code quality within architectural constraints.

**Does NOT:**
- Make architectural decisions (escalates to Vaelthrix)
- Design UI/UX (defers to Seraphelle)
- Write tests (that's Kazzrath)
```

### 2. Reference from CLAUDE.md

Claude Code reads `CLAUDE.md` at session start. Point it to your council:

```markdown
## Development Process

This project uses the Council of Dragons framework.
See [council/COUNCIL.md](council/COUNCIL.md) for agent definitions.

**Quick summon:**
`Read CLAUDE.md and council/COUNCIL.md. You are [Name] the [Color]. [Task].`
```

### 3. Summon by Name

Start a session with explicit persona invocation:

```
Read CLAUDE.md and council/COUNCIL.md.
You are Pyrrhaxis the Red.
Implement the user authentication feature.
```

Claude now operates **within that persona's constraints**.

---

## Why Personas Work

### Separation of Concerns
An architect shouldn't be writing implementation details. A security reviewer shouldn't be making UX tradeoffs. Personas enforce this naturally.

### Consistent Voice = Consistent Output
When Claude "is" Pyrrhaxis, it writes code. It doesn't wander into documentation tangents or architectural debates. The persona keeps it focused.

### Clear Escalation Paths
Each persona knows when to stop and defer:

```
Pyrrhaxis: "This requires an architectural decision.
           Escalating to Vaelthrix."
```

### Memorable Boundaries
"Chatterwind handles security" is easier to remember than a list of rules. The persona *embodies* the rules.

---

## The Supporting Infrastructure

Personas alone aren't enough. The framework includes:

### QuestBoard.md
Active tasks organized by dragon. Shared state across sessions.

```markdown
## In Progress

### Pyrrhaxis the Red
- [ ] Implement tag pool selection service

### Seraphelle the Silver
- [ ] Design Library screen layout
```

### QuestLog.md
Completed work archive. Append-only history for context recovery.

```markdown
## 2026-01-05
- [x] **Implement database layer** (Pyrrhaxis)
  - Created query functions for all entities
  - Added transaction support
```

### Handoff Protocol
When work passes between personas (or sessions):

```markdown
# Handoff: BoardScreen Wiring

**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Red
**Date:** 2026-01-08

## What Was Done
- Designed component architecture
- Specified data flow patterns

## What's Next
- Wire components to stores
- Implement button press handlers

## Key Files
- `app/(tabs)/index.tsx` — Main board screen
- `src/stores/useButtonStore.ts` — Button state
```

---

## Standard Flow

Not every task needs every dragon. Match the flow to the work:

| Flow | When to Use | Dragons |
|------|-------------|---------|
| **Full Feature** | New capability touching multiple layers | Vaelthrix → Pyrrhaxis → Seraphelle → Kazzrath → Chatterwind → Wrixle |
| **Bug Fix** | Isolated defect with known location | Pyrrhaxis (alone, or with Kazzrath verification) |
| **New Screen** | UI work with defined requirements | Vaelthrix → Pyrrhaxis → Seraphelle → Kazzrath |
| **Security-Sensitive** | File handling, auth, user data | Anyone → Chatterwind review → proceed |
| **Pre-Release** | Major milestone or version bump | Bahamut reviews → Pyrrhaxis fixes → ship |

---

## The Adversarial Reviewer: Bahamut

Bahamut the Platinum deserves special mention. He's not just a code reviewer — he's an **adversarial** one.

**Voice:** Brutal, but teaching. Every criticism comes with the *why*. Speaks like someone who has buried too many codebases to tolerate preventable death. No coddling, no softening, but also no cruelty for its own sake. The lesson is the point.

**What Bahamut Does:**
- Finds not bugs but **bad decisions** — poor abstractions, leaky boundaries, future maintenance nightmares
- Asks what happens at scale, under change, when requirements shift
- Identifies the parts of your code that will hurt, and makes sure you understand *why*

**What Bahamut Doesn't Do:**
- Write code (hands back to Pyrrhaxis with detailed, ungentle notes)
- Test functionality (that's Kazzrath)
- Let you off easy

**Summon Bahamut When:**
- Pre-merge review on significant changes
- "Roast this"
- You suspect you cut corners
- Something works but feels wrong
- "What will I regret about this in six months?"

In VibeDeck, Bahamut reviewed the entire codebase and produced a 46-issue report spanning critical race conditions to minor style inconsistencies (see the project's `CODE_REVIEW.md` for the full breakdown). Pyrrhaxis then worked through the remediation in phases. This single review pass caught issues that would have been painful to discover in production.

---

## Essential Tooling

The Council framework is the strategy. These tools are the force multipliers that make it practical:

### Claude Code

The foundation. Claude Code is Anthropic's CLI tool that:
- Reads `CLAUDE.md` at session start (how dragons get their context)
- Has filesystem access (dragons can read and write code)
- Maintains conversation context (dragons can work through multi-step tasks)
- Runs in VS Code via extension (where most development happens)

Without Claude Code, the dragons are just prompts. With it, they're agents.

### Anthropic's Code Review Plugin

The `/code-review` slash command (and derivatives like `/local-review` for uncommitted changes) invokes a specialized code review skill that:
- Analyzes diffs systematically
- Scores issues by severity
- Provides structured, actionable feedback

**How the project lead uses it:**

The plugin runs on every diff before commit — not by a dragon, but by *you*. It's a gatekeeper:

1. Run `/code-review` (or `/local-review` for uncommitted work) on your changes
2. Plugin scores issues (critical, high, medium, low)
3. You decide: fix now, or raise with Vaelthrix for architectural guidance

This keeps incremental work clean without invoking a full council session.

### Bahamut vs. The Plugin

These are two tools for the same domain (code quality), but different use cases:

| Tool | Operated By | When | Purpose |
|------|-------------|------|---------|
| **Code Review Plugin** | Project Lead | Every commit | Incremental gatekeeper |
| **Bahamut** | Summoned persona | Sprint reviews, milestones | Deep adversarial analysis |

The plugin catches "you forgot to handle null." Bahamut asks "why does this abstraction exist?"

They complement each other:
- **Plugin** = frequent, lightweight, automated feel
- **Bahamut** = infrequent, heavyweight, teaches you something

**Key insight:** Bahamut is pure prompt engineering — the same model as every other dragon, just with an adversarial persona definition. No special tooling, no fine-tuning. The plugin, by contrast, is a separate tool entirely with its own analysis logic.

### The Combination

```
Framework (personas + documents)
    +
Claude Code (agency + context)
    +
Code Review Plugin (systematic analysis)
    =
AI team that actually works
```

The framework without the tools is theory. The tools without the framework are chaos. Together, they're a development methodology.

---

## Conflict Resolution

Built-in authority hierarchy:

| Domain | Final Authority |
|--------|-----------------|
| Architecture | Vaelthrix |
| Implementation | Pyrrhaxis (within constraints) |
| UX/UI | Seraphelle |
| Quality | Kazzrath (can block release) |
| Security | Chatterwind (can veto) |
| Code Craft | Bahamut |
| Documentation | Wrixle |
| Tooling | Tarnoth |

---

## Real Example: VibeDeck

This framework was developed for VibeDeck, a React Native audio player. Here's how it played out:

1. **Vaelthrix** designed the data model and architecture
2. **Pyrrhaxis** implemented database layer, stores, and services
3. **Seraphelle** designed UI specs, then built components
4. **Kazzrath** ran QA passes, found edge cases
5. **Chatterwind** reviewed file handling for security
6. **Bahamut** did adversarial code review, found 46 issues
7. **Wrixle** added file headers and documentation
8. **Tarnoth** resolved build configuration conflicts

Each dragon stayed in their lane. Handoffs were explicit. Context persisted through documents, not memory.

---

## Getting Started

### Minimum Viable Council

You don't need 8 dragons. Start with 3:

1. **Architect** — Designs, doesn't implement
2. **Builder** — Implements, doesn't design
3. **Reviewer** — Questions, doesn't fix

### File Structure

```
your-project/
├── CLAUDE.md              ← Project config, points to council
└── council/
    ├── COUNCIL.md         ← Persona definitions
    ├── QuestBoard.md      ← Active tasks
    ├── QuestLog.md        ← Completed history
    └── handoffs/          ← Cross-session context
```

### First Session

```
Read CLAUDE.md and council/COUNCIL.md.
You are [Architect Name].
Review the project and suggest initial architecture.
```

---

## Tips & Lessons Learned

### Give Personas Personality
"Direct, impatient, proud of craft" shapes output better than "writes code efficiently."

### Define What They DON'T Do
Boundaries prevent scope creep. "Does NOT write tests" is as important as responsibilities.

### Use the QuestBoard Religiously
It's your shared memory. Update it constantly. Dragons should check it at session start.

### Handoffs Are Worth the Effort
A 5-minute handoff document saves 20 minutes of context recovery next session.

### Let Dragons Disagree (Through You)
"Pyrrhaxis wants to optimize, Vaelthrix says ship it first." You decide. They advise.

### The Voice Matters
When Claude greets you "in character," it's not just fun—it confirms the persona loaded correctly.

### Dragons Drift—Re-ground Them
Personas aren't prisons. Claude can (and will) occasionally act outside its lane—Pyrrhaxis might start making architectural decisions, or Seraphelle might write backend code. When this happens, end the session and restart with a fresh invocation. The persona definitions are constraints that need periodic reinforcement, not permanent behavior changes.

---

## Why Dragons?

The theme is arbitrary. Could be departments, historical figures, or anything with distinct identities.

Dragons work because:
- Memorable and distinct
- Easy to assign "colors" as shorthand
- Fantasy framing makes boundaries feel natural, not restrictive
- It's fun, and fun sustains usage

Pick whatever theme resonates with your team. The framework is the structure; the flavor is yours.

---

## Summary

The Council of Dragons is:

- **Persona-based prompt engineering** for Claude Code
- **Separation of concerns** applied to AI assistance
- **Persistent context** through structured documents
- **Clear authority** for decision-making
- **Explicit handoffs** for cross-session continuity

It turns "AI assistant" into "AI team"—with specialization, accountability, and memory.

---

## FAQ

**Does this work without Claude Code?**
Partially. The personas are just prompts—they work in any Claude interface. But the file access (reading CLAUDE.md, updating QuestBoard) requires Claude Code or similar tooling. Without it, you'd need to paste context manually each session.

**What if I only have one developer?**
You're the project lead switching between dragons. The framework still helps because it forces you to think in modes: "I'm architecting now" vs. "I'm implementing now." The handoff documents become notes to your future self.

**Can dragons talk to each other?**
Not directly—each session is one dragon. But they communicate through documents. Vaelthrix writes a handoff, Pyrrhaxis reads it next session. The QuestBoard is their shared bulletin board.

---

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- This framework's source: Template repo coming after VibeDeck ships — ask me directly if you want early access

---

## License

This work is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
You may share and adapt it for any purpose, provided you give appropriate credit.

---

*Prepared by Wrixle the Copper — Documentation Dragon*
*For the VibeDeck Council of Dragons*
*2026-01-08*
