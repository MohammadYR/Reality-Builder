# Reality Builder

**Reality Builder** is a cross-platform (Web & Desktop) application designed to automate the creation, testing, and deployment of VLESS+Reality VPN configurations, optimized for bypassing internet censorship.

## Features (Planned & In-Progress)

*   **Cross-Platform:** Accessible via Web (modern browsers) and Desktop (Windows, macOS, Linux via Tauri).
*   **Easy Authentication:**
    *   Guest Mode: Try the app without registration.
    *   Simple Email/Password signup.
    *   (Planned) OAuth with Google/GitHub.
*   **Multi-Profile Management:** Save and load multiple VPN configurations.
*   **Server Configuration Generator:**
    *   Input VPS IP (or use Cloudflare IP Scanner).
    *   Configure port, SNI.
    *   Auto-generates UUID and x25519 key pairs (via `xray` utilities - integration pending).
    *   Downloadable `config.json` for Xray-core.
*   **IP Scanner Module:**
    *   Fetches latest Cloudflare IP ranges.
    *   (Planned) Integrates `xray-knife` to test IPs with Reality configuration.
    *   (Planned) Ranks IPs by latency, packet loss, and whitelist status.
*   **Client Configuration & Export:**
    *   Generates `vless://` links.
    *   QR code export for mobile clients.
    *   (Planned) Copyable CLI snippets for various clients (v2rayNG, Clash, etc.).
*   **Connection Tester:**
    *   (Planned) Behind-the-scenes tests (`curl --resolve`, `xray-knife probe`, ping).
    *   Real-time status indicators.
*   **Deployment Automation:**
    *   Downloadable `install.sh` script template for VPS setup.
    *   (Planned) Dynamic script generation with user config.
    *   (Planned) Auto-update `xray-knife` & `xray-core` on VPS.
*   **User Experience:**
    *   Responsive design (Tailwind CSS).
    *   Persian/English language toggle.
    *   Step-by-step workflow.
    *   (Planned) Notifications & logs panel.

## Project Structure

*   `reality-builder/`
    *   `AGENTS.md`: Instructions for AI development agents.
    *   `web-app/`: Next.js (React) frontend application.
        *   `src/`: Main source code for the web app.
            *   `app/`: Next.js App Router (pages, layouts, API routes).
            *   `components/`: Reusable React components.
            *   `contexts/`: React Context providers (Auth, Language).
            *   `firebase/`: Firebase configuration and initialization.
            *   `utils/`: Utility functions.
        *   `public/`: Static assets for the web app.
    *   `desktop-app/`: Tauri desktop application wrapper.
        *   `src-tauri/`: Rust backend for the Tauri app.
        *   `tauri.conf.json`: Tauri application configuration.
    *   `cli-bridge/`: (Placeholder) For future logic to interact with `xray` binaries.
    *   `docs/`: (Placeholder) For more detailed documentation.
    *   `scripts/`: (Placeholder) For utility and build scripts.

## Tech Stack

*   **Web Frontend:** Next.js (React) with TypeScript, Tailwind CSS.
*   **Backend/Auth:** Firebase (Authentication, Firestore, Functions - planned).
*   **Desktop App:** Tauri (Rust backend, webview frontend).
*   **VPN Core:** Xray-core, xray-knife.

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm/yarn/pnpm
*   Rust (for Tauri desktop development - `https://www.rust-lang.org/tools/install`)
*   (For Desktop) OS-specific WebView2/WebKitGTK dependencies for Tauri. See [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites).
*   A Firebase project (set up Authentication with Email/Password, Firestore).

### Web Application (`web-app`)

1.  **Navigate to the web app directory:**
    ```bash
    cd web-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```
3.  **Firebase Setup:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable Email/Password authentication in the Firebase console (Authentication > Sign-in method).
    *   Enable Firestore database (Firestore Database > Create database - start in test mode for easy setup, then configure security rules).
    *   Copy your Firebase project configuration (Project Settings > General > Your apps > Web app) into `web-app/src/firebase/config.ts`. Replace the placeholder values.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The web app should be available at `http://localhost:3000`.

### Desktop Application (`desktop-app`) - (Tauri)

**Important:** Ensure the web app's dev server is running (`cd web-app && npm run dev`) before starting the Tauri dev environment, as it loads the web content from `http://localhost:3000`.

1.  **Navigate to the desktop app directory:**
    ```bash
    cd desktop-app
    ```
2.  **(If not already done by Tauri CLI) Install Tauri CLI and dependencies:**
    While the project structure is pre-configured, if you were setting this up from scratch or encounter issues, you might need:
    ```bash
    # Install Tauri CLI (if not globally installed)
    # npm install --save-dev @tauri-apps/cli
    # Then initialize if needed (though files are present, so this might not be necessary)
    # npx tauri init
    ```
3.  **Run the Tauri development environment:**
    ```bash
    npm run tauri dev
    # or
    # cargo tauri dev
    ```
    This will compile the Rust backend and launch the desktop application window.

4.  **Building the Desktop Application:**
    ```bash
    npm run tauri build
    # or
    # cargo tauri build
    ```
    This will first build the web app (using `beforeBuildCommand` in `tauri.conf.json`) and then bundle it into a desktop application for your target platform.

## Contributing

(Placeholder - Details on how to contribute, coding standards, etc.)

## License

(Placeholder - e.g., MIT License)

---
*This README is a work in progress and will be updated as the project develops.*
