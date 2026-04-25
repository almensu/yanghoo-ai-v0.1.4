# Repository Guidelines

## Project Structure & Module Organization

This is a local full-stack media workflow app. Backend code lives in `backend/src/`: FastAPI routes, task runners, utilities, schemas, and data helpers. Frontend code lives in `frontend/src/`: components, pages, hooks, and utilities. Tests and manual checks are under `backend/tests/` and `frontend/tests/manual/`. Documentation is in `docs/`; task specs and reports are in `tasks/`. Runtime media, metadata, transcripts, and caches belong under `backend/data/` and should not be committed.

## Task Workflow

The `tasks/` directory is the work ledger. Root files such as `tasks/2026-04-25-stage-6-youtube-transcript-engine-upgrade.md` define scoped implementation or audit assignments. Completed work writes a matching report under `tasks/reports/`, usually with the same date/stage and `-report.md`. Shared research or copied references belong in `tasks/reference/`. Read the task first, implement against its acceptance criteria, then report changes, verification, and remaining risks.

## Build, Test, and Development Commands

- `conda activate auto_ai_subtitle-v0.0.9`: activate the expected backend environment.
- `./start.sh`: install/check dependencies and start FastAPI on `http://localhost:8000/docs` plus React on `http://localhost:3000/`.
- `./stop.sh`: stop the local backend and frontend processes.
- `cd frontend && npm install`: install React dependencies.
- `cd frontend && npm start`: run only the frontend dev server.
- `cd frontend && npm test`: run CRA/Jest frontend tests.
- `cd frontend && npm run build`: create a production frontend build.
- `python -m py_compile backend/src/main.py backend/src/schemas.py`: quick backend syntax check.

## Coding Style & Naming Conventions

Use Python 3 with 4-space indentation, type hints where practical, and snake_case for modules, functions, and variables. Keep FastAPI response models in `backend/src/schemas.py`. React components use PascalCase, hooks use `useSomething.js`, and utilities should match nearby naming. Prefer existing patterns over new abstractions.

## Testing Guidelines

Backend tests are script-style Python checks named `test_*.py`, for example `python backend/tests/test_stage6_algorithm.py`. Add focused tests for transcript timing, metadata paths, and migrations. Frontend tests use Jest and React Testing Library through `npm test`.

## Commit & Pull Request Guidelines

Git history uses prefixes such as `feat:`, `fix:`, `docs:`, `chore:`, and `refactor:`. Keep commits scoped, for example `fix: repair stage6 transcript timestamp mapping`. PRs should include a summary, affected areas, test commands, linked task files or issues, and screenshots for UI changes.

## Security & Configuration Tips

Do not commit `backend/data/`, generated transcripts, media files, logs, secrets, or local environment artifacts. Treat external media URLs and generated subtitles as untrusted input; validate paths before reading or writing files.
