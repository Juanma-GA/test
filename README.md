# BRDP Manager

A comprehensive Business Rules Decision Points (BRDP) management system for S1000D and DITA technical documentation projects. Manage BRDP records, validate technical decisions, generate BREX Data Modules and Schematron files, and interact with an AI assistant for expert guidance.

## Features

- **BRDP Records Management** — Import, search, filter, sort, and export BRDP records
- **BREX Generation** — Generate BREX Data Modules for S1000D 4.2 and 3.0.1
- **Schematron Generation** — Generate Schematron 1.0 validation schemas
- **AI Assistant** — Expert guidance on S1000D, DITA, and technical documentation
- **Multi-Provider LLM Support** — Anthropic Claude, OpenAI, Mistral, or custom endpoints
- **Project Configuration** — Manage S1000D project metadata and identifiers
- **Excel Import/Export** — Bulk import and export BRDP records
- **Notes System** — Attach persistent notes to BRDP records
- **Local Data Persistence** — All data saved in SQLite database on disk

## Requirements

- **Node.js** 20 or higher
- **npm** 9 or higher

## Installation

```bash
git clone 
cd brdp-manager
npm install
```

## Quick Start (Production)

```bash
npm run build
npm start
```

Open http://localhost:3000 in your browser.

To use a different port:
```bash
PORT=8080 npm start
```

## Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

> In development mode, the Vite dev server handles proxying. In production, Express handles everything.

## Configuration

### AI Configuration

1. Go to **Settings** → **AI Configuration**
2. Select your provider (Anthropic, OpenAI, Mistral, or Custom)
3. Enter your API key and model name
4. Optionally enter a custom endpoint
5. Click **Save** then **Test Connection** to verify

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
3. Click **Save Configuration**

## Usage

### Managing BRDPs

1. **Import**: Settings → Data Management → Choose Excel file
2. **Search**: Use the search bar to find specific BRDPs
3. **Filter**: Filter by validation status (All, Validated, Refused, Pending)
4. **View/Edit**: Click a row to see full details, edit fields, and add notes
5. **Export**: Export to Excel or CSV format

### Generating BREX / Schematron

1. Click **Generate BREX / Schematron** in the header
2. Select the output format:
   - `BREX — S1000D 4.2`
   - `BREX — S1000D 3.0.1`
   - `Schematron 1.0`
3. Click **Generate** — the LLM will produce the output using your validated BRDPs as input
4. Download the resulting file

### Using the AI Assistant

1. Click **BRDP Assistant** in the header
2. Ask questions about your BRDPs, S1000D rules, or DITA

## Data

All data is stored in a SQLite database at `data/brdp.db`. This file is created automatically on first run.

**Backup**: Copy `data/brdp.db` to keep a backup of all your BRDPs and configuration.

**Reset**: Use Settings → Reset data → **Reset to demo data** to restore the original demo dataset.

## Docker

```bash
docker-compose up --build
```

Open http://localhost:8080 in your browser.

> Note: The Docker setup uses nginx and does not include the Express server or SQLite persistence. It is suitable for demo/preview purposes only.

## Project Structure

```
brdp-manager/
├── src/
│   ├── api/                   # LLM generators (generateBREX, generateBREX301, generateBREXSch)
│   ├── components/            # React components
│   ├── context/               # BRDPContext (global state)
│   ├── db/                    # SQLite schema and database connection
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   └── services/              # API service layer (REST calls to Express)
├── public/                    # Static assets and schema JSON files
├── data/                      # SQLite database (auto-created, not in git)
├── server.js                  # Express server (production)
└── dist/                      # Vite build output (not in git)
```

## License

Proprietary — All rights reserved
