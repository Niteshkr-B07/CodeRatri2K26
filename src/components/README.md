# Components

This directory contains SafeTrip's feature views and reusable interface components. Components cover navigation, trip setup and monitoring, maps, emergency flows, reports, trusted contacts, account settings, and modal experiences.

## Conventions

- Keep components focused on presentation and user interaction.
- Pass domain data through typed props and callbacks.
- Put persistence, API calls, scoring, and other integration logic in `../services/`.
- Keep emergency actions clear and accessible on small screens.
