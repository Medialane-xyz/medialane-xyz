# AGENTS.md

## Project Overview

Medialane.xyz is a monetization hub for the Creator Economy, built on the "Integrity Web". It facilitates the creation and trading of financial assets like IP Coins and Creator Coins through a Creator Launchpad and IP Marketplace. The platform emphasizes creator sovereignty, decentralized identity, and programmable licensing.

## Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript
-   **Blockchain**: Starknet (via `@starknet-react/core`)
-   **Authentication**: Clerk
-   **Payments**: Chipi Pay
-   **Styling**: Tailwind CSS, Radix UI
-   **Animations**: Framer Motion
-   **Validation**: Zod, React Hook Form

## Build & Run Commands

-   **Install Dependencies**: `npm install --force`
-   **Development Server**: `npm run dev`
    -   Starts the local development server at `http://localhost:3000`.
-   **Build for Production**: `npm run build`
    -   Compiles the application for production deployment.
-   **Start Production Server**: `npm run start`
    -   Runs the built application in production mode.
-   **Lint Code**: `npm run lint`
    -   Runs ESLint to check for code quality issues.

## Testing Instructions

Currently, the project relies primarily on manual testing during development.
-   **Run Tests**: There are no automated test scripts (`test` script is missing in `package.json`).
-   **Manual Verification**: Verify changes by running the development server and interacting with the UI at `http://localhost:3000`.

## Code Style & Guidelines

-   **TypeScript**: Explicit types are encouraged. Avoid `any`.
-   **Tailwind CSS**: Use utility classes for styling. Configure custom themes in `tailwind.config.ts`.
-   **Components**: Reusable UI components are located in `src/components/ui`.
-   **ESLint**: Follow the rules defined in `.eslintrc.json` or `eslint.config.mjs`.

## Project Structure

-   `src/app/`: App Router pages and layouts.
-   `src/components/`: React components.
    -   `ui/`: Generic, reusable UI components.
-   `src/lib/`: Utility functions and shared logic.
-   `src/hooks/`: Custom React hooks.
-   `src/styles/`: Global CSS files.
-   `public/`: Static assets.

## Environment Variables

Ensure `.env.local` is configured with:
-   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
-   `NEXT_PUBLIC_CHIPI_API_KEY`
