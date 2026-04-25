# Yanghoo AI Project (v0.2.0)

Yanghoo AI is a local full-stack application for ingesting media tasks, managing generated transcripts/documents, previewing subtitles, and working with AI-assisted analysis.

## Project Structure

```text
.
├── backend/                 # FastAPI backend
│   ├── src/                 # Backend application code and task modules
│   ├── scripts/             # One-off maintenance and migration scripts
│   ├── tests/manual/        # Manual backend checks
│   └── tests/fixtures/      # Small manual-test fixtures
├── frontend/                # React app created with Create React App
│   ├── src/                 # React pages, components, hooks, and utilities
│   ├── public/              # Static CRA public assets
│   └── tests/manual/        # Manual frontend test assets
├── docs/                    # Project notes and design documentation
├── archive/                 # Historical backups and release reference files
├── requirements.txt         # Backend Python dependencies
├── start.sh                 # Local development startup script
└── stop.sh                  # Local development shutdown script
```

## Setup

Install backend dependencies from `requirements.txt` in the expected Python environment. The current startup script expects the conda environment named `auto_ai_subtitle-v0.0.9`.

Install frontend dependencies from `frontend/package.json`:

```bash
cd frontend
npm install
```

## Running Locally

From the project root:

```bash
./start.sh
```

The script starts:

- Backend API: `http://localhost:8000/docs`
- Frontend app: `http://localhost:3000/`

To stop both local services:

```bash
./stop.sh
```

## Data Directory

Runtime task data is stored under `backend/data/`. This directory is intentionally ignored by Git because it can contain generated metadata, downloaded media, transcripts, and other local processing outputs.
