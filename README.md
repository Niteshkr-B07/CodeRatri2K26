# SafeTrip

SafeTrip is a mobile-first travel and commuter safety platform. It combines Trip Guardian monitoring, explainable route safety scoring, community hazard reports, trusted contacts, emergency escalation, and optional Gemini-powered safety guidance in one focused experience.

## Highlights

- Trip Guardian with configurable location check-ins and battery-aware polling
- Route safety scores based on explainable signals rather than opaque predictions
- Community reports for hazards and unsafe conditions
- Trusted contacts and one-tap SOS flows for urgent situations
- Google Maps integration with place search and route visualization
- Gemini AI guidance with a rule-based fallback when no API key is configured
- Firebase authentication and Firestore security rules for production integration

## Requirements

- Node.js 20 or newer
- npm
- A Google Maps API key for map and place features
- A Gemini API key for live AI guidance (optional; fallback guidance still works)

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   copy .env.example .env
   ```

   Set `VITE_GOOGLE_MAPS_API_KEY` and, optionally, `GEMINI_API_KEY` in `.env`. Never commit `.env` or real API keys.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Express and Vite development server |
| `npm run build` | Create a production client build |
| `npm run start` | Start the server in production mode |
| `npm run preview` | Preview the Vite production build |
| `npm run lint` | Run the TypeScript compiler without emitting files |

## Project structure

```text
src/
  components/   Feature views, modals, navigation, and reusable UI
  services/     Firebase, Gemini, scoring, sound, and storage integrations
  App.tsx       Application shell and state orchestration
  types.ts      Shared domain types
server.ts       Express API proxy and production host
firestore.rules Firestore access rules
```

Each source folder includes its own README with ownership and extension guidance.

## Safety note

SafeTrip is an assistance tool, not a guarantee of personal safety. Route scores and AI responses are advisory. In an active emergency, contact local emergency services immediately.

## License

This project is currently distributed for evaluation and development. Add a project-specific license before publishing it for external reuse.
