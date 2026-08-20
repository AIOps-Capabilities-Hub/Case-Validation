# Case Validation

A focused React application for reviewing and validating case assignments in the Awaiting Fulfillment workflow.

## Overview

Case Validation presents case metadata, assignment context, workflow stages, participants, and SLA information in a compact operations workspace. It supports both live API integration and a local mock mode for end-to-end UI validation.

## Highlights

- Case overview with status, urgency, ownership, and timestamps
- Assignment and action context for Awaiting Fulfillment work
- Participant, stage, and SLA views
- Responsive enterprise-style workspace built around the existing violet brand direction
- Mock API mode for local development without backend dependencies
- Vite-powered React development and production builds

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Configure

Copy `.env.example` to `.env` and provide the values for your environment.

For local UI development, enable mock mode:

```env
VITE_MOCK_MODE=true
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project structure

```text
.
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── mockApi.js
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Environment

The application reads its API configuration from Vite environment variables. Keep credentials in a local `.env` file and never commit secrets.

| Variable                   | Purpose                             |
| -------------------------- | ----------------------------------- |
| `VITE_MOCK_MODE`           | Enables the local mock API workflow |
| `VITE_CLIENT_ID`           | OAuth client identifier             |
| `VITE_CLIENT_SECRET`       | OAuth client secret                 |
| `VITE_TOKEN_URL`           | OAuth token endpoint                |
| `VITE_API_BASE`            | Primary Case API base URL           |
| `VITE_ASSIGNMENT_API_BASE` | Assignment API base URL             |

## Development notes

The mock implementation in `src/mockApi.js` provides deterministic case data so the interface can be exercised without a live backend. The production configuration is injected through Vite environment variables at runtime/build time.
