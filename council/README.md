# Council of Dragons

A lightweight framework for building software calmly, deliberately, and over time.

---

## Statement of Purpose

The Council Framework exists to help me build software calmly, deliberately, and over time.

It grew out of real projects that had to survive context switching, interruptions, long gaps between sessions, and changing requirements. This is not a theory exercise, a productivity trend, or a framework invented in a vacuum. It is a system that emerged because I needed one that actually worked.

## What this framework is for

The Council is meant for:

- Solo developers or very small teams
- Long-lived projects where decisions need to be remembered weeks or months later
- Builders who care about clarity, correctness, and scope control
- Workflows where architectural thinking, implementation, and review benefit from being separated
- Using AI tools without giving up authorship or judgment

The framework emphasizes:

- Clear roles for different kinds of thinking
- Written artifacts that preserve context outside of human memory
- Explicit scope freeze once development begins
- A place to capture ideas without letting them derail active work

## What this framework is not for

The Council is not:

- A replacement for Jira, Linear, Scrum, or Agile
- A universal team process
- A productivity hack
- A rigid rule set that must be followed exactly
- A claim that this is the correct way to build software

If your current workflow works for you, you do not need this.

## Design philosophy

This framework is built on a few simple assumptions:

- Humans make better decisions when responsibilities are clear
- Context should live in documents, not in memory
- Progress requires scope to stop moving
- Tools should serve the builder, not demand obedience

The fantasy framing used in this framework is intentional but optional. It exists to make roles and responsibilities easy to remember, not to obscure them. You are expected to rename things, remove pieces, or adapt the structure to fit how you think.

---

**If you take only one thing from this framework, take this:**

> Separate thinking from doing.
> Write decisions down.
> Protect focus once work begins.

That is the entire point.

---

## Prerequisites

Before adopting this framework, ensure you have:

### Required

- **Claude Code** — Anthropic's CLI/agentic coding tool. This is the primary interface for working with Council dragons. Install via `npm install -g @anthropic-ai/claude-code` or see [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code).
- **A code editor** — VS Code recommended. Claude Code integrates directly with VS Code via the Claude Code extension.
- **Git** — Version control is essential for the handoff protocol and QuestLog history.

### Recommended

- **MCP servers** — Model Context Protocol servers extend Claude's capabilities (file system access, web search, etc.). The framework works without them but Tarnoth can help configure MCPs for enhanced workflows.
- **Skills** — Project-local markdown files (`.claude/skills/*.md`) that define reusable prompts and workflows. Useful for encoding project-specific patterns.
- **Plugins** — External slash command packages that add capabilities like `/code-review` and `/local-review`. See [agent37-skills-collection](https://github.com/Agent-3-7/agent37-skills-collection) for examples.

### Assumptions

This framework assumes you:
- Are comfortable with command-line tools
- Have basic Git knowledge (commits, branches)
- Understand that Claude sessions don't persist context — hence the emphasis on written artifacts
- Are willing to read and write markdown documents as part of your workflow

---

## Getting Started

See [COUNCIL.md](COUNCIL.md) for dragon definitions, invocation patterns, and operational details.
