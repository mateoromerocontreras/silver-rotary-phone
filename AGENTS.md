# AGENTS.md

## Cursor Cloud specific instructions

This is a **React Native + Expo (SDK 56)** personal finance mobile app built with TypeScript.

### Quick reference

- **Dev server:** `npx expo start --web --port 8081` (web preview for development)
- **Type check:** `npx tsc --noEmit`
- **Package manager:** npm (see `package-lock.json`)

### Architecture

- **Routing:** Expo Router v4 with file-based routes in `app/`
- **State:** Zustand (`src/stores/`) for UI state, TanStack Query for server state
- **Theme:** Custom iOS-style theme system in `src/theme/` with dark/light mode
- **API:** Mock API layer in `src/api/` — no real backend required for development
- **Components:** Reusable UI primitives in `src/components/ui/`, shared domain components in `src/components/shared/`

### Gotchas

- The app defaults to **dark mode**. Theme toggle is in the Profile tab.
- Mock API has artificial delays (200-800ms) to simulate real network calls.
- The `@/` path alias maps to the project root (configured in `tsconfig.json`).
- Web preview uses port 8081 by default. Expo may prompt for a different port if 8081 is occupied.
- `expo-haptics` and `expo-secure-store` are installed but only functional on native (iOS/Android), not web.
