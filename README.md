# BRDP Manager

A comprehensive business rules document (BRDP) management system for S1000D and DITA documentation projects. Manage BRDP records, validate technical decisions, and interact with AI assistants for expert guidance.

## Features

- **BRDP Records Management** — Import, search, filter, sort, and export BRDP records
- **AI Assistant Chat** — Get expert guidance on S1000D, DITA, and technical documentation
- **Multi-Provider LLM Support** — Configure Anthropic Claude, OpenAI, or custom API endpoints
- **Project Configuration** — Manage S1000D project metadata and identifiers
- **Excel Import/Export** — Bulk import and export BRDP records
- **Notes System** — Attach persistent notes to BRDP records
- **Local Data Persistence** — All data saved locally in localStorage

## Quick Start

### Run with Docker

```bash
docker-compose up --build
```

Open http://localhost:8080 in your browser.

### Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Configuration

### AI Configuration

1. Go to **Settings** → **AI Configuration**
2. Select your provider (Anthropic Claude, OpenAI, or Custom)
3. Enter your API key and model name
4. Click "Test Connection" to verify

### Project Configuration

1. Go to **Settings** → **Project Configuration**
2. Enter your S1000D project details:
   - Project Name
   - Model Ident Code (CAGE code)
   - System Diff Code (default: A)
   - Issue Number (default: 001)
   - Language and Country ISO codes
   - Security Classification
   - Enterprise Code
3. Click "Save Configuration"

## Usage

### Managing BRDPs

1. **Import**: Go to Settings → Data Management to import an Excel file
2. **Search**: Use the search bar to find specific BRDPs
3. **Filter**: Filter by validation status (All, Validated, Refused, Pending)
4. **Sort**: Click column headers to sort
5. **View Details**: Click a row to see full details and add notes
6. **Export**: Export to Excel or CSV format

### Using the AI Assistant

1. Click the 💬 button in the header or "Ask AI about this BRDP" in the detail panel
2. Ask questions about your BRDP records, S1000D, DITA, or technical documentation
3. Use "Generate Output" to configure BREX or Schematron output (coming soon)

## Build & Deploy

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory.

### Docker Production Build

The included `Dockerfile` uses a two-stage build:
1. **Build Stage**: Compiles the React app with Vite
2. **Serve Stage**: Uses lightweight nginx to serve the built app

```bash
docker-compose up --build -d
```

## Environment

- **Node.js**: 20+ (for development and Docker)
- **Browser**: Modern browser with ES2020+ support
- **Storage**: localStorage for data persistence
- **API**: Optional Anthropic, OpenAI, or custom LLM endpoints

## License

Proprietary - All rights reserved
