# Handoff: Test Framework Configuration

**From:** Vaelthrix the Astral
**To:** Tarnoth the Bronze
**Date:** 2026-01-09
**Related Quest:** [QuestBoard - Tarnoth tasks](../QuestBoard.md)

---

## Context

VibeDeck has zero automated tests. The code review flagged this as an architectural concern. While not blocking MVP, a test framework should be configured for future development.

---

## Task: Configure Jest + React Native Testing Library

**Status:** Not started

### Objective

Set up the testing infrastructure so dragons can write tests as they work. Not writing tests now — just making it possible.

### Stack

- **Test runner:** Jest
- **React Native testing:** React Native Testing Library
- **Mocking:** Jest mocks for native modules

### Deliverables

1. **Install dependencies**
   - `jest`
   - `@testing-library/react-native`
   - `@types/jest`
   - Any Expo-specific Jest presets

2. **Configure Jest**
   - `jest.config.js` with React Native preset
   - Transform configuration for TypeScript
   - Module name mapping for path aliases
   - Setup file for global mocks

3. **Mock native modules**
   - `react-native-track-player`
   - `expo-file-system`
   - `expo-document-picker`
   - `expo-sqlite`
   - Custom SAF permissions module

4. **Create example test**
   - One simple component test to verify setup works
   - Suggest: `CountBadge.test.tsx` (pure component, easy to test)

5. **Add npm scripts**
   - `npm test` — run all tests
   - `npm test:watch` — watch mode
   - `npm test:coverage` — coverage report

### Gotchas

- Expo has specific Jest configuration requirements
- Native modules need manual mocks
- SQLite mocking is tricky — may need in-memory approach
- TrackPlayer has async initialization

### Reference

- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

### Priority

Low — infrastructure work. MVP is functional without tests. But having the framework ready means tests can be added incrementally.

---

## Success Criteria

- [ ] `npm test` runs without error
- [ ] Example test passes
- [ ] Native module mocks don't throw
- [ ] Documentation in README or `docs/TESTING.md`

---

*Handed off by Vaelthrix the Astral*
