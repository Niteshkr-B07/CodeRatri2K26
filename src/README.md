# Source

The `src` directory contains the client-side SafeTrip application. `App.tsx` owns the application shell, navigation state, and coordination between feature views. `types.ts` defines shared domain models used across the UI and services.

## Extension guidance

Keep reusable UI in `components/`, integration and persistence logic in `services/`, and shared data contracts in `types.ts`. Avoid placing API keys or environment-specific values in source files.
