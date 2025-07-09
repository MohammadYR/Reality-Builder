This is an agent-driven project.

## Project Structure:
- `web-app/`: Contains the Next.js frontend.
- `desktop-app/`: Will contain the Tauri or Electron wrapper.
- `cli-bridge/`: Will contain the logic for interacting with xray binaries.
- `docs/`: For documentation.
- `scripts/`: For utility scripts (e.g., deployment).

## Tech Stack Choices:
- Web: Next.js with TypeScript and Tailwind CSS
- Backend: Firebase (Auth, Firestore, Functions, Hosting)
- Desktop: Tauri (preferred, fallback to Electron)
- CLI Interaction: Local execution or REST API to a backend function.

## Development Guidelines:
- Follow conventional commits.
- Write tests for new features.
- Ensure code is well-documented.
- Prioritize modularity and reusability.
