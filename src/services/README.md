# Services

This directory contains the application integrations and domain helpers used by the SafeTrip UI.

- `firebase.ts` handles Firebase authentication and Firestore access.
- `gemini.ts` calls the server-side AI guidance endpoint.
- `scoring.ts` calculates explainable route safety scores.
- `sound.ts` manages safety-related audio feedback.
- `storage.ts` handles local persistence and demo data.

Keep secrets in environment variables and preserve graceful fallbacks when an external service is unavailable.
