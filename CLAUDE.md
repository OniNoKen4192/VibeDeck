# [VibeDeck]


## Project Overview

VibeDeck is an audio player designed to make managing music and sounds at a sporting event for parents easier, offloading mental stress and making the task fun. VibeDeck is a tagbased, button board style audio player. 

**Target platform:** Android

## Core Concepts

### [VibeDeck Domain]
Tag — User-created label applied to tracks. A track can have multiple tags.
Tag Button — Button that plays a random unplayed track matching that tag.
Direct Button — Button that plays a specific track. No randomization, no played-flag logic.
Persistent — Attribute of any button. Pinned to always appear on the button board.
Played Flag — Marks a track as used this session. Applies to tag button pool logic only. Manual reset.
Button Board — The game screen UI: grid of tag buttons and direct buttons.

### [Audio Playback Fundamentals]
* Track — A single audio file with metadata
* Playlist — Ordered collection of tracks
* Playback State — Playing, paused, stopped
* Seek Position — Current time within a track
* Output Device — Audio destination (speakers, Bluetooth endpoint)
* Volume — Output level, 0-100
* Library (the collection of all imported tracks)

### [Concept 3]
[Continue as needed for your domain vocabulary]

## Technical Architecture

### Stack
- **Framework:** React Native with TypeScript
- **State management:** Zustand
- **Persistence:** SQLite (expo-sqlite)
- **Audio:** react-native-track-player
- **File handling:** expo-file-system

### Data Models

See [docs/DATAMODEL.md](docs/DATAMODEL.md) for entity definitions and relationships.


### File Structure


## Code Style

TypeScript strict mode enforced via tsconfig. Prettier and ESLint configured in project root. Follow existing patterns in codebase.

## Development Process

This project uses the Council of Dragons agent framework. See [council/COUNCIL.md](council/COUNCIL.md) for agent definitions and invocation patterns.

**Quick summon:** `Read CLAUDE.md and council/COUNCIL.md. You are [Name] the [Color]. [Task].`

### Council Documents

| Document | Purpose |
|----------|---------|
| [council/COUNCIL.md](council/COUNCIL.md) | Dragon definitions and invocation patterns |
| [council/QuestBoard.md](council/QuestBoard.md) | Active tasks by dragon |
| [council/QuestLog.md](council/QuestLog.md) | Completed task history |
| [council/GIT_WORKFLOW.md](council/GIT_WORKFLOW.md) | Git conventions and handoff protocol |

## Default Agent

When starting a new session, assume the role of **Vaelthrix the Astral** (Architect) unless explicitly told otherwise.

### Session Start Protocol

1. Read [council/QuestLog.md](council/QuestLog.md) to understand recent work
2. Read [council/QuestBoard.md](council/QuestBoard.md) to understand next efforts
3. Adhere to the SOP found in [council/GIT_WORKFLOW.md](council/GIT_WORKFLOW.md) for commit and handoff conventions
4. Greet the project lead briefly (in character)
5. Seek understanding the task at the architectural level before any implementation discussion
6. Begin work according to the handoff protocol
